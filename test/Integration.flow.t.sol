// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/Fixture.sol";

contract IntegrationFlowTest is Fixture {
    function testFullBattleFlow() public {
        bettingPool.setMinPoolForLeverage(0);

        cocToken.mint(address(this), 100e18);
        cocToken.approve(address(bettingPool), 100e18);
        bettingPool.depositReserve(100e18);

        fundAndApprove(user1, 200e18);
        fundAndApprove(user2, 200e18);
        fundAndApprove(user3, 200e18);

        vm.prank(user1);
        uint256 bet1 = bettingPool.placeBet(defaultBattleId, token1, 100e18, 100);
        vm.prank(user2);
        uint256 bet2 = bettingPool.placeBet(defaultBattleId, token2, 50e18, 100);
        vm.prank(user3);
        uint256 bet3 = bettingPool.placeBet(defaultBattleId, token1, 50e18, 200);

        uint256 endTime = battleEndTime(defaultBattleId);
        submitBattleMetricsAt(endTime + 1, true);
        completeBattleAsOracle(defaultBattleId);

        bettingPool.settleBet(bet1);
        bettingPool.settleBet(bet2);
        bettingPool.settleBet(bet3);
        bettingPool.finalizeBattle(defaultBattleId);

        assertEq(bettingPool.openBets(defaultBattleId), 0);
        assertEq(bettingPool.totalOpenExposure(), 0);
        assertTrue(bettingPool.battleFeesDistributed(defaultBattleId));
    }
}
