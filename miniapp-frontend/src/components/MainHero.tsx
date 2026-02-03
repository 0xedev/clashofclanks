export function MainHero() {
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-12 px-6 gap-8 text-center overflow-hidden min-h-[65vh] relative">
      <div className="flex-1 w-full" /> 
      
      <button className="btn-battle group relative z-20 mt-auto w-full max-w-[280px] active:scale-95 transition-transform duration-200">
        <span className="relative z-10 italic tracking-wider">BATTLE NOW</span>
        <div className="absolute inset-0 bg-primary-glow/20 rounded-full blur-xl group-hover:bg-primary-glow/40 transition-all opacity-0 group-hover:opacity-100 duration-500"></div>
        <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"></div>
      </button>
    </div>
  );
}

