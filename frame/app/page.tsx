import { FrameContainer } from '../components/FrameContainer'
import { BattleList } from '../components/BattleList'

export default function Home() {
  return (
    <FrameContainer>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
        <header className="p-6 border-b border-purple-500/30">
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            ⚔️ Clash of Clanks
          </h1>
          <p className="text-center text-purple-300 mt-2">
            Battle for Token Supremacy
          </p>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <BattleList />
        </main>
        
        <footer className="p-6 text-center text-purple-400 text-sm border-t border-purple-500/30">
          <p>Powered by $COC • Built on Base</p>
        </footer>
      </div>
    </FrameContainer>
  )
}
