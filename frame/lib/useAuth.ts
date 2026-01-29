'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

interface UserProfile {
  fid: number
  username?: string
  displayName?: string
  pfpUrl?: string
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        setIsLoading(true)
        
        // Get user context from Farcaster
        const context = await sdk.context
        
        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          })
        }
      } catch (err) {
        setError(err as Error)
        console.error('Authentication error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    authenticateUser()
  }, [])

  return { user, isLoading, error }
}
