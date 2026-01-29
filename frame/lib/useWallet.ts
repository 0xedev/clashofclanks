'use client'

import { sdk } from '@farcaster/miniapp-sdk'

interface SendTransactionParams {
  to: string
  value?: string
  data?: string
}

export const useWallet = () => {
  const sendTransaction = async (params: SendTransactionParams) => {
    try {
      const result = await sdk.wallet.sendTransaction({
        to: params.to,
        value: params.value || '0',
        data: params.data,
      })
      return result
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    }
  }

  const getAddress = async () => {
    try {
      const address = await sdk.wallet.getAddress()
      return address
    } catch (error) {
      console.error('Failed to get address:', error)
      throw error
    }
  }

  const switchChain = async (chainId: number) => {
    try {
      await sdk.wallet.switchChain({ chainId })
    } catch (error) {
      console.error('Failed to switch chain:', error)
      throw error
    }
  }

  return {
    sendTransaction,
    getAddress,
    switchChain,
  }
}
