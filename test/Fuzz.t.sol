// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/Fixture.sol";

contract FuzzTest is Fixture {
    function testFuzzValidBetPlacement(uint96 amount, uint16 leverage) public {
        bettingPool.setMinPoolForLeverage(0);

        cocToken.mint(owner, 1_000_000e18);
        cocToken.approve(address(bettingPool), 1_000_000e18);
        bettingPool.depositReserve(1_000_000e18);

        fundAndApprove(user2, 1e18);
        fundAndApprove(user3, 1e18);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token1, 1e18, 100);
        vm.prank(user3);
        bettingPool.placeBet(defaultBattleId, token2, 1e18, 100);

        uint256 maxLev = bettingPool.getMaxLeverage(defaultBattleId);
        uint256 betAmount = bound(uint256(amount), bettingPool.minBetAmount(), 1_000e18);
        uint256 lev = bound(uint256(leverage), 100, maxLev);

        fundAndApprove(user1, betAmount);
        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, betAmount, lev);

        assertTrue(bettingPool.totalCommittedExposure() <= bettingPool.totalPooledAmount() + bettingPool.platformReserve());
    }

    function testFuzzInvalidAmountReverts(uint96 amount) public {
        bettingPool.setMinPoolForLeverage(0);
        uint256 minBet = bettingPool.minBetAmount();
        uint256 invalidAmount = bound(uint256(amount), 0, minBet - 1);

        fundAndApprove(user1, minBet);
        vm.prank(user1);
        vm.expectRevert(bytes("Below min bet"));
        bettingPool.placeBet(defaultBattleId, token1, invalidAmount, 100);
    }

    function testFuzzInvalidLeverageReverts(uint16 leverage) public {
        uint256 invalid;
        if (leverage < 100) {
            invalid = bound(uint256(leverage), 0, 99);
        } else {
            invalid = bound(uint256(leverage), 6001, 10000);
        }

        fundAndApprove(user1, 10e18);
        vm.prank(user1);
        vm.expectRevert(bytes("Invalid leverage"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, invalid);
    }

    function testFuzzBattleDuration(uint256 duration) public {
        duration = bound(duration, 1, 30 days);
        uint256 battleId = createBattleWithTokens(address(0x10), address(0x11), duration);

        (
            ,
            ,
            ,
            ,
            ,
            uint256 startTime,
            uint256 endTime,
            ,
            ,
            ,
            ,
            bool spotlight
        ) = battleManager.battles(battleId);
        spotlight;

        assertEq(endTime - startTime, duration);
    }

    function testFuzzSettlementOrder(uint8 seed) public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user1, 100e18);
        fundAndApprove(user2, 100e18);
        fundAndApprove(user3, 100e18);

        vm.prank(user1);
        uint256 bet1 = bettingPool.placeBet(defaultBattleId, token1, 50e18, 100);
        vm.prank(user2);
        uint256 bet2 = bettingPool.placeBet(defaultBattleId, token2, 50e18, 100);
        vm.prank(user3);
        uint256 bet3 = bettingPool.placeBet(defaultBattleId, token1, 50e18, 200);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        if (seed % 2 == 0) {
            bettingPool.settleBet(bet1);
            bettingPool.settleBet(bet2);
            bettingPool.settleBet(bet3);
        } else {
            bettingPool.settleBet(bet3);
            bettingPool.settleBet(bet2);
            bettingPool.settleBet(bet1);
        }

        assertEq(bettingPool.openBets(defaultBattleId), 0);
        assertEq(bettingPool.totalOpenExposure(), 0);
    }

    function testFuzzOracleTimingWithinMaxAge(uint256 age) public {
        uint256 maxAge = oracle.MAX_METRICS_AGE();
        age = bound(age, 0, maxAge);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        vm.warp(endTime + 1 + age);

        assertTrue(oracle.hasValidMetrics(token1));
    }

    function testFuzzMultipleBattles(uint96 amount) public {
        uint256 minBet = bettingPool.minBetAmount();
        uint256 betAmount = bound(uint256(amount), minBet, 10e18);

        uint256 battleId1 = createBattleWithTokens(address(0x20), address(0x21), 1 hours);
        uint256 battleId2 = createBattleWithTokens(address(0x22), address(0x23), 2 hours);

        fundAndApprove(user1, betAmount * 2);
        vm.startPrank(user1);
        bettingPool.placeBet(battleId1, address(0x20), betAmount, 100);
        bettingPool.placeBet(battleId2, address(0x22), betAmount, 100);
        vm.stopPrank();

        assertEq(bettingPool.openBets(battleId1), 1);
        assertEq(bettingPool.openBets(battleId2), 1);
    }
}
