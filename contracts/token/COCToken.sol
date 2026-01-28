// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ClashOfClanks Token ($COC)
 * @notice Native token for the Clash of Clanks prediction market platform
 * @dev ERC20 token with burning capability, deployed via Clanker
 */
contract COCToken is ERC20, ERC20Burnable, Ownable {
    
    /// @notice Maximum supply cap
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    /// @notice Timestamp when trading can start
    uint256 public tradingEnabledTime;
    
    /// @notice Whether trading is enabled
    bool public tradingEnabled;
    
    /// @notice Addresses exempt from trading restrictions
    mapping(address => bool) public isExemptFromRestrictions;
    
    event TradingEnabled(uint256 timestamp);
    event ExemptionUpdated(address indexed account, bool isExempt);
    
    /**
     * @notice Constructor
     * @param initialSupply Initial token supply to mint
     */
    constructor(
        uint256 initialSupply
    ) ERC20("Clash of Clanks", "COC") Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(msg.sender, initialSupply);
        
        // Platform contracts are exempt from restrictions
        isExemptFromRestrictions[msg.sender] = true;
    }
    
    /**
     * @notice Enable trading
     */
    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "Trading already enabled");
        tradingEnabled = true;
        tradingEnabledTime = block.timestamp;
        emit TradingEnabled(block.timestamp);
    }
    
    /**
     * @notice Update exemption status for an address
     * @param account Address to update
     * @param exempt Whether the address should be exempt
     */
    function setExemption(address account, bool exempt) external onlyOwner {
        isExemptFromRestrictions[account] = exempt;
        emit ExemptionUpdated(account, exempt);
    }
    
    /**
     * @notice Override transfer to add restrictions
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        // Allow minting and burning
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }
        
        // Check trading restrictions
        require(
            tradingEnabled || 
            isExemptFromRestrictions[from] || 
            isExemptFromRestrictions[to],
            "Trading not enabled"
        );
        
        super._update(from, to, value);
    }
    
    /**
     * @notice Mint additional tokens (up to MAX_SUPPLY)
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
}
