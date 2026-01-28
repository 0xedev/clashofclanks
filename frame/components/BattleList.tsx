'use client'

import { useState, useEffect } from 'react'
import { BattleCard } from './BattleCard'

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

export function BattleList() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch battles from API
    fetchBattles()
  }, [])

  const fetchBattles = async () => {
    try {
      // TODO: Replace with actual API call
      const mockBattles: Battle[] = [
        {
          id: 1,
          token1: {
            address: '0x...',
            name: 'Pepe Supreme',
            symbol: 'PEPES'
          },
          token2: {
            address: '0x...',
            name: 'Doge Ultimate',
            symbol: 'DOGEU'
          },
          startTime: Date.now() / 1000,
          endTime: (Date.now() / 1000) + (7 * 24 * 60 * 60),
          totalBets: '125000',
          spotlightBattle: true,
          theme: 'Meme'
        }
      ]
      
      setBattles(mockBattles)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching battles:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-purple-300 mb-4">⚡ Active Battles</h2>
      
      {battles.length === 0 ? (
        <div className="text-center py-12 text-purple-400">
          <p className="text-xl">No active battles</p>
          <p className="text-sm mt-2">Check back soon for new matchups!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {battles.map((battle) => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>
      )}
    </div>
  )
}
