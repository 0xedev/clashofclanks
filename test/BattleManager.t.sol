// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/TestBase.sol";
import "contracts/core/BattleManager.sol";
import "test/mocks/MockERC20.sol";
import "test/mocks/MockERC721.sol";
import "test/mocks/MockOracle.sol";

contract BattleManagerTest is TestBase {
    BattleManager private battleManager;
    MockERC20 private cocToken;
    MockERC721 private clinkers;
    MockOracle private oracle;

    address private user = address(0xBEEF);

    function setUp() public {
        cocToken = new MockERC20("COC", "COC");
        clinkers = new MockERC721("Clinkers", "CLNK");
        battleManager = new BattleManager(address(clinkers), address(cocToken));
        oracle = new MockOracle();
        battleManager.setOracle(address(oracle));
    }

    function testAccessModeFreeAllowsAll() public {
        battleManager.setAccessMode(BattleManager.AccessMode.Free);
        assertTrue(battleManager.hasAccess(user));
    }

    function testAccessModeNFT() public {
        battleManager.setAccessMode(BattleManager.AccessMode.NFT);
        assertFalse(battleManager.hasAccess(user));
        clinkers.mint(user, 1);
        assertTrue(battleManager.hasAccess(user));
    }

    function testAccessModeCOC() public {
        battleManager.setAccessMode(BattleManager.AccessMode.COC);
        battleManager.setMinCOCHolding(100e18);
        assertFalse(battleManager.hasAccess(user));
        cocToken.mint(user, 100e18);
        assertTrue(battleManager.hasAccess(user));
    }

    function testCreateBattle() public {
        uint256 battleId = battleManager.createBattle(
            address(0x1),
            address(0x2),
            address(0x3),
            address(0x4),
            1 days,
            BattleManager.BattleTheme.MiniApp,
            false
        );

        assertEq(battleId, 1);
        uint256[] memory active = battleManager.getActiveBattles();
        assertEq(active.length, 1);
        assertEq(active[0], 1);

        (
            uint256 id,
            address token1,
            address token2,
            address deployer1,
            address deployer2,
            uint256 startTime,
            uint256 endTime,
            BattleManager.BattleStatus status,
            BattleManager.BattleTheme theme,
            address winner,
            uint256 totalBets,
            bool spotlightBattle
        ) = battleManager.battles(battleId);

        id;
        deployer1;
        deployer2;
        startTime;
        endTime;
        theme;
        winner;
        totalBets;
        spotlightBattle;

        assertEq(token1, address(0x1));
        assertEq(token2, address(0x2));
        assertEq(uint256(status), uint256(BattleManager.BattleStatus.Active));
    }

    function testCompleteBattleUsesOracle() public {
        uint256 battleId = battleManager.createBattle(
            address(0x1),
            address(0x2),
            address(0x3),
            address(0x4),
            1 days,
            BattleManager.BattleTheme.MiniApp,
            false
        );

        oracle.setWinner(address(0x1));
        oracle.setTimestamp(block.timestamp + 1 days + 1);
        vm.warp(block.timestamp + 1 days + 1);
        oracle.completeBattle(battleManager, battleId);

        (, , , , , , , BattleManager.BattleStatus status, , address winner, , ) = battleManager.battles(battleId);
        assertEq(uint256(status), uint256(BattleManager.BattleStatus.Completed));
        assertEq(winner, address(0x1));
    }
}
