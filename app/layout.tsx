import '../styles/globals.css'
import '../styles/global-crt.css'
import '../styles/wallet.css'
import '../styles/admin-panel.css'
import '../styles/servitor-assistant.css'
import '../styles/mechanicus-upgrades.css'
import '../styles/library.css'
import '../styles/messages.css'
import '../styles/missions.css'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
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
      generator: 'v0.app'
    };
