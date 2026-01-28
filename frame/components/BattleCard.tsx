'use client'

interface Battle {
  id: number
  token1: {
    address: string
    name: string
    symbol: string
  }
  token2: {
    address: string
    name: string
    symbol: string
  }
  startTime: number
  endTime: number
  totalBets: string
  spotlightBattle: boolean
  theme: string
}

interface BattleCardProps {
  battle: Battle
}

export function BattleCard({ battle }: BattleCardProps) {
  const timeRemaining = Math.floor((battle.endTime - Date.now() / 1000) / 3600)
  
  return (
    <div className={`
      relative p-6 rounded-xl border-2 
      ${battle.spotlightBattle 
        ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/20 to-purple-900/20 animate-pulse-glow' 
        : 'border-purple-500/30 bg-purple-900/10'
      }
      hover:border-purple-400 transition-all duration-300 hover:scale-105
    `}>
      {battle.spotlightBattle && (
        <div className="absolute -top-3 -right-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
          ⭐ SPOTLIGHT
        </div>
      )}
      
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-purple-500/30 rounded-full text-xs font-semibold">
          {battle.theme} Battle
        </span>
      </div>
      
      <div className="space-y-4">
        {/* Token 1 */}
        <div className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg">
          <div>
            <div className="font-bold text-lg">{battle.token1.symbol}</div>
            <div className="text-sm text-blue-300">{battle.token1.name}</div>
          </div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold transition">
            Bet 🔵
          </button>
        </div>
        
        {/* VS Divider */}
        <div className="text-center text-2xl font-bold text-purple-400">⚔️ VS</div>
        
        {/* Token 2 */}
        <div className="flex items-center justify-between p-3 bg-pink-900/30 rounded-lg">
          <div>
            <div className="font-bold text-lg">{battle.token2.symbol}</div>
            <div className="text-sm text-pink-300">{battle.token2.name}</div>
          </div>
          <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg text-sm font-semibold transition">
            Bet 🔴
          </button>
        </div>
      </div>
      
      {/* Battle Stats */}
      <div className="mt-4 pt-4 border-t border-purple-500/30 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-purple-400">Total Pool:</span>
          <span className="font-bold">{Number(battle.totalBets).toLocaleString()} $COC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-purple-400">Time Remaining:</span>
          <span className="font-bold">{timeRemaining}h</span>
        </div>
      </div>
      
      <button className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition">
        View Details →
      </button>
    </div>
  )
}
