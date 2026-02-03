// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title COCToken
 * @notice Native token for Clash of Clanks with trading controls and burn functionality
 */
contract COCToken is ERC20, ERC20Burnable, Ownable {
    
    /// @notice Whether trading is enabled
    bool public tradingEnabled;
    
    /// @notice Mapping of addresses that can trade even when trading is disabled
    mapping(address => bool) public isWhitelisted;
    
    /// Events
    event TradingEnabled();
    event WhitelistUpdated(address indexed account, bool isWhitelisted);
    
    /**
     * @notice Constructor
     * @param initialOwner The address that will receive the initial supply and own the contract
     * @param initialSupply The initial supply of tokens (in wei)
     */
    constructor(
        address initialOwner,
        uint256 initialSupply
    ) ERC20("Clash of Clanks", "COC") Ownable(initialOwner) {
        _mint(initialOwner, initialSupply);
        isWhitelisted[initialOwner] = true;
    }
    
    /**
     * @notice Enable trading for all users
     */
    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "Trading already enabled");
        tradingEnabled = true;
        emit TradingEnabled();
    }
    
    /**
     * @notice Update whitelist status for an address
     */
    function updateWhitelist(address account, bool status) external onlyOwner {
        isWhitelisted[account] = status;
        emit WhitelistUpdated(account, status);
    }
    
    /**
     * @dev Hook that is called before any transfer of tokens.
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        if (!tradingEnabled) {
            require(isWhitelisted[from] || isWhitelisted[to], "Trading not yet enabled");
        }
        super._update(from, to, value);
    }
}
