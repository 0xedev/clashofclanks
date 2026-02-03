import "./battle.css";

import { useBattleMetrics } from "../lib/useBattleMetrics";
import { formatUSD, formatPrice } from "../lib/uniswapQueries";

interface BattleMetricsProps {
  token1Address: string;
  token2Address: string;
  battleId: number;
  onSubmitMetrics?: (battleId: number, metrics: any) => Promise<void>;
  isAdmin?: boolean;
}

export function BattleMetrics({
  token1Address,
  token2Address,
  battleId,
  onSubmitMetrics,
  isAdmin = false,
}: BattleMetricsProps) {
  const { metrics, loading, error, refetch } = useBattleMetrics(
    token1Address,
    token2Address,
    true,
  );

  const handleSubmit = async () => {
    if (!metrics || !onSubmitMetrics) return;

    await onSubmitMetrics(battleId, {
      token1: {
        address: metrics.token1.address,
        volumeUSD24h: metrics.token1.volumeUSD24h,
        priceUSD: metrics.token1.priceUSD,
        liquidityUSD: metrics.token1.liquidityUSD,
        txCount24h: metrics.token1.txCount24h,
      },
      token2: {
        address: metrics.token2.address,
        volumeUSD24h: metrics.token2.volumeUSD24h,
        priceUSD: metrics.token2.priceUSD,
        liquidityUSD: metrics.token2.liquidityUSD,
        txCount24h: metrics.token2.txCount24h,
      },
    });
  };

  if (loading && !metrics) {
    return (
      <div className="metrics">
        <div className="battle-list__header">
          <div className="spinner" aria-label="Loading" />
          <span style={{ fontSize: 12, color: "rgba(226,232,240,0.7)" }}>
            Fetching live metrics...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics" style={{ color: "rgba(248,113,113,0.9)" }}>
        <div>Metrics error: {error}</div>
        <button
          className="battle-card__details"
          onClick={refetch}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="metrics">
        <div style={{ fontSize: 12, color: "rgba(226,232,240,0.7)" }}>
          No metrics available
        </div>
      </div>
    );
  }

  const winner =
    metrics.winner.toLowerCase() === token1Address.toLowerCase()
      ? metrics.token1
      : metrics.token2;

  return (
    <div className="metrics">
      <div className="metrics__header">
        <span>Live Metrics</span>
        <button
          className="battle-card__action"
          onClick={refetch}
          type="button"
          disabled={loading}
        >
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      <div className="metrics__table">
        <table className="metrics__table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>
                {metrics.token1.symbol} ({metrics.token1.name})
              </th>
              <th>
                {metrics.token2.symbol} ({metrics.token2.name})
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>24h Volume</td>
              <td>{formatUSD(metrics.token1.volumeUSD24h)}</td>
              <td>{formatUSD(metrics.token2.volumeUSD24h)}</td>
            </tr>
            <tr>
              <td>Price</td>
              <td>{formatPrice(metrics.token1.priceUSD)}</td>
              <td>{formatPrice(metrics.token2.priceUSD)}</td>
            </tr>
            <tr>
              <td>Liquidity</td>
              <td>{formatUSD(metrics.token1.liquidityUSD)}</td>
              <td>{formatUSD(metrics.token2.liquidityUSD)}</td>
            </tr>
            <tr>
              <td>Score</td>
              <td>{Math.round(metrics.score1)}</td>
              <td>{Math.round(metrics.score2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="battle-card__stat">
        <span>Current Leader</span>
        <strong>
          {winner.symbol} ({winner.name})
        </strong>
      </div>

      {isAdmin && onSubmitMetrics && (
        <button
          className="battle-card__details"
          onClick={handleSubmit}
          type="button"
          disabled={loading}
        >
          Submit Metrics to Contract
        </button>
      )}
    </div>
  );
}
