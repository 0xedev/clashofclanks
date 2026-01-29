'use client'

import { FrameContainer } from '../components/FrameContainer'
import { BattleList } from '../components/BattleList'
import { useAuth } from '../lib/useAuth'

export default function Home() {
  const { user, isLoading } = useAuth()

  return (
    <FrameContainer>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
        <header className="p-6 border-b border-purple-500/30">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                ⚔️ Clash of Clanks
              </h1>
              <p className="text-center text-purple-300 mt-2">
                Battle for Token Supremacy
              </p>
            </div>
            {!isLoading && user && (
              <div className="flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-lg">
                {user.pfpUrl && (
                  <img 
                    src={user.pfpUrl} 
                    alt={user.username || 'User'} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-semibold">
                  {user.displayName || user.username || `FID: ${user.fid}`}
                </span>
              </div>
            )}
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <BattleList />
        </main>
        
        <footer className="p-6 text-center text-purple-400 text-sm border-t border-purple-500/30">
          <p>Powered by $COC • Built on Base • Farcaster Mini App</p>
        </footer>
      </div>
    </FrameContainer>
  )
}
