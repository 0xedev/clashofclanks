import { useState } from "react";
import {
  useLeaderboard,
  LeaderboardEntry,
  StakingLeaderboardEntry,
} from "../lib/useLeaderboard";
import { Crown, Medal, TrendingUp, Trophy } from "lucide-react";

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-gray-300" />;
  if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
  return null;
};

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const BettingLeaderboard = ({
  data,
  userRank,
}: {
  data: LeaderboardEntry[];
  userRank: number | null;
}) => {
  return (
    <div className="space-y-2">
      {userRank && (
        <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-blue-900 font-medium">
              Your Rank: #{userRank}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {data.map((entry) => (
          <div
            key={entry.address}
            className={`border rounded px-3 py-2 ${
              entry.isCurrentUser
                ? "bg-blue-50 border-blue-300"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  {getRankIcon(entry.rank)}
                  <span className="text-xs font-semibold text-gray-700 w-6">
                    #{entry.rank}
                  </span>
                </div>
                <span className="text-xs font-mono text-gray-600 truncate">
                  {formatAddress(entry.address)}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs">
                <div className="text-right">
                  <div className="text-gray-500 text-[10px]">Volume</div>
                  <div className="font-semibold text-gray-900">
                    {entry.totalVolume}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-[10px]">Win Rate</div>
                  <div className="font-semibold text-gray-900">
                    {entry.winRate}%
                  </div>
                </div>
                <div className="text-right min-w-[60px]">
                  <div className="text-gray-500 text-[10px]">P&L</div>
                  <div
                    className={`font-semibold ${
                      entry.profitLoss.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {entry.profitLoss}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-gray-500">
              {entry.totalBets} bets placed
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StakingLeaderboard = ({
  data,
  userRank,
}: {
  data: StakingLeaderboardEntry[];
  userRank: number | null;
}) => {
  return (
    <div className="space-y-2">
      {userRank && (
        <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-blue-900 font-medium">
              Your Rank: #{userRank}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {data.map((entry) => (
          <div
            key={entry.address}
            className={`border rounded px-3 py-2 ${
              entry.isCurrentUser
                ? "bg-blue-50 border-blue-300"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  {getRankIcon(entry.rank)}
                  <span className="text-xs font-semibold text-gray-700 w-6">
                    #{entry.rank}
                  </span>
                </div>
                <span className="text-xs font-mono text-gray-600 truncate">
                  {formatAddress(entry.address)}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs">
                <div className="text-right">
                  <div className="text-gray-500 text-[10px]">Staked</div>
                  <div className="font-semibold text-gray-900">
                    {entry.stakedAmount}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-[10px]">Rewards</div>
                  <div className="font-semibold text-green-600">
                    {entry.rewards}
                  </div>
                </div>
                <div className="text-right min-w-[50px]">
                  <div className="text-gray-500 text-[10px]">NFTs</div>
                  <div className="font-semibold text-gray-900">
                    {entry.nftCount}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-gray-500">
              {entry.stakingDuration} days staked
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState<"betting" | "staking">("betting");
  const {
    bettingLeaderboard,
    stakingLeaderboard,
    userBettingRank,
    userStakingRank,
    isLoading,
    error,
    refresh,
  } = useLeaderboard();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-700" />
            <h1 className="text-lg font-bold text-gray-900">Leaderboard</h1>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded p-1">
          <button
            onClick={() => setActiveTab("betting")}
            className={`flex-1 text-xs py-2 rounded transition-colors ${
              activeTab === "betting"
                ? "bg-gray-900 text-white font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Betting
          </button>
          <button
            onClick={() => setActiveTab("staking")}
            className={`flex-1 text-xs py-2 rounded transition-colors ${
              activeTab === "staking"
                ? "bg-gray-900 text-white font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Staking
          </button>
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-800 mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <div className="text-xs text-gray-500 mt-2">
              Loading leaderboard...
            </div>
          </div>
        ) : activeTab === "betting" ? (
          <BettingLeaderboard
            data={bettingLeaderboard}
            userRank={userBettingRank}
          />
        ) : (
          <StakingLeaderboard
            data={stakingLeaderboard}
            userRank={userStakingRank}
          />
        )}

        {/* Footer note */}
        <div className="mt-6 text-center text-[10px] text-gray-400">
          Rankings update every 60 seconds
        </div>
      </div>
    </div>
  );
};
