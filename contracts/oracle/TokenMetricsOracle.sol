// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenMetricsOracle
 * @notice Admin-submitted oracle for Clanker token battle metrics
 * @dev Data sourced from Uniswap V4 subgraph off-chain, submitted by admin
 * 
 * Frontend queries The Graph Uniswap V4 subgraph for real-time metrics:
 * - 24h trading volume
 * - Current price
 * - Total liquidity (TVL)
 * - Transaction count
 * 
 * Admin reviews data and submits to contract for battle finalization.
 * No Chainlink costs, relies on trusted admin for MVP.
 */
contract TokenMetricsOracle is Ownable {

    uint256 public constant MAX_METRICS_AGE = 1 hours;
    
    /// @notice Token metrics from Uniswap V4
    struct Metrics {
        uint256 volumeUSD24h;       // 24-hour trading volume in USD
        uint256 priceUSD;           // Current price in USD
        uint256 liquidityUSD;       // Total value locked in USD
        uint256 txCount24h;         // 24-hour transaction count
        uint256 timestamp;          // When data was recorded
    }
    
    /// @notice Mapping of token address to metrics
    mapping(address => Metrics) public tokenMetrics;
    
    /// @notice Battle Manager (authorized to view metrics)
    address public battleManager;
    
    /// Events
    event MetricsUpdated(
        address indexed token,
        uint256 volumeUSD24h,
        uint256 priceUSD,
        uint256 liquidityUSD,
        uint256 txCount24h
    );
    
    event BattleManagerUpdated(address indexed newBattleManager);
    
    /**
     * @notice Constructor
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Admin submits metrics from Uniswap V4 subgraph
     * @dev Frontend fetches from The Graph, admin verifies and submits
     * @param _token Clanker token address
     * @param _volumeUSD24h 24h volume from tokenDayData
     * @param _priceUSD Current price from pool sqrtPrice
     * @param _liquidityUSD Total value locked from pool
     * @param _txCount24h Transaction count from poolDayData
     */
    function submitMetrics(
        address _token,
        uint256 _volumeUSD24h,
        uint256 _priceUSD,
        uint256 _liquidityUSD,
        uint256 _txCount24h
    ) external onlyOwner {
        require(_token != address(0), "Invalid token");
        
        tokenMetrics[_token] = Metrics({
            volumeUSD24h: _volumeUSD24h,
            priceUSD: _priceUSD,
            liquidityUSD: _liquidityUSD,
            txCount24h: _txCount24h,
            timestamp: block.timestamp
        });
        
        emit MetricsUpdated(_token, _volumeUSD24h, _priceUSD, _liquidityUSD, _txCount24h);
    }
    
    /**
     * @notice Batch submit metrics for multiple tokens
     * @dev Gas-efficient for submitting both battle tokens at once
     */
    function submitBatchMetrics(
        address[] calldata _tokens,
        uint256[] calldata _volumeUSD24h,
        uint256[] calldata _priceUSD,
        uint256[] calldata _liquidityUSD,
        uint256[] calldata _txCount24h
    ) external onlyOwner {
        require(
            _tokens.length == _volumeUSD24h.length &&
            _tokens.length == _priceUSD.length &&
            _tokens.length == _liquidityUSD.length &&
            _tokens.length == _txCount24h.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < _tokens.length; i++) {
            require(_tokens[i] != address(0), "Invalid token");
            
            tokenMetrics[_tokens[i]] = Metrics({
                volumeUSD24h: _volumeUSD24h[i],
                priceUSD: _priceUSD[i],
                liquidityUSD: _liquidityUSD[i],
                txCount24h: _txCount24h[i],
                timestamp: block.timestamp
            });
            
            emit MetricsUpdated(
                _tokens[i],
                _volumeUSD24h[i],
                _priceUSD[i],
                _liquidityUSD[i],
                _txCount24h[i]
            );
        }
    }
    
    /**
     * @notice Compare two tokens and return winner
     * @dev Weighted scoring algorithm:
     *      - Volume: 40% (trading activity)
     *      - Liquidity: 30% (market depth)
     *      - Price: 20% (value)
     *      - Transactions: 10% (user engagement)
     * 
     * @param _token1 First token address
     * @param _token2 Second token address
     * @return winner Address of winning token
     * @return score1 Calculated score for token 1
     * @return score2 Calculated score for token 2
     */
    function compareTokens(
        address _token1,
        address _token2
    ) external view returns (address winner, uint256 score1, uint256 score2) {
        Metrics memory m1 = tokenMetrics[_token1];
        Metrics memory m2 = tokenMetrics[_token2];
        
        require(m1.timestamp > 0 && m2.timestamp > 0, "Missing metrics");
        
        score1 = _calculateScore(m1);
        score2 = _calculateScore(m2);

        require(score1 != score2, "Tie score");
        
        winner = score1 > score2 ? _token1 : _token2;
        
        return (winner, score1, score2);
    }
    
    /**
     * @notice Get metrics for a specific token
     * @param _token Token address
     * @return Metrics struct with all data
     */
    function getMetrics(address _token) external view returns (Metrics memory) {
        return tokenMetrics[_token];
    }

    /**
     * @notice Get metrics timestamp for a token
     * @param _token Token address
     * @return timestamp When metrics were recorded
     */
    function getMetricsTimestamp(address _token) external view returns (uint256) {
        return tokenMetrics[_token].timestamp;
    }
    
    /**
     * @notice Check if token has valid metrics
     * @param _token Token address
     * @return bool True if metrics exist and not stale
     */
    function hasValidMetrics(address _token) external view returns (bool) {
        Metrics memory m = tokenMetrics[_token];
        return m.timestamp > 0 && block.timestamp - m.timestamp <= MAX_METRICS_AGE;
    }
    
    /**
     * @notice Set battle manager address
     * @param _battleManager New battle manager contract
     */
    function setBattleManager(address _battleManager) external onlyOwner {
        require(_battleManager != address(0), "Invalid address");
        battleManager = _battleManager;
        emit BattleManagerUpdated(_battleManager);
    }
    
    /**
     * @dev Calculate composite score from metrics
     * @param m Metrics struct
     * @return Weighted score (higher is better)
     */
    function _calculateScore(Metrics memory m) internal pure returns (uint256) {
        // Normalize large values to prevent overflow
        uint256 volumeScore = (m.volumeUSD24h / 1e3) * 40;      // 40% weight
        uint256 liquidityScore = (m.liquidityUSD / 1e3) * 30;   // 30% weight
        uint256 priceScore = m.priceUSD * 20;                    // 20% weight
        uint256 txScore = m.txCount24h * 10;                     // 10% weight
        
        return volumeScore + liquidityScore + priceScore + txScore;
    }
}
