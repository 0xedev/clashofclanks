// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/TestBase.sol";
import "contracts/core/BattleManager.sol";
import "contracts/core/BettingPool.sol";
import "test/mocks/MockERC20.sol";
import "test/mocks/MockERC721.sol";
import "test/mocks/MockStaking.sol";
import "test/mocks/MockOracle.sol";

contract BettingPoolTest is TestBase {
    BattleManager private battleManager;
    BettingPool private bettingPool;
    MockERC20 private cocToken;
    MockERC721 private clinkers;
    MockStaking private staking;
    MockOracle private oracle;

    address private user1 = address(0xA11CE);
    address private user2 = address(0xB0B);
    address private platformWallet = address(0xCAFE);
    address private deployer1 = address(0xD1);
    address private deployer2 = address(0xD2);

    uint256 private battleId;

    function setUp() public {
        cocToken = new MockERC20("COC", "COC");
        clinkers = new MockERC721("Clinkers", "CLNK");
        battleManager = new BattleManager(address(clinkers), address(cocToken));
        bettingPool = new BettingPool(address(battleManager), address(cocToken), 1e18);
        staking = new MockStaking(address(cocToken));
        oracle = new MockOracle();

        battleManager.setAccessMode(BattleManager.AccessMode.Free);
        battleManager.setBettingPool(address(bettingPool));
        battleManager.setOracle(address(oracle));
        bettingPool.setStakingContract(address(staking));
        bettingPool.setPlatformWallet(platformWallet);

        battleId = battleManager.createBattle(
            address(0x1),
            address(0x2),
            deployer1,
            deployer2,
            2 days,
            BattleManager.BattleTheme.MiniApp,
            false
        );

        cocToken.mint(user1, 1000e18);
        cocToken.mint(user2, 1000e18);
    }

    function testPlaceBetAndOdds() public {
        vm.startPrank(user1);
        cocToken.approve(address(bettingPool), 100e18);
        bettingPool.placeBet(battleId, address(0x1), 100e18, 100);
        vm.stopPrank();

        vm.startPrank(user2);
        cocToken.approve(address(bettingPool), 200e18);
        bettingPool.placeBet(battleId, address(0x2), 200e18, 100);
        vm.stopPrank();

        (address token1, address token2, uint256 odds1, uint256 odds2) = bettingPool.getOdds(battleId);
        assertEq(token1, address(0x1));
        assertEq(token2, address(0x2));
        assertEq(odds1, 2e18);
        assertEq(odds2, 5e17);
    }

    function testCashoutUpdatesPool() public {
        vm.startPrank(user1);
        cocToken.approve(address(bettingPool), 100e18);
        uint256 betId = bettingPool.placeBet(battleId, address(0x1), 100e18, 100);
        vm.stopPrank();

        (uint256 poolBefore, ) = bettingPool.pools(battleId, address(0x1));
        assertEq(poolBefore, 100e18);

        vm.prank(user1);
        bettingPool.cashOutBet(betId);

        (uint256 poolAfter, ) = bettingPool.pools(battleId, address(0x1));
        assertEq(poolAfter, 0);
        assertEq(bettingPool.totalPooledAmount(), 0);

        (, , , , , , bool settled, bool cashedOut, bool liquidated) = bettingPool.bets(betId);
        assertFalse(settled);
        assertTrue(cashedOut);
        assertFalse(liquidated);
    }

    function testSettlementDistributesFees() public {
        vm.startPrank(user1);
        cocToken.approve(address(bettingPool), 100e18);
        uint256 betId1 = bettingPool.placeBet(battleId, address(0x1), 100e18, 100);
        vm.stopPrank();

        vm.startPrank(user2);
        cocToken.approve(address(bettingPool), 100e18);
        uint256 betId2 = bettingPool.placeBet(battleId, address(0x2), 100e18, 100);
        vm.stopPrank();

        oracle.setWinner(address(0x1));
        oracle.setTimestamp(block.timestamp + 2 days + 1);

        vm.warp(block.timestamp + 2 days + 1);
        oracle.completeBattle(battleManager, battleId);

        uint256 platformBefore = cocToken.balanceOf(platformWallet);
        uint256 deployer1Before = cocToken.balanceOf(deployer1);
        uint256 deployer2Before = cocToken.balanceOf(deployer2);
        uint256 stakerBefore = staking.rewardPool();

        bettingPool.settleBet(betId1);
        bettingPool.settleBet(betId2);

        bettingPool.finalizeBattle(battleId);

        uint256 platformAfter = cocToken.balanceOf(platformWallet);
        uint256 deployer1After = cocToken.balanceOf(deployer1);
        uint256 deployer2After = cocToken.balanceOf(deployer2);
        uint256 stakerAfter = staking.rewardPool();

        assertEq(platformAfter - platformBefore, 20e18);
        assertEq(deployer1After - deployer1Before, 5e18);
        assertEq(deployer2After - deployer2Before, 5e18);
        assertEq(stakerAfter - stakerBefore, 10e18);
    }

    function testLiquidationClosesPosition() public {
        cocToken.mint(address(this), 1000e18);
        cocToken.approve(address(bettingPool), 1000e18);
        bettingPool.depositReserve(1000e18);

        bettingPool.setMinPoolForLeverage(0);

        vm.startPrank(user1);
        cocToken.approve(address(bettingPool), 100e18);
        uint256 betId = bettingPool.placeBet(battleId, address(0x1), 100e18, 500);
        vm.stopPrank();

        bettingPool.liquidate(betId);

        (, , , , , , bool settled, bool cashedOut, bool liquidated) = bettingPool.bets(betId);
        assertFalse(settled);
        assertFalse(cashedOut);
        assertTrue(liquidated);
        (uint256 poolAmount, ) = bettingPool.pools(battleId, address(0x1));
        assertEq(poolAmount, 0);
    }
}
