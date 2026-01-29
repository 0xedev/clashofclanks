'use client'

import { sdk } from '@farcaster/miniapp-sdk'

interface NotificationParams {
  title: string
  body: string
  targetUrl?: string
}

export const useNotifications = () => {
  const requestPermission = async () => {
    try {
      const permission = await sdk.notifications.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  const sendNotification = async (params: NotificationParams) => {
    try {
      await sdk.notifications.send({
        title: params.title,
        body: params.body,
        targetUrl: params.targetUrl,
      })
      return true
    } catch (error) {
      console.error('Failed to send notification:', error)
      return false
    }
  }

  return {
    requestPermission,
    sendNotification,
  }
}
