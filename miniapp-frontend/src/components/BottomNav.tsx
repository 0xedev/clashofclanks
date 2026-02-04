import { Home, Swords, User, Trophy, ChartBar, Info } from "lucide-react";
import { NavLink } from "react-router-dom";

export function BottomNav() {
  const items = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Battles", icon: Swords, path: "/battles" },
    { label: "Staking", icon: Trophy, path: "/staking" },
    { label: "Ranking", icon: ChartBar, path: "/leaderboard" },
    { label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-2xl lg:max-w-4xl bg-bg-deep/90 backdrop-blur-xl border-t border-white/10 grid grid-cols-5 items-end py-2 pb-6 z-50">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all duration-200 group py-2 ${
                isActive
                  ? "text-primary-glow"
                  : "text-white/40 hover:text-white/70"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary-glow/10 -translate-y-1"
                      : "group-hover:-translate-y-0.5"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary-glow/20 blur-md rounded-full -z-10"></div>
                  )}
                </div>

                <span
                  className={`text-[10px] font-display font-bold uppercase tracking-wider ${
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-50 h-0 overflow-hidden"
                  } transition-all duration-200`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
