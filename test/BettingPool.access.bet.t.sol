// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/Fixture.sol";

contract BettingPoolAccessAndBetTest is Fixture {
    function testAccessModeFreeAllowsAll() public {
        battleManager.setAccessMode(BattleManager.AccessMode.Free);
        fundAndApprove(user1, 10e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 100);
    }

    function testAccessModeNFT() public {
        battleManager.setAccessMode(BattleManager.AccessMode.NFT);
        fundAndApprove(user1, 10e18);

        vm.prank(user1);
        vm.expectRevert(bytes("No access"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 100);

        clinkers.mint(user1, 1);
        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 100);
    }

    function testAccessModeCOC() public {
        battleManager.setAccessMode(BattleManager.AccessMode.COC);
        battleManager.setMinCOCHolding(100e18);

        address user4 = address(0xD0D);
        fundAndApprove(user4, 100e18);

        vm.prank(user4);
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 100);

        address user5 = address(0xE0E);
        vm.prank(user5);
        vm.expectRevert(bytes("No access"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 100);
    }

    function testAccessModeNFTOrCOC() public {
        battleManager.setAccessMode(BattleManager.AccessMode.NFT_OR_COC);

        address user4 = address(0xD0D);
        clinkers.mint(user4, 1);
        fundAndApprove(user4, 10e18);

        vm.prank(user4);
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 100);
    }

    function testChangeAccessModeMidBattle() public {
        battleManager.setAccessMode(BattleManager.AccessMode.Free);
        fundAndApprove(user1, 10e18);
        fundAndApprove(user2, 10e18);

        vm.prank(user1);
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 100);

        battleManager.setAccessMode(BattleManager.AccessMode.NFT);

        vm.prank(user2);
        vm.expectRevert(bytes("No access"));
        bettingPool.placeBet(defaultBattleId, token2, 10e18, 100);

        clinkers.mint(user2, 1);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token2, 10e18, 100);
    }

    function testPlaceBetSuccessUpdatesState() public {
        fundAndApprove(user1, 100e18);
        bettingPool.setMinPoolForLeverage(0);

        vm.prank(user1);
        uint256 betId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 200);

        (
            uint256 battleId,
            address bettor,
            address predictedWinner,
            uint256 amount,
            uint256 leverage,
            uint256 timestamp,
            bool settled,
            bool cashedOut,
            bool liquidated
        ) = bettingPool.bets(betId);

        assertEq(battleId, defaultBattleId);
        assertEq(bettor, user1);
        assertEq(predictedWinner, token1);
        assertEq(amount, 100e18);
        assertEq(leverage, 200);
        assertEq(timestamp, block.timestamp);
        assertFalse(settled);
        assertFalse(cashedOut);
        assertFalse(liquidated);

        uint256[] memory userBetIds = bettingPool.getUserBets(user1);
        assertEq(userBetIds.length, 1);
        assertEq(userBetIds[0], betId);

        (uint256 poolAmount, uint256 betCount) = bettingPool.pools(defaultBattleId, token1);
        assertEq(poolAmount, 100e18);
        assertEq(betCount, 1);

        assertEq(bettingPool.openBets(defaultBattleId), 1);
        assertEq(bettingPool.totalPooledAmount(), 100e18);
        assertEq(bettingPool.totalOpenExposure(), 100e18);

        (, , , , , , , , , , uint256 totalBets, ) = battleManager.battles(defaultBattleId);
        assertEq(totalBets, 100e18);
    }

    function testPlaceBetRevertBelowMin() public {
        fundAndApprove(user1, 1e18);
        vm.prank(user1);
        vm.expectRevert(bytes("Below min bet"));
        bettingPool.placeBet(defaultBattleId, token1, 5e17, 100);
    }

    function testPlaceBetRevertInvalidLeverage() public {
        fundAndApprove(user1, 10e18);
        vm.prank(user1);
        vm.expectRevert(bytes("Invalid leverage"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 50);

        vm.prank(user1);
        vm.expectRevert(bytes("Invalid leverage"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 6000);
    }

    function testPlaceBetRevertInvalidPredictedWinner() public {
        fundAndApprove(user1, 10e18);
        vm.prank(user1);
        vm.expectRevert(bytes("Invalid token"));
        bettingPool.placeBet(defaultBattleId, address(0x3), 10e18, 100);
    }

    function testPlaceBetRevertBattleCancelled() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        vm.warp(endTime + battleManager.gracePeriod() + 1);
        battleManager.cancelExpiredBattle(defaultBattleId);

        fundAndApprove(user1, 10e18);
        vm.prank(user1);
        vm.expectRevert(bytes("Battle not active"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 100);
    }

    function testPlaceBetRevertBattleCompleted() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        fundAndApprove(user1, 10e18);
        vm.prank(user1);
        vm.expectRevert(bytes("Battle not active"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 100);
    }

    function testPlaceBetRevertBattleEnded() public {
        uint256 endTime = battleEndTime(defaultBattleId);
        vm.warp(endTime + 1);

        fundAndApprove(user1, 10e18);
        vm.prank(user1);
        vm.expectRevert(bytes("Battle ended"));
        bettingPool.placeBet(defaultBattleId, token1, 10e18, 100);
    }

    function testRecordBetOnlyBettingPool() public {
        vm.prank(user1);
        vm.expectRevert(bytes("Not betting pool"));
        battleManager.recordBet(defaultBattleId, 1e18);
    }
}
