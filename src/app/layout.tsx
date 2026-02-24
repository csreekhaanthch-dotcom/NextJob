import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NextJob - AI Career Platform',
  description: 'Find your dream job with AI-powered matching',
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
