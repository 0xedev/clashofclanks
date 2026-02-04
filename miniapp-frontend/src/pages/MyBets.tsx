import React, { useState } from "react";
import {
  History,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  ArrowRight,
  Activity,
  Flame,
  ShieldAlert,
} from "lucide-react";

// Mock Data to simulate a real environment
const ACTIVE_BETS: BetData[] = [
  {
    id: 1,
    pair: "AAVE/UNI",
    icon: "👻",
    vsIcon: "🦄",
    type: "Long",
    leverage: 10,
    collateral: 500,
    pnl: 120,
    pnlPercent: 24,
    status: "winning",
    liquidationRisk: 15, // 0-100%
  },
  {
    id: 2,
    pair: "PEPE/DOGE",
    icon: "🐸",
    vsIcon: "🐶",
    type: "Short",
    leverage: 50,
    collateral: 1000,
    pnl: -800,
    pnlPercent: -80,
    status: "danger",
    liquidationRisk: 90,
  },
];

const HISTORY_BETS: BetData[] = [
  {
    id: 3,
    pair: "BTC/USD",
    icon: "₿",
    vsIcon: "💵",
    type: "Long",
    leverage: 20,
    collateral: 200,
    pnl: 450,
    pnlPercent: 225,
    status: "closed-win",
    date: "2h ago",
  },
];

type BetStatus = "winning" | "danger" | "closed-win";

type BetData = {
  id: number;
  pair: string;
  icon: string;
  vsIcon: string;
  type: "Long" | "Short";
  leverage: number;
  collateral: number;
  pnl: number;
  pnlPercent: number;
  status: BetStatus;
  liquidationRisk?: number;
  date?: string;
};

