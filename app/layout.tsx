import type React from "react"
import type { Metadata } from "next"
import { Share_Tech_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech-mono",
})

export const metadata: Metadata = {
  title: "Warhammer Chat",
  description: "An Imperial chat interface for the grimdark future.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", shareTechMono.variable)}>{children}</body>
    </html>
  )
}
