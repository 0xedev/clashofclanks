// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct FuzzSelector {
    address addr;
    bytes4[] selectors;
}

interface VmCheatcodes {
    function prank(address) external;
    function startPrank(address) external;
    function stopPrank() external;
    function warp(uint256) external;
    function roll(uint256) external;
    function deal(address, uint256) external;
    function expectRevert(bytes calldata) external;
    function expectRevert(bytes4) external;
    function expectRevert() external;
    function assume(bool) external;
    function targetContract(address) external;
}

contract Test {
    VmCheatcodes internal constant vm = VmCheatcodes(address(uint160(uint256(keccak256("hevm cheat code")))));

    function assertTrue(bool condition) internal pure {
        require(condition, "assertTrue failed");
    }

    function assertFalse(bool condition) internal pure {
        require(!condition, "assertFalse failed");
    }

    function assertEq(uint256 a, uint256 b) internal pure {
        require(a == b, "assertEq failed");
    }

    function assertEq(address a, address b) internal pure {
        require(a == b, "assertEq failed");
    }

    function assertEq(bool a, bool b) internal pure {
        require(a == b, "assertEq failed");
    }

    function assertGt(uint256 a, uint256 b) internal pure {
        require(a > b, "assertGt failed");
    }

    function assertGe(uint256 a, uint256 b) internal pure {
        require(a >= b, "assertGe failed");
    }

    function assertLt(uint256 a, uint256 b) internal pure {
        require(a < b, "assertLt failed");
    }

    function assertLe(uint256 a, uint256 b) internal pure {
        require(a <= b, "assertLe failed");
    }

    function bound(uint256 x, uint256 min, uint256 max) internal pure returns (uint256) {
        require(min <= max, "bound min>max");
        if (min == max) {
            return min;
        }
        if (x < min || x > max) {
            uint256 diff = max - min + 1;
            return min + (x % diff);
        }
        return x;
    }
}
