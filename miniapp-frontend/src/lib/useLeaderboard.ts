import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";

export interface LeaderboardEntry {
  rank: number;
  address: string;
  totalBets: number;
  totalVolume: string;
  winRate: number;
  profitLoss: string;
  isCurrentUser?: boolean;
}

export interface StakingLeaderboardEntry {
  rank: number;
  address: string;
  stakedAmount: string;
  rewards: string;
  stakingDuration: number; // days
  nftCount: number;
  isCurrentUser?: boolean;
}

interface UseLeaderboardReturn {
  bettingLeaderboard: LeaderboardEntry[];
  stakingLeaderboard: StakingLeaderboardEntry[];
  userBettingRank: number | null;
  userStakingRank: number | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// TODO: Replace with actual subgraph queries
// Subgraph endpoints:
// - Query top bettors by volume/winRate
// - Query top stakers by stakedAmount/rewards
// - Include user's rank in results
const generateMockBettingData = (userAddress?: string): LeaderboardEntry[] => {
  const mockData: LeaderboardEntry[] = [
    {
      rank: 1,
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      totalBets: 127,
      totalVolume: "45,230",
      winRate: 68.5,
      profitLoss: "+12,450",
    },
    {
      rank: 2,
      address: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
      totalBets: 98,
      totalVolume: "38,920",
      winRate: 71.4,
      profitLoss: "+9,850",
    },
    {
      rank: 3,
      address: "0x1234567890123456789012345678901234567890",
      totalBets: 85,
      totalVolume: "32,100",
      winRate: 65.2,
      profitLoss: "+7,200",
    },
    {
      rank: 4,
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      totalBets: 72,
      totalVolume: "28,450",
      winRate: 62.5,
      profitLoss: "+5,600",
    },
    {
      rank: 5,
      address: "0x9876543210987654321098765432109876543210",
      totalBets: 64,
      totalVolume: "24,800",
      winRate: 60.9,
      profitLoss: "+4,320",
    },
  ];

  if (
    userAddress &&
    !mockData.find((e) => e.address.toLowerCase() === userAddress.toLowerCase())
  ) {
    mockData.push({
      rank: 42,
      address: userAddress,
      totalBets: 15,
      totalVolume: "3,240",
      winRate: 53.3,
      profitLoss: "+180",
      isCurrentUser: true,
    });
  }

  return mockData.map((entry) => ({
    ...entry,
    isCurrentUser: entry.address.toLowerCase() === userAddress?.toLowerCase(),
  }));
};

const generateMockStakingData = (
  userAddress?: string,
): StakingLeaderboardEntry[] => {
  const mockData: StakingLeaderboardEntry[] = [
    {
      rank: 1,
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      stakedAmount: "125,000",
      rewards: "8,450",
      stakingDuration: 180,
      nftCount: 5,
    },
    {
      rank: 2,
      address: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
      stakedAmount: "98,500",
      rewards: "6,200",
      stakingDuration: 150,
      nftCount: 3,
    },
    {
      rank: 3,
      address: "0x1234567890123456789012345678901234567890",
      stakedAmount: "87,300",
      rewards: "5,100",
      stakingDuration: 120,
      nftCount: 4,
    },
    {
      rank: 4,
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      stakedAmount: "72,800",
      rewards: "4,320",
      stakingDuration: 90,
      nftCount: 2,
    },
    {
      rank: 5,
      address: "0x9876543210987654321098765432109876543210",
      stakedAmount: "65,400",
      rewards: "3,750",
      stakingDuration: 75,
      nftCount: 1,
    },
  ];

  if (
    userAddress &&
    !mockData.find((e) => e.address.toLowerCase() === userAddress.toLowerCase())
  ) {
    mockData.push({
      rank: 38,
      address: userAddress,
      stakedAmount: "5,200",
      rewards: "145",
      stakingDuration: 14,
      nftCount: 0,
      isCurrentUser: true,
    });
  }

  return mockData.map((entry) => ({
    ...entry,
    isCurrentUser: entry.address.toLowerCase() === userAddress?.toLowerCase(),
  }));
};

export const useLeaderboard = (): UseLeaderboardReturn => {
  const { address } = useAccount();
  const [bettingLeaderboard, setBettingLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [stakingLeaderboard, setStakingLeaderboard] = useState<
    StakingLeaderboardEntry[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboards = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual subgraph queries
      // Example subgraph query for betting:
      // {
      //   users(orderBy: totalVolume, orderDirection: desc, first: 100) {
      //     id
      //     totalBets
      //     totalVolume
      //     totalWins
      //     totalLosses
      //   }
      // }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const bettingData = generateMockBettingData(address);
      const stakingData = generateMockStakingData(address);

      setBettingLeaderboard(bettingData);
      setStakingLeaderboard(stakingData);
    } catch (err) {
      console.error("Failed to fetch leaderboards:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch leaderboards",
      );
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchLeaderboards();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchLeaderboards, 60000);
    return () => clearInterval(interval);
  }, [fetchLeaderboards]);

  const userBettingRank =
    bettingLeaderboard.find((e) => e.isCurrentUser)?.rank ?? null;
  const userStakingRank =
    stakingLeaderboard.find((e) => e.isCurrentUser)?.rank ?? null;

  return {
    bettingLeaderboard,
    stakingLeaderboard,
    userBettingRank,
    userStakingRank,
    isLoading,
    error,
    refresh: fetchLeaderboards,
  };
};
