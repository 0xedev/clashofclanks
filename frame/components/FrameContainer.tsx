'use client'

import { useEffect, ReactNode } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

interface FrameContainerProps {
  children: ReactNode
}

export function FrameContainer({ children }: FrameContainerProps) {
  useEffect(() => {
    // Initialize Mini App SDK and signal ready
    const initMiniApp = async () => {
      try {
        // Wait for content to be fully loaded
        await sdk.actions.ready()
      } catch (error) {
        console.error('Failed to initialize Mini App SDK:', error)
      }
    }
    
    initMiniApp()
  }, [])

  return (
    <div className="mini-app-container">
      {children}
    </div>
  )
}
