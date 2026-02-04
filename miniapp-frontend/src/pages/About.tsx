import {
  Info,
  Sword,
  Shield,
  Trophy,
  Coins,
  ExternalLink,
  BookOpen,
  MessageCircle,
} from "lucide-react";

export function About() {
  return (
    <div className="relative z-10 w-full p-4 space-y-6 pt-20">
      <div className="flex items-center gap-3 mb-2">
        <Info className="w-7 h-7 text-primary-glow" />
        <h1 className="text-xl font-bold font-display text-white">
          About & Help
        </h1>
      </div>

      {/* App Info */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-glow/20 rounded-xl flex items-center justify-center border border-primary-glow/50">
            <Sword className="w-6 h-6 text-primary-glow" />
          </div>
          <div>
            <div className="font-bold text-white text-base">
              Clash of Clanks
            </div>
            <div className="text-xs text-white/50">v1.0.0</div>
          </div>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          Battle-based prediction markets where tokens clash. Bet on price
          movements with leverage and compete for glory.
        </p>
      </div>

      {/* How It Works */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white/90 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-glow" />
          How It Works
        </h2>

        <div className="space-y-2">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/50 shrink-0">
              <Sword className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5">
                Choose a Battle
              </div>
              <div className="text-[11px] text-white/60 leading-relaxed">
                Pick from live token battles. Each battle has two sides
                competing.
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/50 shrink-0">
              <Coins className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5">
                Place Your Bet
              </div>
              <div className="text-[11px] text-white/60 leading-relaxed">
                Bet COC tokens on the side you think will win. Choose your
                leverage.
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/50 shrink-0">
              <Trophy className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5">
                Win or Lose
              </div>
              <div className="text-[11px] text-white/60 leading-relaxed">
                When battle ends, winning side gets the pool. Track P&L in
                real-time.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white/90 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary-glow" />
          Key Features
        </h2>

        <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-primary-glow rounded-full mt-1.5"></div>
            <div className="text-xs text-white/70">
              Leverage up to 100x for higher risk/reward
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-primary-glow rounded-full mt-1.5"></div>
            <div className="text-xs text-white/70">
              Early cash-out before battle ends (with fees)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-primary-glow rounded-full mt-1.5"></div>
            <div className="text-xs text-white/70">
              Stake COC tokens for passive rewards
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-primary-glow rounded-full mt-1.5"></div>
            <div className="text-xs text-white/70">
              Real-time price feeds via Uniswap oracles
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="space-y-2">
        <a
          href="https://docs.clashofclanks.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary-glow" />
            <div className="text-xs font-bold text-white">Documentation</div>
          </div>
          <ExternalLink className="w-4 h-4 text-white/40" />
        </a>

        <a
          href="https://discord.gg/clashofclanks"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-primary-glow" />
            <div className="text-xs font-bold text-white">
              Discord Community
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-white/40" />
        </a>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <div className="text-[10px] text-yellow-200/80 leading-relaxed">
          <strong>Disclaimer:</strong> Crypto trading involves risk. Only bet
          what you can afford to lose. This is not financial advice. Smart
          contracts are experimental.
        </div>
      </div>
    </div>
  );
}
