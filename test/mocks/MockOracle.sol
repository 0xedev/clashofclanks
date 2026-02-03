// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "contracts/core/BattleManager.sol";

contract MockOracle {
    address public winner;
    uint256 public timestamp;
    bool public valid = true;

    function setWinner(address _winner) external {
        winner = _winner;
    }

    function setTimestamp(uint256 _timestamp) external {
        timestamp = _timestamp;
    }

    function setValid(bool _valid) external {
        valid = _valid;
    }

    function hasValidMetrics(address) external view returns (bool) {
        return valid;
    }

    function compareTokens(address token1, address) external view returns (address, uint256, uint256) {
        return (winner == address(0) ? token1 : winner, 2, 1);
    }

    function getMetricsTimestamp(address) external view returns (uint256) {
        return timestamp;
    }

    function completeBattle(BattleManager battleManager, uint256 battleId) external {
        battleManager.completeBattle(battleId);
    }
}
