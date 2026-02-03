// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/Fixture.sol";

contract BettingPoolExposureOddsTest is Fixture {
    function testExposureFormula() public {
        bettingPool.setMinPoolForLeverage(0);
        cocToken.mint(owner, 100e18);
        cocToken.approve(address(bettingPool), 100e18);
        bettingPool.depositReserve(100e18);
        fundAndApprove(user1, 100e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 100e18, 300);

        assertEq(bettingPool.totalOpenExposure(), 200e18);
        assertEq(bettingPool.totalCommittedExposure(), 200e18);
    }

    function testExposureZeroAfterSettlement() public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user1, 100e18);

        vm.prank(user1);
        uint256 betId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 200);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        bettingPool.settleBet(betId);
        assertEq(bettingPool.totalOpenExposure(), 0);
    }

    function testExposureZeroAfterCashOut() public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user1, 100e18);

        vm.prank(user1);
        uint256 betId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 200);

        vm.prank(user1);
        bettingPool.cashOutBet(betId);
        assertEq(bettingPool.totalOpenExposure(), 0);
    }

    function testExposureZeroAfterLiquidation() public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user1, 100e18);
        fundAndApprove(user2, 500e18);

        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token1, 500e18, 100);

        vm.prank(user1);
        uint256 betId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 500);

        bettingPool.liquidate(betId);
        assertEq(bettingPool.totalOpenExposure(), 0);
    }

    function testExposureCapReverts() public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user1, 10e18);

        vm.prank(user1);
        vm.expectRevert(bytes("Exposure cap exceeded"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 500);
    }

    function testExposureCapAllowsWithReserve() public {
        bettingPool.setMinPoolForLeverage(0);
        cocToken.mint(owner, 30e18);
        cocToken.approve(address(bettingPool), 30e18);
        bettingPool.depositReserve(30e18);

        fundAndApprove(user1, 10e18);
        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 500);

        assertEq(bettingPool.totalOpenExposure(), 40e18);
    }

    function testMinPoolForLeverageGating() public {
        fundAndApprove(user1, 10e18);
        vm.prank(user1);
        vm.expectRevert(bytes("Pool too shallow"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 200);

        fundAndApprove(user2, 100e18);
        fundAndApprove(user3, 100e18);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token1, 100e18, 100);
        vm.prank(user3);
        bettingPool.placeBet(defaultBattleId, token2, 100e18, 100);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 200);
    }

    function testOddsBalanced() public {
        fundAndApprove(user1, 100e18);
        fundAndApprove(user2, 100e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 100e18, 100);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token2, 100e18, 100);

        (, , uint256 odds1, uint256 odds2) = bettingPool.getOdds(defaultBattleId);
        assertEq(odds1, 1e18);
        assertEq(odds2, 1e18);
    }

    function testOddsImbalanced() public {
        fundAndApprove(user1, 100e18);
        fundAndApprove(user2, 200e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 100e18, 100);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token2, 200e18, 100);

        (, , uint256 odds1, uint256 odds2) = bettingPool.getOdds(defaultBattleId);
        assertEq(odds1, 2e18);
        assertEq(odds2, 5e17);
    }

    function testOddsZeroWhenOneSideEmpty() public {
        fundAndApprove(user1, 100e18);
        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 100e18, 100);

        (, , uint256 odds1, uint256 odds2) = bettingPool.getOdds(defaultBattleId);
        assertEq(odds1, 0);
        assertEq(odds2, 0);
    }

    function testMaxLeverageTier50x() public {
        fundAndApprove(user1, 100e18);
        fundAndApprove(user2, 100e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 100e18, 100);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token2, 100e18, 100);

        assertEq(bettingPool.getMaxLeverage(defaultBattleId), 5000);
    }

    function testMaxLeverageTier25x() public {
        fundAndApprove(user1, 250e18);
        fundAndApprove(user2, 100e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 250e18, 100);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token2, 100e18, 100);

        assertEq(bettingPool.getMaxLeverage(defaultBattleId), 2500);
    }

    function testMaxLeverageTier10x() public {
        fundAndApprove(user1, 400e18);
        fundAndApprove(user2, 100e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 400e18, 100);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token2, 100e18, 100);

        assertEq(bettingPool.getMaxLeverage(defaultBattleId), 1000);
    }

    function testMaxLeverageTier5x() public {
        fundAndApprove(user1, 500e18);
        fundAndApprove(user2, 100e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 500e18, 100);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token2, 100e18, 100);

        assertEq(bettingPool.getMaxLeverage(defaultBattleId), 500);
    }

    function testWhaleBetShiftsLeverageTier() public {
        fundAndApprove(user1, 100e18);
        fundAndApprove(user2, 100e18);
        fundAndApprove(user3, 1_000e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 100e18, 100);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token2, 100e18, 100);

        assertEq(bettingPool.getMaxLeverage(defaultBattleId), 5000);

        vm.prank(user3);
        bettingPool.placeBet(defaultBattleId, token1, 1_000e18, 100);

        assertEq(bettingPool.getMaxLeverage(defaultBattleId), 500);
    }
}
