import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextJob - AI-Powered Career Platform",
  description: "Find your dream job with AI-powered matching, resume analysis, interview prep, and company insights.",
  keywords: ["job search", "career", "AI", "resume", "interview", "employment", "remote jobs"],
  authors: [{ name: "NextJob Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "NextJob - AI-Powered Career Platform",
    description: "Find your dream job with AI-powered matching and career tools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}