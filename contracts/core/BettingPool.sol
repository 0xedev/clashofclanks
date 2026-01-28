// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BattleManager.sol";

/**
 * @title BettingPool
 * @notice Handles betting, leverage, and payouts for battles
 */
contract BettingPool is Ownable, ReentrancyGuard {
    
    /// @notice Bet position
    struct Bet {
        uint256 battleId;
        uint256 checkpointIndex;
        address bettor;
        address predictedWinner;
        uint256 amount;
        uint256 leverage; // 1x = 100, 10x = 1000, 50x = 5000
        uint256 timestamp;
        bool settled;
        bool cashedOut;
    }
    
    /// @notice Pool for a specific battle + checkpoint + token
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
    
    /// @notice Counter for bet IDs
    uint256 public betCounter;
    
    /// @notice Mapping of bet ID to Bet
    mapping(uint256 => Bet) public bets;
    
    /// @notice Mapping of user to their bet IDs
    mapping(address => uint256[]) public userBets;
    
    /// @notice Mapping: battleId => checkpointIndex => token => Pool
    mapping(uint256 => mapping(uint256 => mapping(address => Pool))) public pools;
    
    /// @notice Fee percentages (basis points: 10000 = 100%)
    uint256 public winnerPoolBps = 8000;  // 80%
    uint256 public deployerFeeBps = 1000;  // 10%
    uint256 public platformFeeBps = 500;   // 5%
    uint256 public stakerFeeBps = 500;     // 5%
    
    /// @notice Minimum bet amount (in COC tokens)
    uint256 public minBetAmount;
    
    /// @notice Maximum leverage (5000 = 50x)
    uint256 public maxLeverage = 5000;
    
    /// @notice Staking contract address
    address public stakingContract;
    
    /// Events
    event BetPlaced(
        uint256 indexed betId,
        uint256 indexed battleId,
        uint256 checkpointIndex,
        address indexed bettor,
        address predictedWinner,
        uint256 amount,
        uint256 leverage
    );
    
    event BetSettled(uint256 indexed betId, uint256 payout);
    event BetCashedOut(uint256 indexed betId, uint256 amount);
    event ReserveDeposited(uint256 amount);
    event ReserveWithdrawn(uint256 amount);
    
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
        uint256 _checkpointIndex,
        address _predictedWinner,
        uint256 _amount,
        uint256 _leverage
    ) external nonReentrant returns (uint256) {
        require(battleManager.hasAccess(msg.sender), "No access");
        require(_amount >= minBetAmount, "Below min bet");
        require(_leverage >= 100 && _leverage <= maxLeverage, "Invalid leverage");
        
        (BattleManager.Battle memory battle) = _getBattle(_battleId);
        require(battle.status == BattleManager.BattleStatus.Active, "Battle not active");
        require(
            _predictedWinner == battle.token1 || _predictedWinner == battle.token2,
            "Invalid token"
        );
        
        // Transfer tokens from bettor
        require(
            cocToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        // Create bet
        betCounter++;
        uint256 betId = betCounter;
        
        bets[betId] = Bet({
            battleId: _battleId,
            checkpointIndex: _checkpointIndex,
            bettor: msg.sender,
            predictedWinner: _predictedWinner,
            amount: _amount,
            leverage: _leverage,
            timestamp: block.timestamp,
            settled: false,
            cashedOut: false
        });
        
        userBets[msg.sender].push(betId);
        
        // Update pool
        pools[_battleId][_checkpointIndex][_predictedWinner].totalAmount += _amount;
        pools[_battleId][_checkpointIndex][_predictedWinner].betCount++;
        
        emit BetPlaced(
            betId,
            _battleId,
            _checkpointIndex,
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
        
        (BattleManager.Battle memory battle) = _getBattle(bet.battleId);
        require(battle.status == BattleManager.BattleStatus.Completed, "Battle not complete");
        
        bet.settled = true;
        
        // Check if bet won
        if (bet.predictedWinner == battle.winner) {
            uint256 payout = _calculatePayout(bet, battle);
            require(cocToken.transfer(bet.bettor, payout), "Payout failed");
            emit BetSettled(_betId, payout);
        } else {
            emit BetSettled(_betId, 0);
        }
    }
    
    /**
     * @notice Cash out bet early with dynamic odds
     */
    function cashOutBet(uint256 _betId) external nonReentrant {
        Bet storage bet = bets[_betId];
        require(bet.bettor == msg.sender, "Not bettor");
        require(!bet.settled, "Already settled");
        require(!bet.cashedOut, "Already cashed out");
        
        (BattleManager.Battle memory battle) = _getBattle(bet.battleId);
        require(battle.status == BattleManager.BattleStatus.Active, "Battle not active");
        
        bet.cashedOut = true;
        
        // Calculate early cashout amount (with penalty)
        uint256 cashoutAmount = (bet.amount * 90) / 100; // 10% penalty
        
        require(cocToken.transfer(msg.sender, cashoutAmount), "Cashout failed");
        
        emit BetCashedOut(_betId, cashoutAmount);
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
     * @dev Calculate payout for winning bet
     */
    function _calculatePayout(
        Bet memory bet,
        BattleManager.Battle memory battle
    ) internal view returns (uint256) {
        // Get total pool amounts
        Pool memory winningPool = pools[bet.battleId][bet.checkpointIndex][bet.predictedWinner];
        address losingToken = bet.predictedWinner == battle.token1 ? battle.token2 : battle.token1;
        Pool memory losingPool = pools[bet.battleId][bet.checkpointIndex][losingToken];
        
        uint256 totalPool = winningPool.totalAmount + losingPool.totalAmount;
        
        // Calculate winner's share (80% of total pool)
        uint256 winnerPool = (totalPool * winnerPoolBps) / 10000;
        
        // Calculate proportional share
        uint256 basePayout = (winnerPool * bet.amount) / winningPool.totalAmount;
        
        // Apply leverage
        uint256 leveragedPayout = (basePayout * bet.leverage) / 100;
        
        // Cap payout at available funds (pool + reserve)
        uint256 maxPayout = cocToken.balanceOf(address(this));
        return leveragedPayout > maxPayout ? maxPayout : leveragedPayout;
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
}
