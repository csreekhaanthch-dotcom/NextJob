import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NextJob - AI-Powered Career Platform',
  description: 'Find your dream job with AI-powered job matching, resume analysis, and interview preparation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
