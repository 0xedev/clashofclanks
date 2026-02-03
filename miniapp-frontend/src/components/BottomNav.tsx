import { Home, Pickaxe, Swords, ChartBar, Gem } from "lucide-react";

export function BottomNav() {
  const items = [
    { label: "Home", icon: Home, active: true },
    { label: "Upgrade", icon: Pickaxe },
    { label: "Battles", icon: Swords },
    { label: "Leader", icon: ChartBar },
    { label: "Rewards", icon: Gem },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-bg-deep/80 backdrop-blur-xl border-t border-white/5 flex justify-around items-end py-3 px-2 pb-8 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            className={`flex-1 flex flex-col items-center gap-1.5 transition-all duration-300 relative group ${
              item.active 
                ? "text-primary-glow scale-110" 
                : "text-white/40 hover:text-white/80 active:scale-95"
            }`}
          >
            <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
              item.active 
                ? "bg-primary-glow/10 shadow-[0_0_15px_rgba(34,211,238,0.25)]" 
                : "group-hover:bg-white/5"
            }`}>
              <Icon className={`w-6 h-6 ${item.active ? "stroke-[2.5px]" : "stroke-2"}`} />
              
              {item.active && (
                <div className="absolute inset-0 bg-primary-glow/20 blur-lg rounded-full -z-10 animate-pulse"></div>
              )}
            </div>
            
            <span className={`text-[10px] font-display font-bold uppercase tracking-wider transition-colors duration-300 ${
              item.active ? "text-primary-glow text-shadow-glow" : ""
            }`}>
              {item.label}
            </span>
            
            {item.active && (
              <div className="absolute -bottom-4 w-1 h-1 bg-primary-glow rounded-full shadow-[0_0_10px_#22d3ee] animate-bounce"></div>
            )}
          </button>
        );
      })}
    </nav>
  );
}

