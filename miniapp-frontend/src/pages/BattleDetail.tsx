import { useState } from "react";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ShareButton } from "../components/ShareButton";

export function BattleDetail() {
  const { id } = useParams();
  const [leverage, setLeverage] = useState(1);
  const [amount, setAmount] = useState("");

  const leverageOptions = [1, 5, 10, 25, 50];

  return (
    <div className="relative z-10 w-full p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Battles</span>
        </Link>
        <ShareButton
          title="UNI vs AAVE Battle"
          url={`/battles/${id}`}
          description="Check out this epic token battle! Who will win? 🔥"
          variant="secondary"
          size="sm"
        />
      </div>

      {/* Battle Header */}
      <div className="glass-panel p-6 rounded-2xl flex justify-between items-center relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-glow/5 blur-3xl rounded-full -z-10"></div>

        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-bg-deep rounded-full mb-2 mx-auto flex items-center justify-center border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <span className="text-3xl">🦄</span>
          </div>
          <h2 className="font-bold text-white text-lg">UNI</h2>
        </div>

        <div className="flex flex-col items-center relative z-10">
          <span className="text-xs text-white/60 uppercase tracking-widest mb-1 font-bold">
            vs
          </span>
          <span className="text-4xl font-display font-bold text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            FIGHT
          </span>
          <div className="mt-2 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-0.5 rounded text-[10px] font-bold animate-pulse uppercase tracking-wider">
            ● Live
          </div>
        </div>

        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-bg-deep rounded-full mb-2 mx-auto flex items-center justify-center border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <span className="text-3xl">👻</span>
          </div>
          <h2 className="font-bold text-white text-lg">AAVE</h2>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4 text-center">
          <div className="text-xs text-white/70 uppercase font-bold tracking-wider">
            Pool Size
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1">
            $45,200
          </div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-xs text-white/70 uppercase font-bold tracking-wider">
            Participants
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1">128</div>
        </div>
      </div>

      {/* Betting Form */}
      <div className="glass-panel p-6 space-y-6">
        <h3 className="text-xl font-bold font-display text-white border-l-4 border-primary-glow pl-3">
          Place Your Bet
        </h3>

        {/* Token Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 border-2 border-red-500 bg-red-500/10 rounded-xl flex flex-col items-center justify-center gap-1 text-white font-bold hover:bg-red-500/20 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="text-lg">UNI</span>
            <span className="text-xs bg-bg-deep px-2 py-0.5 rounded text-white/80 border border-white/10">
              1.8x Payout
            </span>
          </button>
          <button className="p-4 border border-white/10 bg-bg-deep/50 rounded-xl flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white hover:border-white/30 transition-all">
            <span className="text-lg">AAVE</span>
            <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-white/40">
              2.1x Payout
            </span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-xs text-white/80 mb-2 block uppercase font-bold tracking-wider">
            Bet Amount ($COC)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-bg-deep border border-white/20 rounded-xl p-4 text-xl font-mono text-white placeholder:text-white/20 focus:border-primary-glow focus:ring-1 focus:ring-primary-glow outline-none transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 font-bold">
              MAX
            </button>
          </div>
          <div className="text-right text-xs text-white/60 mt-2 font-mono">
            Balance: 12,500 COC
          </div>
        </div>

        {/* Leverage Slider/Select */}
        <div>
          <label className="text-xs text-white/80 mb-2 block uppercase font-bold tracking-wider">
            Leverage:{" "}
            <span className="text-primary-glow font-mono text-base ml-1">
              {leverage}x
            </span>
          </label>
          <div className="flex justify-between gap-1 p-1.5 bg-bg-deep rounded-xl border border-white/10">
            {leverageOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setLeverage(opt)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold font-mono transition-all ${
                  leverage === opt
                    ? opt >= 25
                      ? "bg-red-500 text-bg-deep shadow-[0_0_10px_#ef4444]"
                      : "bg-primary-glow text-bg-deep shadow-[0_0_10px_#22d3ee]"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {opt}x
              </button>
            ))}
          </div>
          {leverage >= 25 && (
            <div className="flex items-center gap-2 mt-3 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold">High Risk:</span> Liquidation
              volatility penalty applies.
            </div>
          )}
        </div>

        {/* Submit */}
        <button className="w-full bg-primary-glow text-bg-deep font-bold py-4 rounded-xl hover:bg-cyan-300 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.4)] uppercase tracking-widest text-sm flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
          Confirm Bet
        </button>
      </div>
    </div>
  );
}
