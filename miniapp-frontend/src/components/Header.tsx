import { useAccount } from "wagmi";
import { Trophy, Zap, Settings } from "lucide-react";

export function Header() {
  const { address } = useAccount();
  
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-bg-deep/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-glow ring-2 ring-primary-glow/20 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Clash" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)] backdrop-blur-md">
          <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
          <span className="font-display text-sm font-bold text-yellow-100/90 tracking-wide">1,250</span>
        </div>
        
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)] backdrop-blur-md">
          <Zap className="w-4 h-4 text-green-500 fill-green-500/20" />
          <span className="font-display text-sm font-bold text-green-100/90 tracking-wide">10/10</span>
        </div>
      </div>

      <button className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md">
        <Settings className="w-5 h-5" />
      </button>
    </header>
  );
}
