import { useState } from "react";
import { Coins, Hexagon, Trophy, Vote } from "lucide-react";

export function Staking() {
  const [activeTab, setActiveTab] = useState<"coc" | "nft">("coc");

  return (
    <div className="relative z-10 w-full p-4 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="w-8 h-8 text-primary-glow" />
        <h1 className="text-2xl font-bold font-display text-white">
          Staking Arena
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4 flex flex-col items-center text-center">
          <span className="text-xs text-white/70 uppercase tracking-wider font-bold">
            Pending Rewards
          </span>
          <span className="text-2xl font-bold text-primary-glow font-mono mt-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            1,240 COC
          </span>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center text-center">
          <span className="text-xs text-white/70 uppercase tracking-wider font-bold">
            Voting Power
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Vote className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-bold text-white font-mono">
              450 VP
            </span>
          </div>
        </div>
      </div>

      {/* Claim Button */}
      <button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-amber-500 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
        CLAIM ALL REWARDS
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
                  50,000
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/80 font-medium mb-1">
                  APY
                </div>
                <div className="text-3xl font-bold text-green-400 font-mono tracking-tight drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                  12%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount to stake"
                className="w-full bg-bg-deep border border-white/20 rounded-xl p-4 text-white text-lg placeholder:text-white/30 focus:border-primary-glow focus:ring-1 focus:ring-primary-glow outline-none font-mono transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-primary-glow text-bg-deep font-bold py-3 rounded-xl hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  STAKE
                </button>
                <button className="bg-white/5 border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors">
                  UNSTAKE
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
              <button className="w-full border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-white/40 hover:bg-white/5 transition-all group flex flex-col items-center gap-3">
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
    </div>
  );
}
