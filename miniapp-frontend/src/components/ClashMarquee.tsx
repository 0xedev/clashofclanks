export function ClashMarquee() {
  return (
    <div className="w-full bg-gradient-to-r from-purple-800/80 via-blue-900/80 to-purple-800/80 backdrop-blur-md py-3 border-y border-white/5 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        <span className="font-display text-xs font-bold mx-4 text-white/90">CLASH OF THE DAY:</span>
        <span className="font-display text-xs font-bold mx-4 text-cyan-400">PROXYSTUDIOS VS DEPLOYER</span>
        <span className="font-display text-xs font-bold mx-4 text-purple-400">$PROXY VS $DEPLOYER</span>
        {/* Repeat for continuous scroll effect */}
        <span className="font-display text-xs font-bold mx-4 text-white/90">CLASH OF THE DAY:</span>
        <span className="font-display text-xs font-bold mx-4 text-cyan-400">PROXYSTUDIOS VS DEPLOYER</span>
        <span className="font-display text-xs font-bold mx-4 text-purple-400">$PROXY VS $DEPLOYER</span>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
