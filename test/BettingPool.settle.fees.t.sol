// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/Fixture.sol";

contract BettingPoolSettlementFeesTest is Fixture {
    function _calcLivePayout(uint256 betId) internal view returns (uint256) {
        (uint256 battleId, , address predictedWinner, uint256 amount, uint256 leverage, , , , ) =
            bettingPool.bets(betId);

        (uint256 winningPool, uint256 losingPool) = _getPools(battleId, predictedWinner);
        if (winningPool == 0) {
            return 0;
        }

        uint256 totalPool = winningPool + losingPool;
        if (totalPool == 0) {
            return 0;
        }

        uint256 basePayout = _calcBasePayout(amount, winningPool, totalPool);
        return _applyLeverageAndClamp(amount, basePayout, leverage);
    }

    function _getPools(uint256 battleId, address predictedWinner)
        internal
        view
        returns (uint256 winningPool, uint256 losingPool)
    {
        (winningPool, ) = bettingPool.pools(battleId, predictedWinner);
        address other = predictedWinner == token1 ? token2 : token1;
        (losingPool, ) = bettingPool.pools(battleId, other);
    }

    function _calcBasePayout(uint256 amount, uint256 winningPool, uint256 totalPool)
        internal
        view
        returns (uint256)
    {
        uint256 winnerPool = (totalPool * bettingPool.winnerPoolBps()) / 10000;
        return (winnerPool * amount) / winningPool;
    }

    function _applyLeverageAndClamp(uint256 amount, uint256 basePayout, uint256 leverage)
        internal
        view
        returns (uint256)
    {
        int256 pnl = int256(basePayout) - int256(amount);
        int256 leveragedPnl = (pnl * int256(leverage)) / 100;
        int256 payoutSigned = int256(amount) + leveragedPnl;
        if (payoutSigned <= 0) {
            return 0;
        }

        uint256 payout = uint256(payoutSigned);
        uint256 balance = cocToken.balanceOf(address(bettingPool));
        return payout > balance ? balance : payout;
    }

    function _placeTwoSidedBets(uint256 amount) internal returns (uint256 bet1, uint256 bet2) {
        fundAndApprove(user1, amount);
        fundAndApprove(user2, amount);

        vm.prank(user1);
        bet1 = bettingPool.placeBet(defaultBattleId, token1, amount, 100);
        vm.prank(user2);
        bet2 = bettingPool.placeBet(defaultBattleId, token2, amount, 100);
    }

    function testCashOutAppliesPenalty() public {
        (uint256 bet1, ) = _placeTwoSidedBets(100e18);

        uint256 livePayout = _calcLivePayout(bet1);
        uint256 balanceBefore = cocToken.balanceOf(user1);

        vm.prank(user1);
        bettingPool.cashOutBet(bet1);

        uint256 balanceAfter = cocToken.balanceOf(user1);
        assertEq(balanceAfter - balanceBefore, (livePayout * 90) / 100);

        (, , , , , , bool settled, bool cashedOut, bool liquidated) = bettingPool.bets(bet1);
        assertFalse(settled);
        assertTrue(cashedOut);
        assertFalse(liquidated);
    }

    function testCashOutRevertsForNonBettor() public {
        (uint256 bet1, ) = _placeTwoSidedBets(10e18);

        vm.prank(user2);
        vm.expectRevert(bytes("Not bettor"));
        bettingPool.cashOutBet(bet1);
    }

    function testCashOutRevertsAfterSettlement() public {
        (uint256 bet1, ) = _placeTwoSidedBets(10e18);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        bettingPool.settleBet(bet1);

        vm.prank(user1);
        vm.expectRevert(bytes("Already settled"));
        bettingPool.cashOutBet(bet1);
    }

    function testCashOutRevertsAfterCashOut() public {
        (uint256 bet1, ) = _placeTwoSidedBets(10e18);

        vm.prank(user1);
        bettingPool.cashOutBet(bet1);

        vm.prank(user1);
        vm.expectRevert(bytes("Already cashed out"));
        bettingPool.cashOutBet(bet1);
    }

    function testCashOutRevertsAfterLiquidation() public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user2, 500e18);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token1, 500e18, 100);

        fundAndApprove(user1, 100e18);
        vm.prank(user1);
        uint256 betId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 500);

        bettingPool.liquidate(betId);

        vm.prank(user1);
        vm.expectRevert(bytes("Already liquidated"));
        bettingPool.cashOutBet(betId);
    }

    function testCashOutRevertsAfterBattleEnd() public {
        (uint256 bet1, ) = _placeTwoSidedBets(10e18);

        uint256 endTime = battleEndTime(defaultBattleId);
        vm.warp(endTime + 1);

        vm.prank(user1);
        vm.expectRevert(bytes("Battle ended"));
        bettingPool.cashOutBet(bet1);
    }

    function testLiquidationOnlyOwner() public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user1, 100e18);
        vm.prank(user1);
        uint256 betId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 200);

        vm.prank(user1);
        vm.expectRevert();
        bettingPool.liquidate(betId);
    }

    function testLiquidationRevertsIfPayoutPositive() public {
        (uint256 bet1, ) = _placeTwoSidedBets(100e18);

        vm.expectRevert(bytes("Not liquidatable"));
        bettingPool.liquidate(bet1);
    }

    function testLiquidationMarksAndReducesExposure() public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user2, 500e18);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token1, 500e18, 100);

        fundAndApprove(user1, 100e18);
        vm.prank(user1);
        uint256 betId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 500);

        bettingPool.liquidate(betId);
        assertEq(bettingPool.totalOpenExposure(), 0);

        (, , , , , , bool settled, bool cashedOut, bool liquidated) = bettingPool.bets(betId);
        assertTrue(liquidated);
        assertFalse(settled);
        assertFalse(cashedOut);
    }

    function testLiquidateRightBeforeBattleEnd() public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user2, 500e18);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token1, 500e18, 100);

        fundAndApprove(user1, 100e18);
        vm.prank(user1);
        uint256 betId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 500);

        uint256 endTime = battleEndTime(defaultBattleId);
        vm.warp(endTime - 1);
        bettingPool.liquidate(betId);

        (, , , , , , , , bool liquidated) = bettingPool.bets(betId);
        assertTrue(liquidated);
    }

    function testSettleWinningAndLosingBets() public {
        (uint256 bet1, uint256 bet2) = _placeTwoSidedBets(100e18);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        uint256 winnerBefore = cocToken.balanceOf(user1);
        uint256 loserBefore = cocToken.balanceOf(user2);

        bettingPool.settleBet(bet1);
        bettingPool.settleBet(bet2);

        uint256 winnerAfter = cocToken.balanceOf(user1);
        uint256 loserAfter = cocToken.balanceOf(user2);

        assertTrue(winnerAfter > winnerBefore);
        assertEq(loserAfter, loserBefore);
    }

    function testSettleCannotSettleTwice() public {
        (uint256 bet1, ) = _placeTwoSidedBets(10e18);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        bettingPool.settleBet(bet1);
        vm.expectRevert(bytes("Already settled"));
        bettingPool.settleBet(bet1);
    }

    function testSettleCannotSettleCashedOut() public {
        (uint256 bet1, ) = _placeTwoSidedBets(10e18);

        vm.prank(user1);
        bettingPool.cashOutBet(bet1);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        vm.expectRevert(bytes("Already cashed out"));
        bettingPool.settleBet(bet1);
    }

    function testSettleCannotSettleLiquidated() public {
        bettingPool.setMinPoolForLeverage(0);
        fundAndApprove(user2, 500e18);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token1, 500e18, 100);

        fundAndApprove(user1, 100e18);
        vm.prank(user1);
        uint256 betId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 500);
        bettingPool.liquidate(betId);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        vm.expectRevert(bytes("Already liquidated"));
        bettingPool.settleBet(betId);
    }

    function testSettlementUpdatesExposure() public {
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

    function testPayoutCappedByBalance() public {
        bettingPool.setMinPoolForLeverage(0);

        cocToken.mint(owner, 5_000e18);
        cocToken.approve(address(bettingPool), 5_000e18);
        bettingPool.depositReserve(5_000e18);

        fundAndApprove(user2, 100e18);
        fundAndApprove(user3, 100e18);
        vm.prank(user2);
        bettingPool.placeBet(defaultBattleId, token1, 100e18, 100);
        vm.prank(user3);
        bettingPool.placeBet(defaultBattleId, token2, 100e18, 100);

        fundAndApprove(user1, 100e18);
        vm.prank(user1);
        uint256 highBetId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 5000);

        bettingPool.withdrawReserve(5_000e18);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        uint256 poolBalanceBefore = cocToken.balanceOf(address(bettingPool));
        uint256 userBefore = cocToken.balanceOf(user1);

        bettingPool.settleBet(highBetId);

        uint256 userAfter = cocToken.balanceOf(user1);
        assertEq(userAfter - userBefore, poolBalanceBefore);
    }

    function testFinalizeDistributesFeesOnce() public {
        (uint256 bet1, uint256 bet2) = _placeTwoSidedBets(100e18);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        bettingPool.settleBet(bet1);
        bettingPool.settleBet(bet2);

        bettingPool.finalizeBattle(defaultBattleId);
        vm.expectRevert(bytes("Fees already distributed"));
        bettingPool.finalizeBattle(defaultBattleId);
    }

    function testFinalizeRevertsWhenOpenBets() public {
        (uint256 bet1, ) = _placeTwoSidedBets(100e18);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        bettingPool.settleBet(bet1);
        vm.expectRevert(bytes("Battle has open bets"));
        bettingPool.finalizeBattle(defaultBattleId);
    }

    function testFeesDistributedCorrectly() public {
        (uint256 bet1, uint256 bet2) = _placeTwoSidedBets(100e18);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        uint256 winnerBefore = cocToken.balanceOf(user1);
        uint256 platformBefore = cocToken.balanceOf(platformWallet);
        uint256 deployer1Before = cocToken.balanceOf(deployer1);
        uint256 deployer2Before = cocToken.balanceOf(deployer2);
        uint256 stakerBefore = staking.rewardPool();

        bettingPool.settleBet(bet1);
        bettingPool.settleBet(bet2);

        uint256 winnerAfter = cocToken.balanceOf(user1);
        uint256 payout = winnerAfter - winnerBefore;

        bettingPool.finalizeBattle(defaultBattleId);

        uint256 platformAfter = cocToken.balanceOf(platformWallet);
        uint256 deployer1After = cocToken.balanceOf(deployer1);
        uint256 deployer2After = cocToken.balanceOf(deployer2);
        uint256 stakerAfter = staking.rewardPool();

        uint256 platformFee = platformAfter - platformBefore;
        uint256 deployerFee1 = deployer1After - deployer1Before;
        uint256 deployerFee2 = deployer2After - deployer2Before;
        uint256 stakerFee = stakerAfter - stakerBefore;

        assertEq(platformFee, 20e18);
        assertEq(deployerFee1, 5e18);
        assertEq(deployerFee2, 5e18);
        assertEq(stakerFee, 10e18);

        uint256 totalFees = platformFee + deployerFee1 + deployerFee2 + stakerFee;
        assertEq(payout + totalFees, 200e18);
    }

    function testFinalizeRevertsWhenPlatformWalletUnset() public {
        MockERC20 localToken = new MockERC20("COC", "COC");
        MockERC721 localNft = new MockERC721("Clinkers", "CLNK");
        BattleManager localManager = new BattleManager(address(localNft), address(localToken));
        BettingPool localPool = new BettingPool(address(localManager), address(localToken), 1e18);
        TokenMetricsOracle localOracle = new TokenMetricsOracle();
        MockStaking localStaking = new MockStaking(address(localToken));

        localManager.setAccessMode(BattleManager.AccessMode.Free);
        localManager.setBettingPool(address(localPool));
        localManager.setOracle(address(localOracle));
        localPool.setStakingContract(address(localStaking));

        uint256 battleId = localManager.createBattle(
            token1,
            token2,
            deployer1,
            deployer2,
            1 hours,
            BattleManager.BattleTheme.MiniApp,
            false
        );

        localToken.mint(user1, 10e18);
        localToken.mint(user2, 10e18);
        vm.startPrank(user1);
        localToken.approve(address(localPool), 10e18);
        uint256 bet1 = localPool.placeBet(battleId, token1, 10e18, 100);
        vm.stopPrank();
        vm.startPrank(user2);
        localToken.approve(address(localPool), 10e18);
        uint256 bet2 = localPool.placeBet(battleId, token2, 10e18, 100);
        vm.stopPrank();

        (, , , , , , uint256 endTime, , , , , ) = localManager.battles(battleId);
        vm.warp(endTime + 1);
        localOracle.submitMetrics(token1, 2_000, 3, 2_000, 20);
        localOracle.submitMetrics(token2, 1_000, 1, 1_000, 10);

        vm.prank(address(localOracle));
        localManager.completeBattle(battleId);

        localPool.settleBet(bet1);
        localPool.settleBet(bet2);

        vm.expectRevert(bytes("Platform wallet not set"));
        localPool.finalizeBattle(battleId);
    }

    function testFinalizeRevertsWhenStakingUnset() public {
        (uint256 bet1, uint256 bet2) = _placeTwoSidedBets(10e18);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        bettingPool.settleBet(bet1);
        bettingPool.settleBet(bet2);

        bettingPool.setStakingContract(address(0));

        vm.expectRevert(bytes("Staking not set"));
        bettingPool.finalizeBattle(defaultBattleId);
    }
}
