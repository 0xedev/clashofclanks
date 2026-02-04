import { useState } from "react";
import { parseUnits, encodeFunctionData } from "viem";

import "./admin.css";
import { BattleMetrics } from "../components/BattleMetrics";
import { useAuth } from "../lib/useAuth";
import { useWallet } from "../lib/useWallet";
import { ABIS, ADDRESSES } from "../lib/contracts";

export function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { sendTransaction } = useWallet();
  const [battleId, setBattleId] = useState("");
  const [token1, setToken1] = useState("");
  const [token2, setToken2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmitMetrics = async (
    resolvedBattleId: number,
    metrics: any,
  ) => {
    setIsSubmitting(true);
    setMessage("");

    try {
      const data = encodeFunctionData({
        abi: ABIS.TokenMetricsOracle,
        functionName: "submitBatchMetrics",
        args: [
          [metrics.token1.address, metrics.token2.address],
          [
            parseUnits(metrics.token1.volumeUSD24h.toString(), 0),
            parseUnits(metrics.token2.volumeUSD24h.toString(), 0),
          ],
          [
            parseUnits(metrics.token1.priceUSD.toString(), 18),
            parseUnits(metrics.token2.priceUSD.toString(), 18),
          ],
          [
            parseUnits(metrics.token1.liquidityUSD.toString(), 0),
            parseUnits(metrics.token2.liquidityUSD.toString(), 0),
          ],
          [metrics.token1.txCount24h, metrics.token2.txCount24h],
        ],
      });

      const result = await sendTransaction({
        to: ADDRESSES.ORACLE,
        data,
      });

      setMessage(
        `Metrics submitted. Tx: ${(result as any).transactionHash ?? "ok"}`,
      );
    } catch (error) {
      console.error("Error submitting metrics:", error);
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeBattle = async () => {
    if (!battleId || !token1 || !token2) {
      setMessage("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setMessage("Finalizing battle...");

    try {
      const data = encodeFunctionData({
        abi: ABIS.BattleManager,
        functionName: "completeBattle",
        args: [BigInt(Number.parseInt(battleId, 10))],
      });

      const result = await sendTransaction({
        to: ADDRESSES.BATTLE_MANAGER,
        data,
      });

      setMessage(
        `Battle finalized. Tx: ${(result as any).transactionHash ?? "ok"}`,
      );
    } catch (error) {
      console.error("Error finalizing battle:", error);
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="admin-center">Loading...</div>;
  }

  const developerFid = Number.parseInt(
    (import.meta.env.VITE_DEVELOPER_FID as string) || "0",
    10,
  );
  const isAdmin = user?.fid === developerFid;

  if (!isAdmin) {
    return <div className="admin-center">Access denied. Admin only.</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-title">Admin Dashboard</div>
          <div className="admin-subtitle">
            Manage battles and submit metrics
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel__title">Live Battle Metrics</div>
          <input
            type="text"
            placeholder="Token 1 Address"
            value={token1}
            onChange={(event) => setToken1(event.target.value)}
            className="admin-input"
          />
          <input
            type="text"
            placeholder="Token 2 Address"
            value={token2}
            onChange={(event) => setToken2(event.target.value)}
            className="admin-input"
          />

          {token1 && token2 && (
            <div style={{ marginTop: 12 }}>
              <BattleMetrics
                token1Address={token1}
                token2Address={token2}
                battleId={Number.parseInt(battleId || "0", 10)}
                onSubmitMetrics={handleSubmitMetrics}
                isAdmin
              />
            </div>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel__title">Finalize Battle</div>
          <input
            type="number"
            placeholder="Battle ID"
            value={battleId}
            onChange={(event) => setBattleId(event.target.value)}
            className="admin-input"
          />
          <button
            onClick={handleFinalizeBattle}
            disabled={isSubmitting || !battleId}
            className="admin-button"
            type="button"
            style={{ marginTop: 8 }}
          >
            {isSubmitting ? "Processing..." : "Finalize Battle"}
          </button>
        </div>

        {message && (
          <div
            className={`admin-message ${
              message.toLowerCase().startsWith("error")
                ? "admin-message--error"
                : "admin-message--success"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
