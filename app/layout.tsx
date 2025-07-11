import type React from "react"
import "../styles/globals.css"
import "../styles/global-crt.css"
import "../styles/wallet.css"
import "../styles/admin-panel.css"
import "../styles/servitor-assistant.css"
import "../styles/mechanicus-upgrades.css"
import "../styles/library.css"
import "../styles/messages.css"
import "../styles/missions.css"
import { Toaster } from "react-hot-toast"
import { Share_Tech_Mono } from "next/font/google"

// Initialize the Share Tech Mono font
const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-share-tech-mono",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={shareTechMono.variable}>
      <body>
        <div className="global-crt">
          <div className="crt-overlay"></div>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
