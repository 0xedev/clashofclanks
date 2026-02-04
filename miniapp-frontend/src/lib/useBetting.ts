import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useSendCalls,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { encodeFunctionData, formatUnits } from "viem";
import { ADDRESSES, ABIS } from "./contracts";

interface Bet {
  id: number;
  battleId: number;
  bettor: string;
  predictedWinner: string;
  amount: string;
  leverage: number;
  timestamp: number;
  settled: boolean;
  cashedOut: boolean;
  liquidated: boolean;
}

interface Battle {
  id: number;
  token1: string;
  token2: string;
  deployer1: string;
  deployer2: string;
  startTime: number;
  endTime: number;
  status: number; // 0=Pending, 1=Active, 2=Completed, 3=Cancelled
  theme: number;
  winner: string;
  totalBets: string;
  spotlightBattle: boolean;
}

interface ProcessedBet {
  id: number;
  pair: string;
  icon: string;
  vsIcon: string;
  type: "Long" | "Short";
  leverage: number;
  collateral: number;
  pnl: number;
  pnlPercent: number;
  status: "winning" | "danger" | "closed-win" | "closed-loss";
  liquidationRisk?: number;
  date?: string;
  battleId: number;
  settled: boolean;
  cashedOut: boolean;
  liquidated: boolean;
}

// TODO: Replace with token metadata service or oracle
const TOKEN_METADATA: Record<string, { symbol: string; icon: string }> = {
  "0x0000000000000000000000000000000000000001": { symbol: "AAVE", icon: "👻" },
  "0x0000000000000000000000000000000000000002": { symbol: "UNI", icon: "🦄" },
  "0x0000000000000000000000000000000000000003": { symbol: "PEPE", icon: "🐸" },
  "0x0000000000000000000000000000000000000004": { symbol: "DOGE", icon: "🐶" },
  "0x0000000000000000000000000000000000000005": { symbol: "BTC", icon: "₿" },
  "0x0000000000000000000000000000000000000006": { symbol: "ETH", icon: "Ξ" },
};

const getTokenMetadata = (address: string) => {
  return TOKEN_METADATA[address] || { symbol: address.slice(0, 6), icon: "🪙" };
};

