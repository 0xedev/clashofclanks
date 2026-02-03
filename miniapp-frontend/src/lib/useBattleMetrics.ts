import { useCallback, useEffect, useState } from "react";
import {
  fetchBattleMetrics,
  type BattleMetrics as BattleMetricsResult,
} from "./uniswapQueries";

export function useBattleMetrics(
  token1Address: string,
  token2Address: string,
  autoRefresh = false,
  refreshMs = 30000,
) {
  const [metrics, setMetrics] = useState<BattleMetricsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token1Address || !token2Address) {
      setMetrics(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const battleMetrics = await fetchBattleMetrics(
        token1Address,
        token2Address,
      );

      if (!battleMetrics) {
        setMetrics(null);
        setError("No metrics available");
        return;
      }

      setMetrics(battleMetrics);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load metrics";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token1Address, token2Address]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const interval = window.setInterval(() => {
      load();
    }, refreshMs);

    return () => window.clearInterval(interval);
  }, [autoRefresh, load, refreshMs]);

  return {
    metrics,
    loading,
    error,
    refetch: load,
  };
}
