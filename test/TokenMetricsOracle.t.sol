// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "test/utils/Fixture.sol";

contract TokenMetricsOracleTest is Fixture {
    function testSubmitMetricsOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        oracle.submitMetrics(token1, 1, 1, 1, 1);
    }

    function testSubmitMetricsStoresAndTimestamp() public {
        uint256 nowTs = block.timestamp + 10;
        vm.warp(nowTs);
        oracle.submitMetrics(token1, 100, 2, 300, 4);

        TokenMetricsOracle.Metrics memory metrics = oracle.getMetrics(token1);
        assertEq(metrics.volumeUSD24h, 100);
        assertEq(metrics.priceUSD, 2);
        assertEq(metrics.liquidityUSD, 300);
        assertEq(metrics.txCount24h, 4);
        assertEq(metrics.timestamp, nowTs);
    }

    function testBatchSubmitMetrics() public {
        address[] memory tokens = new address[](2);
        tokens[0] = token1;
        tokens[1] = token2;
        uint256[] memory volume = new uint256[](2);
        uint256[] memory price = new uint256[](2);
        uint256[] memory liquidity = new uint256[](2);
        uint256[] memory txCount = new uint256[](2);

        volume[0] = 1000;
        volume[1] = 500;
        price[0] = 2;
        price[1] = 1;
        liquidity[0] = 3000;
        liquidity[1] = 1000;
        txCount[0] = 10;
        txCount[1] = 5;

        oracle.submitBatchMetrics(tokens, volume, price, liquidity, txCount);

        TokenMetricsOracle.Metrics memory m1 = oracle.getMetrics(token1);
        TokenMetricsOracle.Metrics memory m2 = oracle.getMetrics(token2);

        assertEq(m1.volumeUSD24h, 1000);
        assertEq(m2.volumeUSD24h, 500);
    }

    function testBatchLengthMismatchReverts() public {
        address[] memory tokens = new address[](2);
        tokens[0] = token1;
        tokens[1] = token2;
        uint256[] memory volume = new uint256[](1);
        uint256[] memory price = new uint256[](2);
        uint256[] memory liquidity = new uint256[](2);
        uint256[] memory txCount = new uint256[](2);

        vm.expectRevert(bytes("Array length mismatch"));
        oracle.submitBatchMetrics(tokens, volume, price, liquidity, txCount);
    }

    function testSubmitMetricsRevertsZeroToken() public {
        vm.expectRevert(bytes("Invalid token"));
        oracle.submitMetrics(address(0), 1, 1, 1, 1);
    }

    function testHasValidMetricsBoundary() public {
        uint256 nowTs = block.timestamp + 10;
        vm.warp(nowTs);
        oracle.submitMetrics(token1, 1, 1, 1, 1);

        uint256 maxAge = oracle.MAX_METRICS_AGE();
        vm.warp(nowTs + maxAge);
        assertTrue(oracle.hasValidMetrics(token1));

        vm.warp(nowTs + maxAge + 1);
        assertFalse(oracle.hasValidMetrics(token1));
    }

    function testCompareTokensWinnerAndScore() public {
        oracle.submitMetrics(token1, 2_000, 3, 2_000, 20);
        oracle.submitMetrics(token2, 1_000, 1, 1_000, 10);

        (address winner, uint256 score1, uint256 score2) = oracle.compareTokens(token1, token2);
        assertEq(winner, token1);

        uint256 expected1 = (2_000 / 1e3) * 40 + (2_000 / 1e3) * 30 + (3 * 20) + (20 * 10);
        uint256 expected2 = (1_000 / 1e3) * 40 + (1_000 / 1e3) * 30 + (1 * 20) + (10 * 10);
        assertEq(score1, expected1);
        assertEq(score2, expected2);
    }

    function testCompareTokensRevertsMissingMetrics() public {
        vm.expectRevert(bytes("Missing metrics"));
        oracle.compareTokens(token1, token2);
    }

    function testCompareTokensRevertsOnTie() public {
        oracle.submitMetrics(token1, 1_000, 1, 1_000, 10);
        oracle.submitMetrics(token2, 1_000, 1, 1_000, 10);

        vm.expectRevert(bytes("Tie score"));
        oracle.compareTokens(token1, token2);
    }

    function testScoreMonotonicity() public {
        oracle.submitMetrics(token1, 2_000, 3, 2_000, 20);
        oracle.submitMetrics(token2, 1_000, 1, 1_000, 10);

        (, uint256 score1, uint256 score2) = oracle.compareTokens(token1, token2);
        assertTrue(score1 > score2);
    }
}
