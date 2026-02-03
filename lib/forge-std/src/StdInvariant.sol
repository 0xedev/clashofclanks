// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

contract StdInvariant is Test {
    function targetContract(address addr) internal {
        vm.targetContract(addr);
    }
}
