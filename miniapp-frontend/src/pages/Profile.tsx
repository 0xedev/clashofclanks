import React, { useState } from "react";
import {
  User,
  Wallet,
  History,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Settings,
  LogOut,
  ShieldCheck,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

export function Profile() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 bg-[#060610] text-white min-h-screen">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl border border-white/10">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Profile
            </h1>
          </div>
          <button className="p-2 sm:p-2.5 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white">
            <Settings className="w-5 h-5 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 shadow-sm relative overflow-hidden group">
          {/* Decorative bg gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-glow/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 relative z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center border-2 border-white/20 text-2xl sm:text-3xl flex-shrink-0">
              😼
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-lg sm:text-xl truncate">0x1234...5678</div>
              <div className="text-xs sm:text-sm text-white/50 font-medium">
                Member since Jan 2026
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 relative z-10">
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/20 text-center shadow-sm">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 font-bold mb-1">
                Balance
              </div>
              <div className="font-bold text-white text-base sm:text-lg leading-none">
                5,420
              </div>
              <div className="text-[9px] sm:text-[10px] text-white/40 font-bold mt-0.5">
                COC
              </div>
            </div>
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/20 text-center shadow-sm">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 font-bold mb-1">
                Total Bets
              </div>
              <div className="font-bold text-white text-base sm:text-lg leading-none">
                47
              </div>
            </div>
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/20 text-center shadow-sm">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 font-bold mb-1">
                Win Rate
              </div>
              <div className="font-bold text-emerald-400 text-base sm:text-lg leading-none">
                68%
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-primary-glow text-[#060610] shadow-lg shadow-primary-glow/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("bets")}
            className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "bets"
                ? "bg-primary-glow text-[#060610] shadow-lg shadow-primary-glow/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            My Bets (2)
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* PnL Stats */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <TrendingUp className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-900" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-emerald-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Lifetime Performance
                </div>
                <div className="font-mono font-bold text-emerald-900 text-2xl sm:text-3xl mb-1.5 sm:mb-2">
                  +2,340 COC
                </div>
                <div className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-100/50 inline-block px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-emerald-200/50">
                  +76% ROI
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-left transition-all hover:scale-[1.02] shadow-sm group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 rounded-full flex items-center justify-center mb-2.5 sm:mb-3 group-hover:bg-white/10 transition-colors">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="font-bold text-white text-sm sm:text-base flex items-center gap-1">
                  Deposit{" "}
                  <ArrowUpRight className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] sm:text-xs text-white/50 mt-1">Top up funds</div>
              </button>
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-left transition-all hover:scale-[1.02] shadow-sm group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 rounded-full flex items-center justify-center mb-2.5 sm:mb-3 group-hover:bg-white/10 transition-colors">
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="font-bold text-white text-sm sm:text-base flex items-center gap-1">
                  Activity{" "}
                  <ArrowUpRight className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] sm:text-xs text-white/50 mt-1">View history</div>
              </button>
            </div>

            <button className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl transition-colors group mt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 text-red-600 rounded-lg group-hover:bg-red-500/20 transition-colors">
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-bold text-sm sm:text-base text-red-600/80">Sign Out</span>
              </div>
            </button>
          </div>
        )}

        {activeTab === "bets" && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Active Bet 1 */}
            <div className="bg-white/10 backdrop-blur-xl border border-emerald-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-sm hover:scale-[1.01] transition-transform">
              {/* Gradient Mesh */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(5,150,105,0.15),transparent_70%)] pointer-events-none" />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 text-xl sm:text-2xl shadow-sm flex-shrink-0">
                    👻
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-base sm:text-lg">AAVE</div>
                    <div className="text-[11px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">
                      Long vs UNI
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-emerald-200 mb-1 inline-block uppercase tracking-wider">
                    Winning
                  </div>
                  <div className="font-mono font-bold text-white text-sm sm:text-base">500 COC</div>
                </div>
              </div>

              <div className="bg-emerald-50/50 rounded-xl p-2.5 sm:p-3 flex justify-between items-center mb-3 sm:mb-4 border border-emerald-100/50 relative z-10">
                <span className="text-[11px] sm:text-xs font-bold text-emerald-900/40 uppercase">
                  PnL
                </span>
                <span className="text-emerald-700 font-mono font-bold text-sm sm:text-base flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  +120 (+24%)
                </span>
              </div>

              <button className="w-full bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-colors text-xs sm:text-sm shadow-sm relative z-10">
                Cash Out
              </button>
            </div>

            {/* Active Bet 2 - Danger */}
            <div className="bg-white/10 backdrop-blur-xl border border-red-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-sm hover:scale-[1.01] transition-transform">
              {/* Gradient Mesh */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.15),transparent_70%)] pointer-events-none" />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 text-xl sm:text-2xl shadow-sm flex-shrink-0">
                    🐸
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-base sm:text-lg">PEPE</div>
                    <div className="text-[11px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">
                      Short vs DOGE
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] sm:text-[10px] font-bold text-red-700 bg-red-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-red-200 mb-1 inline-block flex items-center gap-0.5 sm:gap-1 uppercase tracking-wider">
                    <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Risk
                  </div>
                  <div className="font-mono font-bold text-white text-sm sm:text-base">
                    1,000 COC
                  </div>
                </div>
              </div>

              <div className="bg-red-50/50 rounded-xl p-2.5 sm:p-3 flex justify-between items-center mb-3 sm:mb-4 border border-red-100/50 relative z-10">
                <span className="text-[11px] sm:text-xs font-bold text-red-900/40 uppercase">
                  PnL
                </span>
                <span className="text-red-600 font-mono font-bold text-sm sm:text-base flex items-center gap-1">
                  -800 (-80%)
                </span>
              </div>

              <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2 mb-2 overflow-hidden relative z-10">
                <div className="w-[90%] h-full bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-[9px] sm:text-[10px] text-red-600 font-bold uppercase tracking-wider text-center relative z-10">
                Liquidation imminent
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
