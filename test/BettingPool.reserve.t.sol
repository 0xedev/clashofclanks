// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/Fixture.sol";

contract BettingPoolReserveTest is Fixture {
    function testOwnerDepositReserve() public {
        cocToken.mint(owner, 100e18);
        cocToken.approve(address(bettingPool), 100e18);
        bettingPool.depositReserve(100e18);

        assertEq(bettingPool.platformReserve(), 100e18);
    }

    function testOwnerWithdrawReserve() public {
        cocToken.mint(owner, 100e18);
        cocToken.approve(address(bettingPool), 100e18);
        bettingPool.depositReserve(100e18);

        uint256 ownerBefore = cocToken.balanceOf(owner);
        bettingPool.withdrawReserve(40e18);
        uint256 ownerAfter = cocToken.balanceOf(owner);

        assertEq(bettingPool.platformReserve(), 60e18);
        assertEq(ownerAfter - ownerBefore, 40e18);
    }

    function testWithdrawReserveRevertsIfInsufficient() public {
        vm.expectRevert(bytes("Insufficient reserve"));
        bettingPool.withdrawReserve(1e18);
    }

    function testReserveUsedInExposureChecks() public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user1, 10e18);

        vm.prank(user1);
        vm.expectRevert(bytes("Exposure cap exceeded"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 500);

        cocToken.mint(owner, 30e18);
        cocToken.approve(address(bettingPool), 30e18);
        bettingPool.depositReserve(30e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 500);
    }

    function testDrainReservePreventsHighLeverage() public {
        bettingPool.setMinPoolForLeverage(0);
        cocToken.mint(owner, 30e18);
        cocToken.approve(address(bettingPool), 30e18);
        bettingPool.depositReserve(30e18);

        fundAndApprove(user1, 10e18);
        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 500);

        bettingPool.withdrawReserve(30e18);

        fundAndApprove(user2, 10e18);
        vm.prank(user2);
        vm.expectRevert(bytes("Exposure cap exceeded"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 500);
    }
}
