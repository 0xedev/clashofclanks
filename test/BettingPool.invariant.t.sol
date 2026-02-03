// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "contracts/core/BattleManager.sol";
import "contracts/core/BettingPool.sol";
import "contracts/oracle/TokenMetricsOracle.sol";
import "test/mocks/MockERC20.sol";
import "test/mocks/MockERC721.sol";
import "test/mocks/MockStaking.sol";

contract BettingPoolHandler is Test {
    BettingPool public bettingPool;
    MockERC20 public cocToken;
    BattleManager public battleManager;
    uint256 public battleId;
    address public token1;
    address public token2;
    address[] public actors;

    uint256[] public betIds;

    constructor(
        BettingPool _bettingPool,
        MockERC20 _cocToken,
        BattleManager _battleManager,
        uint256 _battleId,
        address _token1,
        address _token2,
        address[] memory _actors
    ) {
        bettingPool = _bettingPool;
        cocToken = _cocToken;
        battleManager = _battleManager;
        battleId = _battleId;
        token1 = _token1;
        token2 = _token2;
        actors = _actors;
    }

    function placeBet(uint256 actorSeed, uint256 amountSeed, uint256 leverageSeed, bool pickToken1) external {
        if (actors.length == 0) {
            return;
        }
        address actor = actors[actorSeed % actors.length];

        uint256 minBet = bettingPool.minBetAmount();
        uint256 amount = bound(amountSeed, minBet, 50e18);
        uint256 maxLev = bettingPool.getMaxLeverage(battleId);
        if (maxLev < 100) {
            return;
        }
        uint256 leverage = bound(leverageSeed, 100, maxLev);

        vm.prank(actor);
        uint256 betId = bettingPool.placeBet(battleId, pickToken1 ? token1 : token2, amount, leverage);
        betIds.push(betId);
    }

    function cashOut(uint256 betIndexSeed) external {
        if (betIds.length == 0) {
            return;
        }
        uint256 betId = betIds[betIndexSeed % betIds.length];

        (
            ,
            address bettor,
            ,
            ,
            ,
            ,
            bool settled,
            bool cashedOut,
            bool liquidated
        ) = bettingPool.bets(betId);

        if (settled || cashedOut || liquidated) {
            return;
        }

        vm.prank(bettor);
        bettingPool.cashOutBet(betId);
    }

    function betCount() external view returns (uint256) {
        return betIds.length;
    }
}

contract BettingPoolInvariantTest is Test {
    BettingPool internal bettingPool;
    BattleManager internal battleManager;
    TokenMetricsOracle internal oracle;
    MockERC20 internal cocToken;
    MockERC721 internal clinkers;
    MockStaking internal staking;

    address internal token1 = address(0x1);
    address internal token2 = address(0x2);
    address internal deployer1 = address(0xD1);
    address internal deployer2 = address(0xD2);
    address internal platformWallet = address(0xCAFE);

    uint256 internal battleId;
    BettingPoolHandler internal handler;

    function setUp() public {
        cocToken = new MockERC20("COC", "COC");
        clinkers = new MockERC721("Clinkers", "CLNK");
        battleManager = new BattleManager(address(clinkers), address(cocToken));
        bettingPool = new BettingPool(address(battleManager), address(cocToken), 1e18);
        oracle = new TokenMetricsOracle();
        staking = new MockStaking(address(cocToken));

        battleManager.setAccessMode(BattleManager.AccessMode.Free);
        battleManager.setBettingPool(address(bettingPool));
        battleManager.setOracle(address(oracle));
        bettingPool.setStakingContract(address(staking));
        bettingPool.setPlatformWallet(platformWallet);
        bettingPool.setMinPoolForLeverage(0);

        battleId = battleManager.createBattle(
            token1,
            token2,
            deployer1,
            deployer2,
            30 days,
            BattleManager.BattleTheme.MiniApp,
            false
        );

        address[] memory actors = new address[](3);
        actors[0] = address(0xA11CE);
        actors[1] = address(0xB0B);
        actors[2] = address(0xC0C);

        for (uint256 i = 0; i < actors.length; i++) {
            cocToken.mint(actors[i], 1_000_000e18);
            vm.prank(actors[i]);
            cocToken.approve(address(bettingPool), type(uint256).max);
        }

        cocToken.mint(address(this), 1_000_000_000e18);
        cocToken.approve(address(bettingPool), 1_000_000_000e18);
        bettingPool.depositReserve(1_000_000_000e18);

        handler = new BettingPoolHandler(bettingPool, cocToken, battleManager, battleId, token1, token2, actors);

        handler.placeBet(0, 25e18, 100, true);
        handler.placeBet(1, 30e18, 100, false);
    }

    function test_invariant_exposureBounds() public {
        assertTrue(
            bettingPool.totalCommittedExposure() <= bettingPool.totalPooledAmount() + bettingPool.platformReserve()
        );
    }

    function test_invariant_openExposureBounds() public {
        assertTrue(bettingPool.totalOpenExposure() <= bettingPool.totalCommittedExposure());
    }

    function test_invariant_betFlagsExclusive() public {
        uint256 count = handler.betCount();
        for (uint256 i = 0; i < count; i++) {
            uint256 betId = handler.betIds(i);
            (, , , , , , bool settled, bool cashedOut, bool liquidated) = bettingPool.bets(betId);
            uint256 flags = (settled ? 1 : 0) + (cashedOut ? 1 : 0) + (liquidated ? 1 : 0);
            assertTrue(flags <= 1);
        }
    }

    function test_invariant_openBetsConsistent() public {
        uint256 count = handler.betCount();
        uint256 openCount = 0;
        for (uint256 i = 0; i < count; i++) {
            uint256 betId = handler.betIds(i);
            (, , , , , , bool settled, bool cashedOut, bool liquidated) = bettingPool.bets(betId);
            if (!settled && !cashedOut && !liquidated) {
                openCount++;
            }
        }
        assertEq(bettingPool.openBets(battleId), openCount);
    }
}
