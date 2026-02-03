// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "contracts/core/BattleManager.sol";
import "contracts/core/BettingPool.sol";
import "contracts/oracle/TokenMetricsOracle.sol";
import "test/mocks/MockERC20.sol";
import "test/mocks/MockERC721.sol";
import "test/mocks/MockStaking.sol";

contract Fixture is Test {
    BattleManager internal battleManager;
    BettingPool internal bettingPool;
    TokenMetricsOracle internal oracle;
    MockERC20 internal cocToken;
    MockERC721 internal clinkers;
    MockStaking internal staking;

    address internal owner;
    address internal user1;
    address internal user2;
    address internal user3;
    address internal platformWallet;
    address internal deployer1;
    address internal deployer2;
    address internal token1;
    address internal token2;

    uint256 internal defaultBattleId;
    uint256 internal defaultDuration = 30 minutes;

    function setUp() public virtual {
        owner = address(this);
        user1 = address(0xA11CE);
        user2 = address(0xB0B);
        user3 = address(0xC0C);
        platformWallet = address(0xCAFE);
        deployer1 = address(0xD1);
        deployer2 = address(0xD2);
        token1 = address(0x1);
        token2 = address(0x2);

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

        defaultBattleId = createBattle(defaultDuration);

        cocToken.mint(user1, 1_000_000e18);
        cocToken.mint(user2, 1_000_000e18);
        cocToken.mint(user3, 1_000_000e18);
    }

    function createBattle(uint256 duration) internal returns (uint256) {
        return battleManager.createBattle(
            token1,
            token2,
            deployer1,
            deployer2,
            duration,
            BattleManager.BattleTheme.MiniApp,
            false
        );
    }

    function createBattleWithTokens(
        address _token1,
        address _token2,
        uint256 duration
    ) internal returns (uint256) {
        return battleManager.createBattle(
            _token1,
            _token2,
            deployer1,
            deployer2,
            duration,
            BattleManager.BattleTheme.MiniApp,
            false
        );
    }

    function battleEndTime(uint256 battleId) internal view returns (uint256 endTime) {
        (, , , , , , endTime, , , , , ) = battleManager.battles(battleId);
    }

    function fundAndApprove(address user, uint256 amount) internal {
        cocToken.mint(user, amount);
        vm.startPrank(user);
        cocToken.approve(address(bettingPool), amount);
        vm.stopPrank();
    }

    function submitMetrics(
        address token,
        uint256 volume,
        uint256 price,
        uint256 liquidity,
        uint256 txCount
    ) internal {
        oracle.submitMetrics(token, volume, price, liquidity, txCount);
    }

    function submitMetricsAt(
        uint256 timestamp,
        address token,
        uint256 volume,
        uint256 price,
        uint256 liquidity,
        uint256 txCount
    ) internal {
        vm.warp(timestamp);
        oracle.submitMetrics(token, volume, price, liquidity, txCount);
    }

    function submitBattleMetricsAt(uint256 timestamp, bool token1Wins) internal {
        vm.warp(timestamp);
        if (token1Wins) {
            submitMetrics(token1, 2_000, 3, 2_000, 20);
            submitMetrics(token2, 1_000, 1, 1_000, 10);
        } else {
            submitMetrics(token1, 1_000, 1, 1_000, 10);
            submitMetrics(token2, 2_000, 3, 2_000, 20);
        }
    }

    function completeBattleAsOracle(uint256 battleId) internal {
        vm.prank(address(oracle));
        battleManager.completeBattle(battleId);
    }
}
