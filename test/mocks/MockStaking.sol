// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockStaking {
    IERC20 public token;
    uint256 public rewardPool;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function fundRewardPool(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        rewardPool += amount;
    }
}
