/**
 * Uniswap V4 Subgraph Queries
 * Fetches token metrics from The Graph for battle finalization
 */

// Base mainnet Uniswap V4 subgraph endpoint
const UNISWAP_V4_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v4-base";

export interface TokenMetrics {
  address: string;
  symbol: string;
  name: string;
  volumeUSD24h: number;
  priceUSD: number;
  liquidityUSD: number;
  txCount24h: number;
  timestamp: number;
}

export interface BattleMetrics {
  token1: TokenMetrics;
  token2: TokenMetrics;
  winner: string;
  score1: number;
  score2: number;
}

/**
 * Fetch token metrics from Uniswap V4 subgraph
 */
export async function fetchTokenMetrics(
  tokenAddress: string,
): Promise<TokenMetrics | null> {
  const query = `
    query GetTokenMetrics($tokenAddress: String!) {
      token(id: $tokenAddress) {
        id
        symbol
        name
        volumeUSD
      }
      
      tokenDayDatas(
        first: 1,
        where: { token: $tokenAddress },
        orderBy: date,
        orderDirection: desc
      ) {
        date
        volumeUSD
        priceUSD
        totalValueLockedUSD
        open
        high
        low
        close
      }
    }
  `;

  try {
    const response = await fetch(UNISWAP_V4_SUBGRAPH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          tokenAddress: tokenAddress.toLowerCase(),
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return null;
    }

    const { token, tokenDayDatas } = result.data;

    if (!token || !tokenDayDatas || tokenDayDatas.length === 0) {
      console.warn(`No data found for token ${tokenAddress}`);
      return null;
    }

    const dayData = tokenDayDatas[0];

    return {
      address: token.id,
      symbol: token.symbol || "UNKNOWN",
      name: token.name || "Unknown Token",
      volumeUSD24h: parseFloat(dayData.volumeUSD || "0"),
      priceUSD: parseFloat(dayData.priceUSD || "0"),
      liquidityUSD: parseFloat(dayData.totalValueLockedUSD || "0"),
      txCount24h: 0,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error fetching token metrics:", error);
    return null;
  }
}

/**
 * Fetch pool data for more detailed metrics
 */
export async function fetchPoolMetrics(poolId: string): Promise<any> {
  const query = `
    query GetPoolMetrics($poolId: String!) {
      pool(id: $poolId) {
        id
        liquidity
        sqrtPrice
        volumeUSD
        txCount
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
        token0Price
        token1Price
        feeTier
      }
      
      poolDayDatas(
        first: 1,
        where: { pool: $poolId },
        orderBy: date,
        orderDirection: desc
      ) {
        date
        volumeUSD
        txCount
        liquidity
        volumeToken0
        volumeToken1
      }
    }
  `;

  try {
    const response = await fetch(UNISWAP_V4_SUBGRAPH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { poolId: poolId.toLowerCase() },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching pool metrics:", error);
    return null;
  }
}

/**
 * Fetch metrics for both battle tokens
 */
export async function fetchBattleMetrics(
  token1Address: string,
  token2Address: string,
): Promise<BattleMetrics | null> {
  try {
    const [metrics1, metrics2] = await Promise.all([
      fetchTokenMetrics(token1Address),
      fetchTokenMetrics(token2Address),
    ]);

    if (!metrics1 || !metrics2) {
      console.error("Failed to fetch metrics for one or both tokens");
      return null;
    }

    const score1 = calculateScore(metrics1);
    const score2 = calculateScore(metrics2);

    return {
      token1: metrics1,
      token2: metrics2,
      winner: score1 > score2 ? token1Address : token2Address,
      score1,
      score2,
    };
  } catch (error) {
    console.error("Error fetching battle metrics:", error);
    return null;
  }
}

/**
 * Calculate score using same algorithm as smart contract
 * Weights: Volume 40%, Liquidity 30%, Price 20%, Tx Count 10%
 */
function calculateScore(metrics: TokenMetrics): number {
  const volumeScore = (metrics.volumeUSD24h / 1000) * 40;
  const liquidityScore = (metrics.liquidityUSD / 1000) * 30;
  const priceScore = metrics.priceUSD * 20;
  const txScore = metrics.txCount24h * 10;

  return volumeScore + liquidityScore + priceScore + txScore;
}

/**
 * Format large numbers for display
 */
export function formatUSD(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Format price with appropriate decimals
 */
export function formatPrice(price: number): string {
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(2)}`;
  }
}
