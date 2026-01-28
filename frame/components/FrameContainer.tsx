'use client'

import { ReactNode } from 'react'

interface FrameContainerProps {
  children: ReactNode
}

export function FrameContainer({ children }: FrameContainerProps) {
  return (
    <div className="frame-container">
      {children}
    </div>
  )
}
