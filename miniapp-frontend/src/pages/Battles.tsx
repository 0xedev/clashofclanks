import { useState } from "react";
import { Link } from "react-router-dom";
import { Swords, Clock } from "lucide-react";

export function Battles() {
  const [activeTab, setActiveTab] = useState<"live" | "upcoming">("live");

  return (
    <div className="relative z-10 w-full pt-20 pb-24 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-white">Arena</h1>
        <div className="bg-bg-deep/50 p-1 rounded-lg border border-white/10 flex gap-1">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "live" ? "bg-primary-glow text-bg-deep shadow-glow" : "text-white/40 hover:text-white"}`}
          >
            Live
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "upcoming" ? "bg-primary-glow text-bg-deep shadow-glow" : "text-white/40 hover:text-white"}`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {activeTab === "live" ? (
        <div className="space-y-4">
          {/* Live Battle Card 1 */}
          <div className="glass-panel p-5 relative overflow-hidden group border-primary-glow/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-glow/10 blur-3xl rounded-full -mr-10 -mt-10"></div>

            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                LIVE
              </span>
              <span className="text-xs text-primary-glow font-bold tracking-wider py-1 px-2 bg-primary-glow/10 rounded border border-primary-glow/30">
                2.5x LEVERAGE
              </span>
            </div>

            <div className="flex justify-between items-center gap-4 relative z-10">
              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-bg-deep rounded-2xl mb-2 mx-auto flex items-center justify-center border border-white/10 shadow-lg relative group-hover:scale-105 transition-transform">
                  <span className="text-3xl">🦄</span>
                  <div className="absolute -bottom-2 bg-bg-deep border border-green-500/30 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                    1.8x
                  </div>
                </div>
                <div className="font-bold text-sm text-white">UNI</div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <Swords className="w-5 h-5 text-white/20" />
                <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest">
                  VS
                </span>
              </div>

              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-bg-deep rounded-2xl mb-2 mx-auto flex items-center justify-center border border-white/10 shadow-lg relative group-hover:scale-105 transition-transform">
                  <span className="text-3xl">👻</span>
                  <div className="absolute -bottom-2 bg-bg-deep border border-green-500/30 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                    2.1x
                  </div>
                </div>
                <div className="font-bold text-sm text-white">AAVE</div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex gap-3">
              <div className="flex-1 text-center">
                <div className="text-[10px] text-white/40 uppercase font-bold">
                  Ends In
                </div>
                <div className="font-mono text-white text-xs font-bold">
                  02:45:12
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-[10px] text-white/40 uppercase font-bold">
                  Pool
                </div>
                <div className="font-mono text-primary-glow text-xs font-bold">
                  $125K
                </div>
              </div>
            </div>

            <Link
              to="/battles/1"
              className="block w-full mt-4 bg-white text-bg-deep font-bold py-3 rounded-xl hover:bg-gray-100 transition-all uppercase text-xs tracking-widest text-center shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              Place Bet
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-panel p-5 opacity-75 grayscale hover:grayscale-0 transition-all flex items-center gap-4">
            <div className="flex flex-col items-center gap-1 min-w-[50px] border-r border-white/10 pr-4">
              <Clock className="w-5 h-5 text-white/40" />
              <span className="text-[10px] font-bold text-white/40">20:00</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">PEPE</span>
                <span className="text-xs text-white/30">vs</span>
                <span className="font-bold text-white">DOGE</span>
              </div>
              <div className="text-xs text-white/50">
                Meme Heavyweight Championship
              </div>
            </div>
            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors">
              Notify
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