type BetCardProps = {
  data: BetData;
  isHistory?: boolean;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("active");

  // Calculate totals for the header
  const totalActiveValue = ACTIVE_BETS.reduce(
    (acc, bet) => acc + bet.collateral + bet.pnl,
    0,
  );
  const totalPnL = ACTIVE_BETS.reduce((acc, bet) => acc + bet.pnl, 0);

  return (
    <div className="flex-1 bg-[#060610] text-white min-h-screen">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl border border-white/10">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
                My Activity
              </h1>
            </div>
            <button className="p-2 sm:p-2.5 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white">
              <History className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Summary Card */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-2 text-white/60 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1">
                <Wallet className="w-3 h-3" /> Net Value
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {totalActiveValue.toLocaleString()} COC
              </div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-2 text-white/60 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1">
                <TrendingUp className="w-3 h-3" /> Total PnL
              </div>
              <div
                className={`text-lg sm:text-xl font-bold ${totalPnL >= 0 ? "text-emerald-700" : "text-red-700"}`}
              >
                {totalPnL > 0 ? "+" : ""}
                {totalPnL.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "active"
                ? "bg-primary-glow text-[#060610] shadow-lg shadow-primary-glow/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            Active ({ACTIVE_BETS.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "history"
                ? "bg-primary-glow text-[#060610] shadow-lg shadow-primary-glow/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            History
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4 sm:space-y-5">
          {activeTab === "active"
            ? ACTIVE_BETS.map((bet) => <BetCard key={bet.id} data={bet} />)
            : HISTORY_BETS.map((bet) => (
                <BetCard key={bet.id} data={bet} isHistory />
              ))}

          {/* Empty State */}
          {activeTab === "active" && ACTIVE_BETS.length === 0 && (
            <div className="text-center py-12 text-white/50">
              <p>No active bets found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Bet Card Component
function BetCard({ data, isHistory = false }: BetCardProps) {
  const isWinning = data.pnl >= 0;
  const isDanger = data.liquidationRisk > 80;

  // Dynamic Styles based on state
  const borderColor = isHistory
    ? "border-white/10"
    : isDanger
      ? "border-red-600/50 shadow-[0_0_30px_-10px_rgba(220,38,38,0.3)]"
      : isWinning
        ? "border-emerald-600/50 shadow-[0_0_30px_-10px_rgba(5,150,105,0.3)]"
        : "border-white/20";

  return (
    <div
      className={`relative group overflow-hidden rounded-2xl sm:rounded-3xl border ${borderColor} bg-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] shadow-sm`}
    >
      {/* Background Gradient Mesh */}
      <div
        className={`absolute inset-0 opacity-10 pointer-events-none ${
          isDanger
            ? "bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.5),transparent_70%)]"
            : isWinning
              ? "bg-[radial-gradient(circle_at_50%_0%,rgba(5,150,105,0.4),transparent_70%)]"
              : ""
        }`}
      />

      {/* Top Banner (Status) */}
      {!isHistory && (
        <div className="flex justify-between items-start pt-3.5 sm:pt-4 px-3.5 sm:px-4">
          {/* Leverage Badge */}
          <div
            className={`text-[10px] font-black tracking-widest px-2 py-1 rounded bg-white/10 border border-white/20 text-white/70`}
          >
            {data.leverage}X
          </div>

          {/* Risk/Status Badge */}
          {isDanger ? (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-700 bg-red-100 px-2 py-1 rounded border border-red-200 animate-pulse">
              <ShieldAlert className="w-3 h-3" /> Liquidation Risk
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-1 rounded border border-emerald-200">
              <Flame className="w-3 h-3" /> In The Money
            </div>
          )}
        </div>
      )}

      <div className="p-3.5 sm:p-5 pt-2">
        {/* Main Info Row */}
        <div className="flex justify-between items-end mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Overlapping Avatars */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-base sm:text-lg z-10 relative">
                {data.icon}
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-xs sm:text-sm absolute -bottom-1 -right-2 text-black/50 z-0">
                {data.vsIcon}
              </div>
            </div>

            <div className="ml-1 sm:ml-2 min-w-0">
              <h3 className="text-white font-bold text-base sm:text-lg leading-tight">
                {data.pair}
              </h3>
              <p
                className={`text-[11px] sm:text-xs font-medium ${data.type === "Long" ? "text-emerald-400" : "text-red-400"}`}
              >
                {data.type} Position
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xs sm:text-sm text-white/50 font-medium mb-0.5">PnL</div>
            <div
              className={`text-lg sm:text-xl font-mono font-bold flex items-center justify-end gap-1.5 sm:gap-2 ${isWinning ? "text-emerald-400" : "text-red-400"}`}
            >
              {isWinning ? (
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              {data.pnl > 0 ? "+" : ""}
              {data.pnl}
            </div>
            <div
              className={`text-[11px] sm:text-xs font-bold ${isWinning ? "text-emerald-400/70" : "text-red-400/70"}`}
            >
              ({data.pnl > 0 ? "+" : ""}
              {data.pnlPercent}%)
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-3.5 sm:mb-4">
          <div className="bg-white/5 rounded-lg p-2 sm:p-2.5 border border-white/10">
            <div className="text-[9px] sm:text-[10px] uppercase text-white/50 font-bold mb-1">
              Collateral
            </div>
            <div className="text-xs sm:text-sm font-mono text-white">
              {data.collateral} COC
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 sm:p-2.5 border border-white/10">
            <div className="text-[9px] sm:text-[10px] uppercase text-white/50 font-bold mb-1">
              Net Value
            </div>
            <div className="text-xs sm:text-sm font-mono text-white">
              {data.collateral + data.pnl} COC
            </div>
          </div>
        </div>

        {/* Liquidation Bar (Only for active bets) */}
        {!isHistory && (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
              <span className="text-white/50">Health Factor</span>
              <span className={isDanger ? "text-red-400" : "text-emerald-400"}>
                {isDanger ? "Critical" : "Safe"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isDanger
                    ? "bg-red-600 animate-pulse"
                    : "bg-gradient-to-r from-emerald-500 to-indigo-500"
                }`}
                style={{ width: `${data.liquidationRisk ?? 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!isHistory && (
          <button className="mt-4 sm:mt-5 w-full py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/20 hover:border-white/30 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 group/btn">
            {isWinning ? "Cash Out Winnings" : "Manage Position"}
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/40 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