export const useBetting = () => {
  const { address } = useAccount();
  const { sendCallsAsync } = useSendCalls();
  const publicClient = usePublicClient();
  const [activeBets, setActiveBets] = useState<ProcessedBet[]>([]);
  const [historyBets, setHistoryBets] = useState<ProcessedBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's bet IDs
  const { data: betIds, refetch: refetchBetIds } = useReadContract({
    address: ADDRESSES.BETTING_POOL as `0x${string}`,
    abi: ABIS.BettingPool,
    functionName: "getUserBets",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: readonly bigint[] | undefined; refetch: () => Promise<any> };

  const fetchBets = useCallback(async () => {
    if (!address || !betIds || !publicClient) {
      setActiveBets([]);
      setHistoryBets([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (betIds.length === 0) {
        setActiveBets([]);
        setHistoryBets([]);
        setIsLoading(false);
        return;
      }

      // Fetch bet details using multicall
      const betContracts = betIds.map((betId: bigint) => ({
        address: ADDRESSES.BETTING_POOL as `0x${string}`,
        abi: ABIS.BettingPool as any,
        functionName: "bets",
        args: [betId],
      }));

      const betsResults = await publicClient.multicall({
        contracts: betContracts as any,
      });

      // Fetch battle details using multicall
      const battleIds = betsResults
        .filter((r: any) => r.status === "success")
        .map((r: any) => r.result[0]); // battleId is first field

      const battleContracts = battleIds.map((battleId: bigint) => ({
        address: ADDRESSES.BATTLE_MANAGER as `0x${string}`,
        abi: ABIS.BattleManager as any,
        functionName: "battles",
        args: [battleId],
      }));

      const battlesResults = await publicClient.multicall({
        contracts: battleContracts as any,
      });

      // Process results
      const processedBets = betsResults
        .map((betResult: any, index: number): ProcessedBet | null => {
          if (betResult.status !== "success") return null;

          const betData: any = betResult.result;
          const battleResult = battlesResults[index];
          if (battleResult.status !== "success") return null;

          const battleData: any = battleResult.result;
          const betId = betIds[index];
          const token1Meta = getTokenMetadata(battleData[1]); // token1
          const token2Meta = getTokenMetadata(battleData[2]); // token2
          const isToken1 =
            betData[2].toLowerCase() === battleData[1].toLowerCase(); // predictedWinner vs token1

          // Calculate PnL (mock calculation - TODO: implement real-time PnL calculation)
          const collateral = parseFloat(formatUnits(betData[3], 18)); // amount
          const leverage = Number(betData[4]) / 100; // leverage from basis points
          let pnl = 0;
          let pnlPercent = 0;

          if (betData[6]) {
            // settled
            // For settled bets, winner gets their payout
            if (betData[2].toLowerCase() === battleData[9].toLowerCase()) {
              // predictedWinner vs winner
              pnl = collateral * (leverage - 1) * 0.5; // Simplified calculation
              pnlPercent = (pnl / collateral) * 100;
            } else {
              pnl = -collateral;
              pnlPercent = -100;
            }
          } else if (Number(battleData[7]) === 1) {
            // battle.status === Active
            // Active battle - mock PnL based on random market movement
            pnl = collateral * ((Math.random() - 0.5) * 0.4) * leverage;
            pnlPercent = (pnl / collateral) * 100;
          }

          const liquidationRisk =
            leverage > 10 && pnl < 0 ? Math.min(90, Math.abs(pnlPercent)) : 15;

          let status: ProcessedBet["status"];
          if (betData[6] || betData[7] || betData[8]) {
            // settled || cashedOut || liquidated
            status = pnl >= 0 ? "closed-win" : "closed-loss";
          } else if (liquidationRisk > 80) {
            status = "danger";
          } else {
            status = pnl >= 0 ? "winning" : "danger";
          }

          return {
            id: Number(betId),
            battleId: Number(betData[0]),
            pair: `${isToken1 ? token1Meta.symbol : token2Meta.symbol}/${isToken1 ? token2Meta.symbol : token1Meta.symbol}`,
            icon: isToken1 ? token1Meta.icon : token2Meta.icon,
            vsIcon: isToken1 ? token2Meta.icon : token1Meta.icon,
            type: isToken1 ? ("Long" as const) : ("Short" as const),
            leverage,
            collateral: Math.round(collateral),
            pnl: Math.round(pnl),
            pnlPercent: Math.round(pnlPercent),
            status,
            liquidationRisk: betData[6] ? undefined : liquidationRisk,
            date: betData[6] ? getTimeAgo(Number(betData[5])) : undefined,
            settled: betData[6],
            cashedOut: betData[7],
            liquidated: betData[8],
          };
        })
        .filter((b: any): b is ProcessedBet => b !== null);

      // Split into active and history
      const active = processedBets.filter(
        (b) => !b.settled && !b.cashedOut && !b.liquidated,
      );
      const history = processedBets.filter(
        (b) => b.settled || b.cashedOut || b.liquidated,
      );

      setActiveBets(active);
      setHistoryBets(history);
    } catch (err) {
      console.error("Failed to fetch bets:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bets");
    } finally {
      setIsLoading(false);
    }
  }, [address, betIds, publicClient]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  const cashOutBet = useCallback(
    async (betId: number) => {
      if (!address) throw new Error("No wallet connected");

      try {
        const cashOutData = encodeFunctionData({
          abi: ABIS.BettingPool,
          functionName: "cashOutBet",
          args: [BigInt(betId)],
        });

        await sendCallsAsync({
          calls: [
            {
              to: ADDRESSES.BETTING_POOL as `0x${string}`,
              data: cashOutData as `0x${string}`,
            },
          ],
        });

        // Refresh bets after cash out
        await fetchBets();
      } catch (err) {
        console.error("Cash out failed:", err);
        throw err;
      }
    },
    [address, sendCallsAsync, fetchBets],
  );

  const settleBet = useCallback(
    async (betId: number) => {
      if (!address) throw new Error("No wallet connected");

      try {
        const settleData = encodeFunctionData({
          abi: ABIS.BettingPool,
          functionName: "settleBet",
          args: [BigInt(betId)],
        });

        await sendCallsAsync({
          calls: [
            {
              to: ADDRESSES.BETTING_POOL as `0x${string}`,
              data: settleData as `0x${string}`,
            },
          ],
        });

        // Refresh bets after settlement
        await fetchBets();
      } catch (err) {
        console.error("Settle bet failed:", err);
        throw err;
      }
    },
    [address, sendCallsAsync, fetchBets],
  );

  const totalActiveValue = activeBets.reduce(
    (acc, bet) => acc + bet.collateral + bet.pnl,
    0,
  );
  const totalPnL = activeBets.reduce((acc, bet) => acc + bet.pnl, 0);

  return {
    activeBets,
    historyBets,
    totalActiveValue,
    totalPnL,
    isLoading,
    error,
    cashOutBet,
    settleBet,
    refresh: async () => {
      await refetchBetIds();
      await fetchBets();
    },
  };
};

const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
