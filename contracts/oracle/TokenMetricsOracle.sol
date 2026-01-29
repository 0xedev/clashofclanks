// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/operatorforwarder/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenMetricsOracle
 * @notice Oracle for fetching token metrics (market cap, volume, holders)
 * @dev Uses Chainlink for automated data feeds
 */
contract TokenMetricsOracle is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;
    
    /// @notice Token metrics
    struct Metrics {
        uint256 marketCap;
        uint256 volume24h;
        uint256 holderCount;
        uint256 priceUSD;
        uint256 timestamp;
    }
    
    /// @notice Mapping of token address to metrics
    mapping(address => Metrics) public tokenMetrics;
    
    /// @notice Chainlink oracle address
    address public oracleAddress;
    
    /// @notice Chainlink job ID
    bytes32 public jobId;
    
    /// @notice Chainlink fee
    uint256 public fee;
    
    /// @notice Battle Manager (authorized to request updates)
    address public battleManager;
    
    /// Events
    event MetricsUpdated(
        address indexed token,
        uint256 marketCap,
        uint256 volume24h,
        uint256 holderCount,
        uint256 priceUSD
    );
    
    event MetricsRequested(address indexed token, bytes32 indexed requestId);
    
    /**
     * @notice Constructor
     */
    constructor(
        address _link,
        address _oracleAddress,
        bytes32 _jobId,
        uint256 _fee
    ) Ownable(msg.sender) {
        _setChainlinkToken(_link);
        oracleAddress = _oracleAddress;
        jobId = _jobId;
        fee = _fee;
    }
    
    /**
     * @notice Request token metrics update
     */
    function requestMetrics(address _token) external returns (bytes32) {
        require(msg.sender == battleManager || msg.sender == owner(), "Not authorized");
        
        Chainlink.Request memory req = _buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );
        
        // Set the URL to fetch data from (example using DexScreener API)
        string memory url = string(
            abi.encodePacked(
                "https://api.dexscreener.com/latest/dex/tokens/",
                _addressToString(_token)
            )
        );
        
        req._add("get", url);
        req._add("path", "pairs.0");
        
        bytes32 requestId = _sendChainlinkRequestTo(oracleAddress, req, fee);
        
        emit MetricsRequested(_token, requestId);
        
        return requestId;
    }
    
    /**
     * @notice Callback function for Chainlink
     */
    function fulfill(
        bytes32 _requestId,
        address _token,
        uint256 _marketCap,
        uint256 _volume24h,
        uint256 _holderCount,
        uint256 _priceUSD
    ) external recordChainlinkFulfillment(_requestId) {
        tokenMetrics[_token] = Metrics({
            marketCap: _marketCap,
            volume24h: _volume24h,
            holderCount: _holderCount,
            priceUSD: _priceUSD,
            timestamp: block.timestamp
        });
        
        emit MetricsUpdated(_token, _marketCap, _volume24h, _holderCount, _priceUSD);
    }
    
    /**
     * @notice Manual update (fallback for testing or emergencies)
     */
    function manualUpdate(
        address _token,
        uint256 _marketCap,
        uint256 _volume24h,
        uint256 _holderCount,
        uint256 _priceUSD
    ) external onlyOwner {
        tokenMetrics[_token] = Metrics({
            marketCap: _marketCap,
            volume24h: _volume24h,
            holderCount: _holderCount,
            priceUSD: _priceUSD,
            timestamp: block.timestamp
        });
        
        emit MetricsUpdated(_token, _marketCap, _volume24h, _holderCount, _priceUSD);
    }
    
    /**
     * @notice Compare two tokens and return winner
     * @dev Composite score based on multiple factors
     */
    function compareTokens(
        address _token1,
        address _token2
    ) external view returns (address winner, uint256 score1, uint256 score2) {
        Metrics memory metrics1 = tokenMetrics[_token1];
        Metrics memory metrics2 = tokenMetrics[_token2];
        
        // Calculate composite scores (weighted)
        score1 = _calculateCompositeScore(metrics1);
        score2 = _calculateCompositeScore(metrics2);
        
        winner = score1 > score2 ? _token1 : _token2;
        
        return (winner, score1, score2);
    }
    
    /**
     * @notice Set battle manager address
     */
    function setBattleManager(address _battleManager) external onlyOwner {
        battleManager = _battleManager;
    }
    
    /**
     * @notice Update oracle parameters
     */
    function updateOracleConfig(
        address _oracleAddress,
        bytes32 _jobId,
        uint256 _fee
    ) external onlyOwner {
        oracleAddress = _oracleAddress;
        jobId = _jobId;
        fee = _fee;
    }
    
    /**
     * @dev Calculate composite score from metrics
     * Weights: Market Cap (40%), Volume (30%), Holders (20%), Price Appreciation (10%)
     */
    function _calculateCompositeScore(
        Metrics memory _metrics
    ) internal pure returns (uint256) {
        uint256 mcScore = _metrics.marketCap / 1e6; // Normalized
        uint256 volScore = _metrics.volume24h / 1e6;
        uint256 holderScore = _metrics.holderCount * 100;
        uint256 priceScore = _metrics.priceUSD;
        
        // Weighted composite
        return (mcScore * 40) + (volScore * 30) + (holderScore * 20) + (priceScore * 10);
    }
    
    /**
     * @dev Convert address to string
     */
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        
        str[0] = '0';
        str[1] = 'x';
        
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        
        return string(str);
    }
}
