// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BattleManager.sol";

/**
 * @title BettingPool
 * @notice Handles betting, leverage, and payouts for battles (live odds)
 */
contract BettingPool is Ownable, ReentrancyGuard {
    
    /// @notice Bet position
    struct Bet {
        uint256 battleId;
        address bettor;
        address predictedWinner;
        uint256 amount;
        uint256 leverage; // 1x = 100, 10x = 1000, 50x = 5000
        uint256 timestamp;
        bool settled;
        bool cashedOut;
        bool liquidated;
    }
    
    /// @notice Pool for a specific battle + token
    struct Pool {
        uint256 totalAmount;
        uint256 betCount;
    }
    /// @notice Battle Manager contract
    BattleManager public battleManager;
    
    /// @notice COC Token
    IERC20 public cocToken;
    
    /// @notice Platform liquidity reserve for leverage payouts
    uint256 public platformReserve;

    /// @notice Total pooled amount across all open bets
    uint256 public totalPooledAmount;

    /// @notice Total open exposure across all open bets
    uint256 public totalOpenExposure;

    /// @notice Total committed exposure across all battles
    uint256 public totalCommittedExposure;

    /// @notice Committed exposure per battle
    mapping(uint256 => uint256) public battleExposureCommitted;
    
    /// @notice Counter for bet IDs
    uint256 public betCounter;
    
    /// @notice Mapping of bet ID to Bet
    mapping(uint256 => Bet) public bets;
    
    /// @notice Mapping of user to their bet IDs
    mapping(address => uint256[]) public userBets;
    
    /// @notice Mapping: battleId => token => Pool
    mapping(uint256 => mapping(address => Pool)) public pools;

    /// @notice Open bets per battle
    mapping(uint256 => uint256) public openBets;

    /// @notice Snapshot of total pool at battle end for settlement
    mapping(uint256 => uint256) public battleTotalPoolSnapshot;

    /// @notice Snapshot of winner pool at battle end for settlement
    mapping(uint256 => uint256) public battleWinnerPoolSnapshot;

    /// @notice Snapshot of winner token at battle end
    mapping(uint256 => address) public battleWinnerTokenSnapshot;

    /// @notice Track whether fees have been distributed for a battle
    mapping(uint256 => bool) public battleFeesDistributed;
    
    /// @notice Fee percentages (basis points: 10000 = 100%)
    uint256 public winnerPoolBps = 8000;   // 80%
    uint256 public platformFeeBps = 1000; // 10%
    uint256 public deployerFeeBps = 500;  // 5% total (2.5% each)
    uint256 public stakerFeeBps = 500;    // 5%
    
    /// @notice Minimum bet amount (in COC tokens)
    uint256 public minBetAmount;
    
    /// @notice Maximum leverage (5000 = 50x)
    uint256 public maxLeverage = 5000;
    
    /// @notice Staking contract address
    address public stakingContract;

    /// @notice Platform fee wallet
    address public platformWallet;

    /// @notice Minimum pool depth required for leverage > 1x
    uint256 public minPoolForLeverage = 100e18;
    
    /// Events
    event BetPlaced(
        uint256 indexed betId,
        uint256 indexed battleId,
        address indexed bettor,
        address predictedWinner,
        uint256 amount,
        uint256 leverage
    );
    
    event BetSettled(uint256 indexed betId, uint256 payout);
    event BetCashedOut(uint256 indexed betId, uint256 amount);
    event BetLiquidated(uint256 indexed betId, uint256 amount);
    event ReserveDeposited(uint256 amount);
    event ReserveWithdrawn(uint256 amount);
    event PlatformWalletUpdated(address indexed newPlatformWallet);
    event StakingContractUpdated(address indexed newStakingContract);
    event MinPoolForLeverageUpdated(uint256 newMinPoolForLeverage);
    
    /**
     * @notice Constructor
     */
    constructor(
        address _battleManager,
        address _cocToken,
        uint256 _minBetAmount
    ) Ownable(msg.sender) {
        battleManager = BattleManager(_battleManager);
        cocToken = IERC20(_cocToken);
        minBetAmount = _minBetAmount;
    }
    
    /**
     * @notice Place a bet on a battle
     */
    function placeBet(
        uint256 _battleId,
        address _predictedWinner,
        uint256 _amount,
        uint256 _leverage
    ) external nonReentrant returns (uint256) {
        require(battleManager.hasAccess(msg.sender), "No access");
        require(_amount >= minBetAmount, "Below min bet");

        uint256 maxLeverageForBattle = getMaxLeverage(_battleId);
        require(_leverage >= 100 && _leverage <= maxLeverageForBattle, "Invalid leverage");
        
        BattleManager.Battle memory battle = _getBattle(_battleId);
        require(battle.status == BattleManager.BattleStatus.Active, "Battle not active");
        require(block.timestamp >= battle.startTime, "Battle not started");
        require(block.timestamp <= battle.endTime, "Battle ended");
        require(
            _predictedWinner == battle.token1 || _predictedWinner == battle.token2,
            "Invalid token"
        );
        
        // Transfer tokens from bettor
        require(
            cocToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        uint256 exposure = _calculateExposure(_amount, _leverage);
        uint256 newTotalPooled = totalPooledAmount + _amount;
        require(
            totalCommittedExposure + exposure <= newTotalPooled + platformReserve,
            "Exposure cap exceeded"
        );

        if (_leverage > 100) {
            uint256 poolSelf = pools[_battleId][_predictedWinner].totalAmount + _amount;
            address otherToken = _predictedWinner == battle.token1 ? battle.token2 : battle.token1;
            uint256 poolOther = pools[_battleId][otherToken].totalAmount;
            require(poolSelf >= minPoolForLeverage && poolOther >= minPoolForLeverage, "Pool too shallow");
        }

        totalPooledAmount = newTotalPooled;
        totalOpenExposure += exposure;
        totalCommittedExposure += exposure;
        battleExposureCommitted[_battleId] += exposure;
        
        // Create bet
        betCounter++;
        uint256 betId = betCounter;
        
        bets[betId] = Bet({
            battleId: _battleId,
            bettor: msg.sender,
            predictedWinner: _predictedWinner,
            amount: _amount,
            leverage: _leverage,
            timestamp: block.timestamp,
            settled: false,
            cashedOut: false,
            liquidated: false
        });
        
        userBets[msg.sender].push(betId);
        
        // Update pool
        pools[_battleId][_predictedWinner].totalAmount += _amount;
        pools[_battleId][_predictedWinner].betCount++;

        openBets[_battleId] += 1;

        battleManager.recordBet(_battleId, _amount);
        
        emit BetPlaced(
            betId,
            _battleId,
            msg.sender,
            _predictedWinner,
            _amount,
            _leverage
        );
        
        return betId;
    }
    
    /**
     * @notice Settle a bet after battle completion
     */
    function settleBet(uint256 _betId) external nonReentrant {
        Bet storage bet = bets[_betId];
        require(!bet.settled, "Already settled");
        require(!bet.cashedOut, "Already cashed out");
        require(!bet.liquidated, "Already liquidated");
        
        BattleManager.Battle memory battle = _getBattle(bet.battleId);
        require(battle.status == BattleManager.BattleStatus.Completed, "Battle not complete");

        if (battleTotalPoolSnapshot[bet.battleId] == 0) {
            uint256 pool1 = pools[bet.battleId][battle.token1].totalAmount;
            uint256 pool2 = pools[bet.battleId][battle.token2].totalAmount;
            battleTotalPoolSnapshot[bet.battleId] = pool1 + pool2;
            battleWinnerPoolSnapshot[bet.battleId] = pools[bet.battleId][battle.winner].totalAmount;
            battleWinnerTokenSnapshot[bet.battleId] = battle.winner;
        }

        uint256 payout = 0;
        if (bet.predictedWinner == battle.winner) {
            payout = _calculateSettlementPayout(bet, battle);
        }

        bet.settled = true;
        _closePosition(bet);

        if (payout > 0) {
            require(cocToken.transfer(bet.bettor, payout), "Payout failed");
        }

        emit BetSettled(_betId, payout);
    }
    
    /**
     * @notice Cash out bet early with live odds and 10% penalty
     */
    function cashOutBet(uint256 _betId) external nonReentrant {
        Bet storage bet = bets[_betId];
        require(bet.bettor == msg.sender, "Not bettor");
        require(!bet.settled, "Already settled");
        require(!bet.cashedOut, "Already cashed out");
        require(!bet.liquidated, "Already liquidated");
        
        BattleManager.Battle memory battle = _getBattle(bet.battleId);
        require(battle.status == BattleManager.BattleStatus.Active, "Battle not active");
        require(block.timestamp <= battle.endTime, "Battle ended");
        
        uint256 livePayout = _calculateLivePayout(bet, battle);
        uint256 cashoutAmount = (livePayout * 90) / 100; // 10% penalty

        _closePosition(bet);
        bet.cashedOut = true;
        
        require(cocToken.transfer(msg.sender, cashoutAmount), "Cashout failed");
        emit BetCashedOut(_betId, cashoutAmount);
    }

    /**
     * @notice Liquidate under-margined bet (admin only)
     */
    function liquidate(uint256 _betId) external onlyOwner nonReentrant {
        Bet storage bet = bets[_betId];
        require(!bet.settled, "Already settled");
        require(!bet.cashedOut, "Already cashed out");
        require(!bet.liquidated, "Already liquidated");

        BattleManager.Battle memory battle = _getBattle(bet.battleId);
        require(battle.status == BattleManager.BattleStatus.Active, "Battle not active");
        require(block.timestamp <= battle.endTime, "Battle ended");

        int256 payoutSigned = _calculateLivePayoutSigned(bet, battle);
        require(payoutSigned <= 0, "Not liquidatable");

        _closePosition(bet);
        bet.liquidated = true;
        emit BetLiquidated(_betId, 0);
    }
    
    /**
     * @notice Deposit to platform reserve (for leverage payouts)
     */
    function depositReserve(uint256 _amount) external onlyOwner {
        require(
            cocToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        platformReserve += _amount;
        emit ReserveDeposited(_amount);
    }
    
    /**
     * @notice Withdraw from platform reserve
     */
    function withdrawReserve(uint256 _amount) external onlyOwner {
        require(_amount <= platformReserve, "Insufficient reserve");
        platformReserve -= _amount;
        require(cocToken.transfer(msg.sender, _amount), "Transfer failed");
        emit ReserveWithdrawn(_amount);
    }
    
    /**
     * @notice Get user's bets
     */
    function getUserBets(address _user) external view returns (uint256[] memory) {
        return userBets[_user];
    }
    
    /**
     * @notice Set staking contract
     */
    function setStakingContract(address _stakingContract) external onlyOwner {
        stakingContract = _stakingContract;
        emit StakingContractUpdated(_stakingContract);
    }

    /**
     * @notice Set platform fee wallet
     */
    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "Invalid wallet");
        platformWallet = _platformWallet;
        emit PlatformWalletUpdated(_platformWallet);
    }

    /**
     * @notice Set minimum pool depth required for leverage > 1x
     */
    function setMinPoolForLeverage(uint256 _minPoolForLeverage) external onlyOwner {
        minPoolForLeverage = _minPoolForLeverage;
        emit MinPoolForLeverageUpdated(_minPoolForLeverage);
    }

    /**
     * @notice Finalize battle fee distribution and release committed exposure
     */
    function finalizeBattle(uint256 _battleId) external onlyOwner {
        require(!battleFeesDistributed[_battleId], "Fees already distributed");
        require(openBets[_battleId] == 0, "Battle has open bets");

        BattleManager.Battle memory battle = _getBattle(_battleId);
        require(battle.status == BattleManager.BattleStatus.Completed, "Battle not complete");

        _distributeFees(battle);

        uint256 committed = battleExposureCommitted[_battleId];
        if (committed > 0) {
            totalCommittedExposure -= committed;
            battleExposureCommitted[_battleId] = 0;
        }
    }
    
    /**
     * @notice Update fee structure
     */
    function updateFees(
        uint256 _winnerPoolBps,
        uint256 _deployerFeeBps,
        uint256 _platformFeeBps,
        uint256 _stakerFeeBps
    ) external onlyOwner {
        require(
            _winnerPoolBps + _deployerFeeBps + _platformFeeBps + _stakerFeeBps == 10000,
            "Must sum to 100%"
        );
        winnerPoolBps = _winnerPoolBps;
        deployerFeeBps = _deployerFeeBps;
        platformFeeBps = _platformFeeBps;
        stakerFeeBps = _stakerFeeBps;
    }

    /**
     * @notice Get live odds for both tokens in a battle (1e18 precision)
     */
    function getOdds(uint256 _battleId)
        external
        view
        returns (address token1, address token2, uint256 odds1, uint256 odds2)
    {
        BattleManager.Battle memory battle = _getBattle(_battleId);
        token1 = battle.token1;
        token2 = battle.token2;

        uint256 pool1 = pools[_battleId][token1].totalAmount;
        uint256 pool2 = pools[_battleId][token2].totalAmount;

        odds1 = pool1 > 0 ? (pool2 * 1e18) / pool1 : 0;
        odds2 = pool2 > 0 ? (pool1 * 1e18) / pool2 : 0;
    }

    /**
     * @notice Get max leverage for a battle based on current pool ratio
     */
    function getMaxLeverage(uint256 _battleId) public view returns (uint256) {
        BattleManager.Battle memory battle = _getBattle(_battleId);
        uint256 pool1 = pools[_battleId][battle.token1].totalAmount;
        uint256 pool2 = pools[_battleId][battle.token2].totalAmount;

        uint256 ratio = _calculatePoolRatio(pool1, pool2);
        uint256 tier;

        if (ratio <= 1.5e18) {
            tier = 5000; // 50x
        } else if (ratio <= 2.5e18) {
            tier = 2500; // 25x
        } else if (ratio <= 4e18) {
            tier = 1000; // 10x
        } else {
            tier = 500; // 5x
        }

        return tier > maxLeverage ? maxLeverage : tier;
    }
    
    /**
     * @dev Calculate payout for winning bet at settlement
     */
    function _calculateSettlementPayout(
        Bet memory bet,
        BattleManager.Battle memory battle
    ) internal view returns (uint256) {
        uint256 totalPool = battleTotalPoolSnapshot[bet.battleId];
        uint256 winnerPool = battleWinnerPoolSnapshot[bet.battleId];

        if (totalPool == 0 || winnerPool == 0) {
            (, int256 payoutSigned) = _calculatePayoutComponents(bet, battle);
            if (payoutSigned <= 0) {
                return 0;
            }

            uint256 payout = uint256(payoutSigned);
            uint256 maxPayout = cocToken.balanceOf(address(this));
            return payout > maxPayout ? maxPayout : payout;
        }

        uint256 winnerPoolAmount = (totalPool * winnerPoolBps) / 10000;
        uint256 basePayout = (winnerPoolAmount * bet.amount) / winnerPool;

        int256 pnl = _toInt256(basePayout) - _toInt256(bet.amount);
        int256 leveragedPnl = (pnl * _toInt256(bet.leverage)) / 100;
        int256 payoutSigned = _toInt256(bet.amount) + leveragedPnl;
        if (payoutSigned <= 0) {
            return 0;
        }

        uint256 payout = uint256(payoutSigned);
        uint256 maxPayout = cocToken.balanceOf(address(this));
        return payout > maxPayout ? maxPayout : payout;
    }

    /**
     * @dev Calculate live payout for cashout/liquidation
     */
    function _calculateLivePayout(
        Bet memory bet,
        BattleManager.Battle memory battle
    ) internal view returns (uint256) {
        (, int256 payoutSigned) = _calculatePayoutComponents(bet, battle);
        if (payoutSigned <= 0) {
            return 0;
        }

        uint256 payout = uint256(payoutSigned);
        uint256 maxPayout = cocToken.balanceOf(address(this));
        return payout > maxPayout ? maxPayout : payout;
    }

    function _calculateLivePayoutSigned(
        Bet memory bet,
        BattleManager.Battle memory battle
    ) internal view returns (int256) {
        (, int256 payoutSigned) = _calculatePayoutComponents(bet, battle);
        return payoutSigned;
    }

    function _calculatePayoutComponents(
        Bet memory bet,
        BattleManager.Battle memory battle
    ) internal view returns (uint256 basePayout, int256 payoutSigned) {
        Pool memory winningPool = pools[bet.battleId][bet.predictedWinner];
        address losingToken = bet.predictedWinner == battle.token1 ? battle.token2 : battle.token1;
        Pool memory losingPool = pools[bet.battleId][losingToken];

        if (winningPool.totalAmount == 0) {
            return (0, 0);
        }

        uint256 totalPool = winningPool.totalAmount + losingPool.totalAmount;
        if (totalPool == 0) {
            return (0, 0);
        }

        uint256 winnerPool = (totalPool * winnerPoolBps) / 10000;
        basePayout = (winnerPool * bet.amount) / winningPool.totalAmount;

        int256 pnl = _toInt256(basePayout) - _toInt256(bet.amount);
        int256 leveragedPnl = (pnl * _toInt256(bet.leverage)) / 100;
        payoutSigned = _toInt256(bet.amount) + leveragedPnl;
    }

    function _calculateExposure(uint256 _amount, uint256 _leverage) internal pure returns (uint256) {
        if (_leverage <= 100) {
            return 0;
        }
        return (_amount * (_leverage - 100)) / 100;
    }

    function _calculatePoolRatio(uint256 _pool1, uint256 _pool2) internal pure returns (uint256) {
        if (_pool1 == 0 || _pool2 == 0) {
            return type(uint256).max;
        }

        uint256 larger = _pool1 >= _pool2 ? _pool1 : _pool2;
        uint256 smaller = _pool1 >= _pool2 ? _pool2 : _pool1;
        return (larger * 1e18) / smaller;
    }

    function _closePosition(Bet storage bet) internal {
        Pool storage pool = pools[bet.battleId][bet.predictedWinner];
        require(pool.totalAmount >= bet.amount, "Pool underflow");

        pool.totalAmount -= bet.amount;
        if (pool.betCount > 0) {
            pool.betCount -= 1;
        }

        totalPooledAmount -= bet.amount;
        totalOpenExposure -= _calculateExposure(bet.amount, bet.leverage);
        if (openBets[bet.battleId] > 0) {
            openBets[bet.battleId] -= 1;
        }
    }

    function _distributeFees(BattleManager.Battle memory battle) internal {
        battleFeesDistributed[battle.id] = true;

        uint256 totalPool = battleTotalPoolSnapshot[battle.id];
        if (totalPool == 0) {
            uint256 pool1 = pools[battle.id][battle.token1].totalAmount;
            uint256 pool2 = pools[battle.id][battle.token2].totalAmount;
            totalPool = pool1 + pool2;
        }

        if (totalPool == 0) {
            return;
        }

        require(platformWallet != address(0), "Platform wallet not set");

        uint256 platformFee = (totalPool * platformFeeBps) / 10000;
        uint256 deployerFeeTotal = (totalPool * deployerFeeBps) / 10000;
        uint256 stakerFee = (totalPool * stakerFeeBps) / 10000;
        uint256 deployerFeeEach = deployerFeeTotal / 2;

        if (platformFee > 0) {
            require(cocToken.transfer(platformWallet, platformFee), "Platform fee failed");
        }

        if (deployerFeeEach > 0) {
            address deployer1 = battle.deployer1 == address(0) ? platformWallet : battle.deployer1;
            address deployer2 = battle.deployer2 == address(0) ? platformWallet : battle.deployer2;
            require(cocToken.transfer(deployer1, deployerFeeEach), "Deployer1 fee failed");
            require(cocToken.transfer(deployer2, deployerFeeEach), "Deployer2 fee failed");
        }

        if (stakerFee > 0) {
            require(stakingContract != address(0), "Staking not set");
            require(cocToken.approve(stakingContract, stakerFee), "Approve failed");
            (bool success, ) = stakingContract.call(
                abi.encodeWithSignature("fundRewardPool(uint256)", stakerFee)
            );
            require(success, "Staker fee failed");
        }
    }
    
    /**
     * @dev Get battle from BattleManager
     */
    function _getBattle(uint256 _battleId) 
        internal 
        view 
        returns (BattleManager.Battle memory) 
    {
        (
            uint256 id,
            address token1,
            address token2,
            address deployer1,
            address deployer2,
            uint256 startTime,
            uint256 endTime,
            BattleManager.BattleStatus status,
            BattleManager.BattleTheme theme,
            address winner,
            uint256 totalBets,
            bool spotlightBattle
        ) = battleManager.battles(_battleId);
        
        return BattleManager.Battle({
            id: id,
            token1: token1,
            token2: token2,
            deployer1: deployer1,
            deployer2: deployer2,
            startTime: startTime,
            endTime: endTime,
            status: status,
            theme: theme,
            winner: winner,
            totalBets: totalBets,
            spotlightBattle: spotlightBattle
        });
    }

    function _toInt256(uint256 value) internal pure returns (int256) {
        require(value <= uint256(type(int256).max), "Int256 overflow");
        return int256(value);
    }

}
