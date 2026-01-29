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
