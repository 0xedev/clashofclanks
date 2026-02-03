// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITokenMetricsOracle {
    function hasValidMetrics(address token) external view returns (bool);
    function compareTokens(address token1, address token2) external view returns (address winner, uint256 score1, uint256 score2);
    function getMetricsTimestamp(address token) external view returns (uint256);
}

/**
 * @title BattleManager
 * @notice Manages Clanker token battles and matchmaking
 */
contract BattleManager is Ownable, ReentrancyGuard {
    
    /// @notice Battle status enum
    enum BattleStatus {
        Pending,      // Battle created, waiting to start
        Active,       // Battle in progress
        Completed,    // Battle finished
        Cancelled     // Battle cancelled
    }
    
    /// @notice Battle theme enum
    enum BattleTheme {
        Random,
        MiniApp,
        Meme,
        Banker
    }

    /// @notice Access modes for betting
    enum AccessMode {
        Free,
        NFT,
        COC,
        NFT_OR_COC
    }
    
    /// @notice Battle struct
    struct Battle {
        uint256 id;
        address token1;
        address token2;
        address deployer1;
        address deployer2;
        uint256 startTime;
        uint256 endTime;
        BattleStatus status;
        BattleTheme theme;
        address winner; // Address of winning token
        uint256 totalBets;
        bool spotlightBattle; // Featured battle
    }
    
    /// @notice Counter for battle IDs
    uint256 public battleCounter;
    
    /// @notice Mapping of battle ID to Battle
    mapping(uint256 => Battle) public battles;
    
    /// @notice Active battles
    uint256[] public activeBattles;
    
    /// @notice Clinkers NFT contract address
    IERC721 public clinkersNFT;
    
    /// @notice COC token contract
    IERC20 public cocToken;
    
    /// @notice Minimum COC holdings required (if no NFT)
    uint256 public minCOCHolding = 10_000_000 * 10**18;
    
    /// @notice Current access mode
    AccessMode public accessMode = AccessMode.NFT_OR_COC;
    
    /// @notice Oracle address (authorized to report results)
    address public oracle;
    
    /// @notice Betting pool contract
    address public bettingPool;

    /// @notice Grace period after end time before cancellation
    uint256 public gracePeriod = 6 hours;
    
    /// Events
    event BattleCreated(
        uint256 indexed battleId,
        address token1,
        address token2,
        address deployer1,
        address deployer2,
        uint256 startTime,
        uint256 endTime,
        BattleTheme theme
    );
    
    event BattleStarted(uint256 indexed battleId, uint256 timestamp);
    event BattleCompleted(uint256 indexed battleId, address winner);
    event BattleCancelled(uint256 indexed battleId);
    event OracleUpdated(address indexed newOracle);
    event BettingPoolUpdated(address indexed newBettingPool);
    event AccessModeUpdated(AccessMode newMode);
    event MinCOCHoldingUpdated(uint256 newMinCOCHolding);
    
    /**
     * @notice Constructor
     */
    constructor(
        address _clinkersNFT,
        address _cocToken
    ) Ownable(msg.sender) {
        clinkersNFT = IERC721(_clinkersNFT);
        cocToken = IERC20(_cocToken);
    }
    
    /**
     * @notice Create a new battle
     */
    function createBattle(
        address _token1,
        address _token2,
        address _deployer1,
        address _deployer2,
        uint256 _duration,
        BattleTheme _theme,
        bool _spotlightBattle
    ) external onlyOwner returns (uint256) {
        require(_token1 != _token2, "Same token");
        require(_token1 != address(0) && _token2 != address(0), "Invalid token");
        
        battleCounter++;
        uint256 battleId = battleCounter;
        
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _duration;
        
        battles[battleId] = Battle({
            id: battleId,
            token1: _token1,
            token2: _token2,
            deployer1: _deployer1,
            deployer2: _deployer2,
            startTime: startTime,
            endTime: endTime,
            status: BattleStatus.Active,
            theme: _theme,
            winner: address(0),
            totalBets: 0,
            spotlightBattle: _spotlightBattle
        });
        
        activeBattles.push(battleId);
        
        emit BattleCreated(
            battleId,
            _token1,
            _token2,
            _deployer1,
            _deployer2,
            startTime,
            endTime,
            _theme
        );
        
        emit BattleStarted(battleId, startTime);
        
        return battleId;
    }
    
    /**
     * @notice Complete a battle and set winner based on oracle metrics
     * @dev Only callable by oracle (TokenMetricsOracle)
     */
    function completeBattle(uint256 _battleId) external {
        require(msg.sender == oracle, "Not oracle");
        Battle storage battle = battles[_battleId];
        require(battle.status == BattleStatus.Active, "Not active");
        require(block.timestamp >= battle.endTime, "Battle not ended");

        ITokenMetricsOracle metricsOracle = ITokenMetricsOracle(oracle);

        require(metricsOracle.hasValidMetrics(battle.token1), "Token1 metrics invalid");
        require(metricsOracle.hasValidMetrics(battle.token2), "Token2 metrics invalid");

        uint256 t1 = metricsOracle.getMetricsTimestamp(battle.token1);
        uint256 t2 = metricsOracle.getMetricsTimestamp(battle.token2);
        require(t1 >= battle.endTime && t2 >= battle.endTime, "Metrics before battle end");

        (address winner,,) = metricsOracle.compareTokens(battle.token1, battle.token2);

        battle.status = BattleStatus.Completed;
        battle.winner = winner;
        
        _removeFromActiveBattles(_battleId);
        
        emit BattleCompleted(_battleId, winner);
    }
    
    /**
     * @notice Check if user has access based on current access mode
     */
    function hasAccess(address _user) public view returns (bool) {
        if (accessMode == AccessMode.Free) {
            return true;
        }
        
        bool hasNFT = clinkersNFT.balanceOf(_user) > 0;
        bool hasCOC = cocToken.balanceOf(_user) >= minCOCHolding;
        
        if (accessMode == AccessMode.NFT) {
            return hasNFT;
        }
        
        if (accessMode == AccessMode.COC) {
            return hasCOC;
        }
        
        return hasNFT || hasCOC;
    }
    
    /**
     * @notice Update oracle address
     */
    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }
    
    /**
     * @notice Update betting pool address
     */
    function setBettingPool(address _bettingPool) external onlyOwner {
        bettingPool = _bettingPool;
        emit BettingPoolUpdated(_bettingPool);
    }

    /**
     * @notice Update access mode
     */
    function setAccessMode(AccessMode _mode) external onlyOwner {
        accessMode = _mode;
        emit AccessModeUpdated(_mode);
    }

    /**
     * @notice Update minimum COC holding required
     */
    function setMinCOCHolding(uint256 _minCOCHolding) external onlyOwner {
        minCOCHolding = _minCOCHolding;
        emit MinCOCHoldingUpdated(_minCOCHolding);
    }

    /**
     * @notice Update grace period for battle cancellation
     */
    function setGracePeriod(uint256 _gracePeriod) external onlyOwner {
        gracePeriod = _gracePeriod;
    }

    /**
     * @notice Cancel a battle after grace period elapses
     */
    function cancelExpiredBattle(uint256 _battleId) external onlyOwner {
        Battle storage battle = battles[_battleId];
        require(battle.status == BattleStatus.Active, "Not active");
        require(block.timestamp > battle.endTime + gracePeriod, "Grace period active");

        battle.status = BattleStatus.Cancelled;
        _removeFromActiveBattles(_battleId);

        emit BattleCancelled(_battleId);
    }
    
    /**
     * @notice Record total bet volume for a battle
     */
    function recordBet(uint256 _battleId, uint256 _amount) external {
        require(msg.sender == bettingPool, "Not betting pool");
        battles[_battleId].totalBets += _amount;
    }
    
    /**
     * @notice Get active battles
     */
    function getActiveBattles() external view returns (uint256[] memory) {
        return activeBattles;
    }
    
    /**
     * @dev Remove battle from active battles array
     */
    function _removeFromActiveBattles(uint256 _battleId) internal {
        for (uint256 i = 0; i < activeBattles.length; i++) {
            if (activeBattles[i] == _battleId) {
                activeBattles[i] = activeBattles[activeBattles.length - 1];
                activeBattles.pop();
                break;
            }
        }
    }
}
