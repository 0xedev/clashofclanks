// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/Fixture.sol";

contract BattleManagerExtendedTest is Fixture {
    function _assertActiveContains(uint256 battleId, bool expected) internal {
        uint256[] memory active = battleManager.getActiveBattles();
        bool found;
        for (uint256 i = 0; i < active.length; i++) {
            if (active[i] == battleId) {
                found = true;
                break;
            }
        }
        if (expected) {
            assertTrue(found);
        } else {
            assertFalse(found);
        }
    }

    function _assertBattleFields(uint256 battleId) internal {
        (uint256 id, , , , , , , , , , , ) = battleManager.battles(battleId);
        assertEq(id, battleId);

        (, address t1, , , , , , , , , , ) = battleManager.battles(battleId);
        assertEq(t1, address(0x3));

        (, , address t2, , , , , , , , , ) = battleManager.battles(battleId);
        assertEq(t2, address(0x4));

        (, , , address d1, , , , , , , , ) = battleManager.battles(battleId);
        assertEq(d1, deployer1);

        (, , , , address d2, , , , , , , ) = battleManager.battles(battleId);
        assertEq(d2, deployer2);

        (, , , , , uint256 startTime, uint256 endTime, , , , , ) = battleManager.battles(battleId);
        assertTrue(endTime > startTime);

        (, , , , , , , BattleManager.BattleStatus status, , , , ) = battleManager.battles(battleId);
        assertEq(uint256(status), uint256(BattleManager.BattleStatus.Active));

        (, , , , , , , , BattleManager.BattleTheme theme, , , ) = battleManager.battles(battleId);
        assertEq(uint256(theme), uint256(BattleManager.BattleTheme.MiniApp));

        (, , , , , , , , , address winner, , ) = battleManager.battles(battleId);
        assertEq(winner, address(0));

        (, , , , , , , , , , uint256 totalBets, ) = battleManager.battles(battleId);
        assertEq(totalBets, 0);

        (, , , , , , , , , , , bool spotlight) = battleManager.battles(battleId);
        assertFalse(spotlight);
    }

    function testCreateBattleValid() public {
        uint256 beforeCounter = battleManager.battleCounter();
        uint256 battleId = createBattleWithTokens(address(0x3), address(0x4), 1 days);
        uint256 afterCounter = battleManager.battleCounter();

        assertEq(afterCounter, beforeCounter + 1);
        assertEq(battleId, afterCounter);

        _assertBattleFields(battleId);
        _assertActiveContains(battleId, true);
    }

    function testCreateBattleRevertSameToken() public {
        vm.expectRevert(bytes("Same token"));
        battleManager.createBattle(
            token1,
            token1,
            deployer1,
            deployer2,
            1 days,
            BattleManager.BattleTheme.MiniApp,
            false
        );
    }

    function testCreateBattleRevertZeroToken() public {
        vm.expectRevert(bytes("Invalid token"));
        battleManager.createBattle(
            address(0),
            token2,
            deployer1,
            deployer2,
            1 days,
            BattleManager.BattleTheme.MiniApp,
            false
        );

        vm.expectRevert(bytes("Invalid token"));
        battleManager.createBattle(
            token1,
            address(0),
            deployer1,
            deployer2,
            1 days,
            BattleManager.BattleTheme.MiniApp,
            false
        );
    }

    function testCompleteBattleOnlyOracle() public {
        vm.prank(user1);
        vm.expectRevert(bytes("Not oracle"));
        battleManager.completeBattle(defaultBattleId);
    }

    function testCompleteBattleRevertNotActive() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        vm.warp(endTime + battleManager.gracePeriod() + 1);
        battleManager.cancelExpiredBattle(defaultBattleId);

        submitBattleMetricsAt(block.timestamp, true);
        vm.prank(address(oracle));
        vm.expectRevert(bytes("Not active"));
        battleManager.completeBattle(defaultBattleId);
    }

    function testCompleteBattleRevertBeforeEndTime() public {
        submitBattleMetricsAt(block.timestamp, true);
        vm.prank(address(oracle));
        vm.expectRevert(bytes("Battle not ended"));
        battleManager.completeBattle(defaultBattleId);
    }

    function testCompleteBattleRevertMissingToken1Metrics() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        submitMetricsAt(endTime + 1, token2, 1_000, 1, 1_000, 10);

        vm.prank(address(oracle));
        vm.expectRevert(bytes("Token1 metrics invalid"));
        battleManager.completeBattle(defaultBattleId);
    }

    function testCompleteBattleRevertMissingToken2Metrics() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        submitMetricsAt(endTime + 1, token1, 1_000, 1, 1_000, 10);

        vm.prank(address(oracle));
        vm.expectRevert(bytes("Token2 metrics invalid"));
        battleManager.completeBattle(defaultBattleId);
    }

    function testCompleteBattleRevertMetricsBeforeEnd() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime - 1, true);

        vm.warp(endTime + 1);
        vm.prank(address(oracle));
        vm.expectRevert(bytes("Metrics before battle end"));
        battleManager.completeBattle(defaultBattleId);
    }

    function testCompleteBattleSetsWinnerAndRemovesActive() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);

        completeBattleAsOracle(defaultBattleId);

        (, , , , , , , BattleManager.BattleStatus status, , , , ) = battleManager.battles(defaultBattleId);
        assertEq(uint256(status), uint256(BattleManager.BattleStatus.Completed));
        (, , , , , , , , , address winner, , ) = battleManager.battles(defaultBattleId);
        assertEq(winner, token1);

        _assertActiveContains(defaultBattleId, false);
    }

    function testCancelBattleOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        battleManager.cancelExpiredBattle(defaultBattleId);
    }

    function testCancelBattleGracePeriod() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        vm.warp(endTime + battleManager.gracePeriod());
        vm.expectRevert(bytes("Grace period active"));
        battleManager.cancelExpiredBattle(defaultBattleId);
    }

    function testCancelBattleTransitionsAndRemovesActive() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        vm.warp(endTime + battleManager.gracePeriod() + 1);
        battleManager.cancelExpiredBattle(defaultBattleId);

        (, , , , , , , BattleManager.BattleStatus status, , , , ) = battleManager.battles(defaultBattleId);
        assertEq(uint256(status), uint256(BattleManager.BattleStatus.Cancelled));

        _assertActiveContains(defaultBattleId, false);
    }
}
