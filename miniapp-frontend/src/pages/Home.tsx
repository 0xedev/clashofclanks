import { Link } from "react-router-dom";
import {
  Swords,
  Zap,
  TrendingUp,
  Flame,
  Wallet,
  Info,
  Activity,
  Target,
} from "lucide-react";
import { useAccount } from "wagmi";

export function Home() {
  const { address } = useAccount();
  const avatarSeed = address || "Clash";

  return (
    <div className="relative w-full flex flex-col min-h-screen pb-20">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/bg-unified.png)",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, rgba(10, 10, 26, 0.4) 0%, rgba(5, 5, 10, 0.85) 100%)",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header - Compact & Functional */}
        <header className="flex items-center justify-between px-4 py-3 bg-bg-deep/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-primary-glow/50 ring-1 ring-primary-glow/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 bg-primary-glow/10 px-2.5 py-1 rounded border border-primary-glow/20 cursor-help transition-all hover:bg-primary-glow/20"
              title="Your COC token balance"
            >
              <Wallet className="w-3.5 h-3.5 text-primary-glow" />
              <span className="font-display text-xs font-bold text-white tracking-wide">
                5,420
              </span>
            </div>

            <div
              className="flex items-center gap-1.5 bg-orange-500/10 px-2.5 py-1 rounded border border-orange-500/20 cursor-help transition-all hover:bg-orange-500/20"
              title="Number of active bets"
            >
              <Target className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-display text-xs font-bold text-orange-100 tracking-wide">
                2
              </span>
            </div>
          </div>

          <Link
            to="/about"
            className="p-1.5 text-white/40 hover:text-white transition-colors hover:bg-white/5 rounded-md"
          >
            <Info className="w-5 h-5" />
          </Link>
        </header>

        {/* Main Layout - Grid/List based */}
        <div className="flex-1 flex flex-col px-4 pt-4 pb-20 w-full relative z-10">
          {/* Hero Section - Centered & Premium */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2 pb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-glow/20 blur-3xl rounded-full opacity-20" />
              <Swords className="w-12 h-12 text-primary-glow drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-display font-black text-white tracking-widest leading-none drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/70">
                CLASH OF
                <br />
                CLANKS
              </h1>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)] animate-pulse"></span>
                <p className="text-sm text-primary-glow/80 font-bold tracking-widest uppercase">
                  System Online
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid - Floating Glass Panels */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-bg-deep/40 border border-white/5 rounded-lg p-3 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] group hover:border-white/10 hover:bg-bg-deep/50 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4 text-primary-glow" />
              </div>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-0.5">
                Total Value Locked
              </span>
              <div className="text-lg font-mono font-bold text-white tracking-tight text-shadow-sm">
                $2.45M
              </div>
            </div>

            <div className="bg-bg-deep/40 border border-white/5 rounded-lg p-3 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] group hover:border-white/10 hover:bg-bg-deep/50 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-0.5">
                24h Volume
              </span>
              <div className="text-lg font-mono font-bold text-green-400 tracking-tight text-shadow-sm">
                $124k
              </div>
            </div>
          </div>

          {/* Spacer to push content */}
          <div className="flex-1" />

          {/* Primary Action - Bottom Anchored (Visual) */}
          <div className="space-y-4">
            <Link
              to="/battles"
              className="group relative block w-full transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative flex items-center justify-center gap-3 bg-bg-deep border border-white/10 py-3.5 rounded-lg shadow-xl group-hover:border-white/20 transition-all">
                <Zap className="w-5 h-5 text-primary-glow animate-pulse" />
                <span className="font-display text-base font-bold text-white tracking-widest group-hover:text-primary-glow transition-colors">
                  ENTER ARENA
                </span>
              </div>
            </Link>

            {/* Live Ticker - Minimalist */}
            <div className="pt-3 border-t border-white/5">
              <div className="w-full overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span className="text-xs font-medium text-white/80 font-mono">
                      PEPE vs DOGE
                    </span>
                    <span className="text-xs text-green-400 font-bold">
                      +12%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span className="text-xs font-medium text-white/80 font-mono">
                      WIF vs BONK
                    </span>
                    <span className="text-xs text-orange-400 font-bold">
                      HOT
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-3 h-3 text-primary-glow" />
                    <span className="text-xs font-bold text-primary-glow uppercase tracking-wide">
                      New Epoch Started
                    </span>
                  </div>
                  {/* Duplicates */}
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span className="text-xs font-medium text-white/80 font-mono">
                      PEPE vs DOGE
                    </span>
                    <span className="text-xs text-green-400 font-bold">
                      +12%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span className="text-xs font-medium text-white/80 font-mono">
                      WIF vs BONK
                    </span>
                    <span className="text-xs text-orange-400 font-bold">
                      HOT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      </div>
    </div>
  );
}
