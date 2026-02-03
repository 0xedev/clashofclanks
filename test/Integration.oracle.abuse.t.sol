// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/Fixture.sol";

contract IntegrationOracleAbuseTest is Fixture {
    function testStaleMetricsRevert() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime, true);

        uint256 maxAge = oracle.MAX_METRICS_AGE();
        vm.warp(endTime + maxAge + 1);

        vm.prank(address(oracle));
        vm.expectRevert(bytes("Token1 metrics invalid"));
        battleManager.completeBattle(defaultBattleId);
    }

    function testMetricsUpdatedMultipleTimesUsesLatest() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);

        submitBattleMetricsAt(endTime + 2, false);

        completeBattleAsOracle(defaultBattleId);
        (, , , , , , , , , address winner, , ) = battleManager.battles(defaultBattleId);
        assertEq(winner, token2);
    }

    function testAdminUpdatesMetricsAfterBets() public {
        fundAndApprove(user1, 100e18);
        fundAndApprove(user2, 100e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 100e18, 100);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token2, 100e18, 100);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        submitBattleMetricsAt(endTime + 2, false);

        completeBattleAsOracle(defaultBattleId);
        (, , , , , , , , , address winner, , ) = battleManager.battles(defaultBattleId);
        assertEq(winner, token2);
    }
}
