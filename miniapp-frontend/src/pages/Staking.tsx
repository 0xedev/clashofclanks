import { useState, useEffect } from "react";
import { Coins, Hexagon, Trophy, Vote, Loader } from "lucide-react";
import { useAccount } from "wagmi";
import { useStaking } from "../lib/useStaking";

export function Staking() {
  const [activeTab, setActiveTab] = useState<"coc" | "nft">("coc");
  const { address, isConnected } = useAccount();
  const {
    cocStaked,
    pendingRewards,
    votingPower,
    loading,
    error,
    stakeCOC,
    unstakeCOC,
    claimRewards,
    clearError,
  } = useStaking();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [txMessage, setTxMessage] = useState("");

  const handleStake = async () => {
    if (!stakeAmount) return;
    try {
      setIsStaking(true);
      setTxMessage("");
      await stakeCOC(stakeAmount);
      setTxMessage("Staked successfully!");
      setStakeAmount("");
      setTimeout(() => setTxMessage(""), 3000);
    } catch (err) {
      setTxMessage("Stake failed");
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount) return;
    try {
      setIsUnstaking(true);
      setTxMessage("");
      await unstakeCOC(unstakeAmount);
      setTxMessage("Unstaked successfully!");
      setUnstakeAmount("");
      setTimeout(() => setTxMessage(""), 3000);
    } catch (err) {
      setTxMessage("Unstake failed");
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setIsClaiming(true);
      setTxMessage("");
      await claimRewards();
      setTxMessage("Rewards claimed!");
      setTimeout(() => setTxMessage(""), 3000);
    } catch (err) {
      setTxMessage("Claim failed");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="relative z-10 w-full p-4 pt-20 h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-primary-glow mx-auto mb-4" />
          <p className="text-white text-lg font-bold mb-4">
            Connect your wallet to stake
          </p>
          <p className="text-white/60 text-sm">
            Use Farcaster wallet to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full p-4 space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="w-8 h-8 text-primary-glow" />
        <h1 className="text-2xl font-bold font-display text-white">
          Staking Arena
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-panel p-4 border-l-4 border-red-500 bg-red-500/10">
          <p className="text-red-200 text-sm">{error}</p>
          <button
            onClick={clearError}
            className="text-xs text-red-300 hover:text-red-200 mt-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="w-6 h-6 text-primary-glow animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 flex flex-col items-center text-center">
            <span className="text-xs text-white/70 uppercase tracking-wider font-bold">
              Pending Rewards
            </span>
            <span className="text-2xl font-bold text-primary-glow font-mono mt-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
              {parseFloat(pendingRewards).toFixed(2)} COC
            </span>
          </div>
          <div className="glass-panel p-4 flex flex-col items-center text-center">
            <span className="text-xs text-white/70 uppercase tracking-wider font-bold">
              Voting Power
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Vote className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-white font-mono">
                {votingPower}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Claim Button */}
      <button
        onClick={handleClaimRewards}
        disabled={isClaiming || parseFloat(pendingRewards) === 0}
        className={`w-full font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 ${
          isClaiming || parseFloat(pendingRewards) === 0
            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:from-yellow-400 hover:to-amber-500"
        }`}
      >
        {isClaiming ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            CLAIMING...
          </>
        ) : (
          "CLAIM ALL REWARDS"
        )}
      </button>

      {/* Tabs */}
      <div className="flex p-1 bg-black/40 rounded-xl border border-white/10">
        <button
          onClick={() => setActiveTab("coc")}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "coc"
              ? "bg-white/10 text-white shadow"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          <Coins className="w-4 h-4" />
          $COC
        </button>
        <button
          onClick={() => setActiveTab("nft")}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "nft"
              ? "bg-white/10 text-white shadow"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          <Hexagon className="w-4 h-4" />
          NFTs
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="glass-panel p-6 space-y-6">
        {activeTab === "coc" ? (
          <>
            <div className="flex justify-between items-end pb-4 border-b border-white/10">
              <div>
                <div className="text-sm text-white/80 font-medium mb-1">
                  Staked Balance
                </div>
                <div className="text-3xl font-bold text-white font-mono tracking-tight">
                  {parseFloat(cocStaked).toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/80 font-medium mb-1">
                  APY
                </div>
                <div className="text-3xl font-bold text-green-400 font-mono tracking-tight drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                  ~12%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/70 font-bold mb-2 block">
                  STAKE AMOUNT
                </label>
                <input
                  type="number"
                  placeholder="Amount to stake"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full bg-bg-deep border border-white/20 rounded-xl p-4 text-white text-lg placeholder:text-white/30 focus:border-primary-glow focus:ring-1 focus:ring-primary-glow outline-none font-mono transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStake}
                  disabled={isStaking || !stakeAmount}
                  className={`font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2 ${
                    isStaking || !stakeAmount
                      ? "bg-cyan-400/50 text-white/50 cursor-not-allowed"
                      : "bg-primary-glow text-bg-deep hover:bg-cyan-300"
                  }`}
                >
                  {isStaking ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      STAKING
                    </>
                  ) : (
                    "STAKE"
                  )}
                </button>
                <button className="bg-white/5 border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors cursor-not-allowed opacity-50">
                  QUICK UNSTAKE
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/70 font-bold mb-2 block">
                UNSTAKE AMOUNT
              </label>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Amount to unstake"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  className="w-full bg-bg-deep border border-white/20 rounded-xl p-4 text-white text-lg placeholder:text-white/30 focus:border-primary-glow focus:ring-1 focus:ring-primary-glow outline-none font-mono transition-all"
                />
                <button
                  onClick={handleUnstake}
                  disabled={isUnstaking || !unstakeAmount}
                  className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    isUnstaking || !unstakeAmount
                      ? "bg-white/5 border border-white/20 text-white/50 cursor-not-allowed"
                      : "bg-white/5 border border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  {isUnstaking ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      UNSTAKING
                    </>
                  ) : (
                    "UNSTAKE"
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-center text-white/50 bg-white/5 p-3 rounded-lg border border-white/5">
              ℹ️ Staking $COC grants Voting Power and share of platform fees.
            </p>
          </>
        ) : (
          <>
            <div className="text-center py-6">
              <div className="text-base text-white/80 mb-6">
                You have 0 staked Clinkers
              </div>
              <button
                disabled
                className="w-full border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-white/40 hover:bg-white/5 transition-all group flex flex-col items-center gap-3 cursor-not-allowed opacity-50"
              >
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-4xl text-white/60 group-hover:text-white">
                    +
                  </span>
                </div>
                <span className="font-bold text-white/60 group-hover:text-white text-lg">
                  Select NFT to Stake
                </span>
              </button>
            </div>
            <p className="text-xs text-center text-white/50 bg-white/5 p-3 rounded-lg border border-white/5">
              🚀 Staking NFTs boosts your $COC yield by 2x.
            </p>
          </>
        )}
      </div>

      {/* Transaction Message */}
      {txMessage && (
        <div
          className={`fixed bottom-20 left-4 right-4 p-4 rounded-lg text-center font-bold text-sm ${
            txMessage.includes("failed")
              ? "bg-red-500/20 text-red-200 border border-red-500/50"
              : "bg-green-500/20 text-green-200 border border-green-500/50"
          }`}
        >
          {txMessage}
        </div>
      )}
    </div>
  );
}
