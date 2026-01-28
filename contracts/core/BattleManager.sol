// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    
    /// @notice Battle checkpoint for predictions
    struct Checkpoint {
        uint256 timestamp;
        string description; // e.g., "1 hour", "Day 1", "Day 2"
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
    
    /// @notice Mapping of battle ID to checkpoints
    mapping(uint256 => Checkpoint[]) public battleCheckpoints;
    
    /// @notice Active battles
    uint256[] public activeBattles;
    
    /// @notice Clinkers NFT contract address
    IERC721 public clinkersNFT;
    
    /// @notice COC token contract
    IERC20 public cocToken;
    
    /// @notice Minimum COC holdings required (if no NFT)
    uint256 public minCOCHolding = 10_000_000 * 10**18;
    
    /// @notice Oracle address (authorized to report results)
    address public oracle;
    
    /// @notice Betting pool contract
    address public bettingPool;
    
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
    event CheckpointAdded(uint256 indexed battleId, uint256 timestamp, string description);
    event OracleUpdated(address indexed newOracle);
    event BettingPoolUpdated(address indexed newBettingPool);
    
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
        
        // Create default checkpoints
        _createDefaultCheckpoints(battleId, startTime, endTime);
        
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
     * @notice Complete a battle and set winner
     * @dev Only callable by oracle
     */
    function completeBattle(uint256 _battleId, address _winner) external {
        require(msg.sender == oracle, "Not oracle");
        Battle storage battle = battles[_battleId];
        require(battle.status == BattleStatus.Active, "Not active");
        require(
            _winner == battle.token1 || _winner == battle.token2,
            "Invalid winner"
        );
        
        battle.status = BattleStatus.Completed;
        battle.winner = _winner;
        
        _removeFromActiveBattles(_battleId);
        
        emit BattleCompleted(_battleId, _winner);
    }
    
    /**
     * @notice Check if user has access (NFT holder or min COC holder)
     */
    function hasAccess(address _user) public view returns (bool) {
        return clinkersNFT.balanceOf(_user) > 0 || 
               cocToken.balanceOf(_user) >= minCOCHolding;
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
     * @notice Get active battles
     */
    function getActiveBattles() external view returns (uint256[] memory) {
        return activeBattles;
    }
    
    /**
     * @notice Get battle checkpoints
     */
    function getBattleCheckpoints(uint256 _battleId) 
        external 
        view 
        returns (Checkpoint[] memory) 
    {
        return battleCheckpoints[_battleId];
    }
    
    /**
     * @dev Create default checkpoints for a battle
     */
    function _createDefaultCheckpoints(
        uint256 _battleId,
        uint256 _startTime,
        uint256 _endTime
    ) internal {
        // 1 hour
        battleCheckpoints[_battleId].push(Checkpoint({
            timestamp: _startTime + 1 hours,
            description: "1 Hour"
        }));
        
        // 12 hours
        battleCheckpoints[_battleId].push(Checkpoint({
            timestamp: _startTime + 12 hours,
            description: "12 Hours"
        }));
        
        // Day 1
        battleCheckpoints[_battleId].push(Checkpoint({
            timestamp: _startTime + 1 days,
            description: "Day 1"
        }));
        
        // Day 1.5
        battleCheckpoints[_battleId].push(Checkpoint({
            timestamp: _startTime + 36 hours,
            description: "Day 1.5"
        }));
        
        // Day 2
        battleCheckpoints[_battleId].push(Checkpoint({
            timestamp: _startTime + 2 days,
            description: "Day 2"
        }));
        
        // End
        battleCheckpoints[_battleId].push(Checkpoint({
            timestamp: _endTime,
            description: "Final"
        }));
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
