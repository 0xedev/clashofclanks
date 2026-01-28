import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clash of Clanks - Battle for Token Supremacy',
  description: 'Bet on Clanker token battles with leverage. Winner takes the pot!',
  openGraph: {
    title: 'Clash of Clanks',
    description: 'Bet on Clanker token battles with leverage',
    images: ['/og-image.png'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${process.env.NEXT_PUBLIC_URL}/og-image.png`,
    'fc:frame:button:1': 'View Battles',
    'fc:frame:button:2': 'My Bets',
    'fc:frame:button:3': 'Stake',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
