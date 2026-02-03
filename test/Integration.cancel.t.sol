// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/Fixture.sol";

contract IntegrationCancelTest is Fixture {
    function testCancelBattlePath() public {
        fundAndApprove(user1, 100e18);
        vm.prank(user1);
        uint256 betId = bettingPool.placeBet(defaultBattleId, token1, 100e18, 100);

        uint256 endTime = battleEndTime(defaultBattleId);
        vm.warp(endTime + battleManager.gracePeriod() + 1);
        battleManager.cancelExpiredBattle(defaultBattleId);

        vm.prank(user1);
        vm.expectRevert(bytes("Battle not active"));
        bettingPool.cashOutBet(betId);

        vm.expectRevert(bytes("Battle not complete"));
        bettingPool.settleBet(betId);

        vm.expectRevert(bytes("Battle has open bets"));
        bettingPool.finalizeBattle(defaultBattleId);

        (, , , , , , bool settled, bool cashedOut, bool liquidated) = bettingPool.bets(betId);
        assertFalse(settled);
        assertFalse(cashedOut);
        assertFalse(liquidated);
    }
}
