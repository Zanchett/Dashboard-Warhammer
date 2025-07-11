"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Users, Book, ScrollText, Wallet, Shield, Settings, LogOut } from "lucide-react"
import "../styles/dashboard.css"
import "../styles/dashboard-crt.css"
import Chat from "./Chat"
import Contacts from "./Contacts"
import Missions from "./Missions"
import Library from "./Library"
import WalletComponent from "./Wallet"
import CharacterSheet from "./CharacterSheet"
import AdminPanel from "./AdminPanel"
import ShipControl from "./ShipControl"
import Market from "./Market"
import Notes from "./Notes"
import { useToast } from "@/hooks/use-toast"
import { Toast } from "./Toast"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("chat")
  const [username, setUsername] = useState("Inquisitor") // Placeholder
  const router = useRouter()
  const { toast, toasts } = useToast()

  useEffect(() => {
    // In a real app, fetch user data from session or API
    // For now, just set a placeholder username
    setUsername("Inquisitor")
  }, [])

  const handleLogout = () => {
    // In a real app, clear session/token
    toast({
      title: "Logging out...",
      description: "Returning to the void.",
    })
    setTimeout(() => {
      router.push("/")
    }, 1500)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return <Chat />
      case "contacts":
        return <Contacts />
      case "missions":
        return <Missions />
      case "library":
        return <Library />
      case "wallet":
        return <WalletComponent />
      case "character-sheet":
        return <CharacterSheet />
      case "admin-panel":
        return <AdminPanel />
      case "ship-control":
        return <ShipControl />
      case "market":
        return <Market />
      case "notes":
        return <Notes />
      default:
        return <Chat />
    }
  }

  return (
    <div className="dashboard-container crt-effect">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Warhammer Chat</h1>
        </div>
        <nav>
          <ul>
            <li>
              <a
                href="#"
                className={`nav-item ${activeTab === "chat" ? "active" : ""}`}
                onClick={() => setActiveTab("chat")}
              >
                <MessageSquare size={20} /> Chat
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-item ${activeTab === "contacts" ? "active" : ""}`}
                onClick={() => setActiveTab("contacts")}
              >
                <Users size={20} /> Contacts
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-item ${activeTab === "missions" ? "active" : ""}`}
                onClick={() => setActiveTab("missions")}
              >
                <ScrollText size={20} /> Missions
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-item ${activeTab === "library" ? "active" : ""}`}
                onClick={() => setActiveTab("library")}
              >
                <Book size={20} /> Library
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-item ${activeTab === "wallet" ? "active" : ""}`}
                onClick={() => setActiveTab("wallet")}
              >
                <Wallet size={20} /> Wallet
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-item ${activeTab === "character-sheet" ? "active" : ""}`}
                onClick={() => setActiveTab("character-sheet")}
              >
                <Shield size={20} /> Character Sheet
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-item ${activeTab === "admin-panel" ? "active" : ""}`}
                onClick={() => setActiveTab("admin-panel")}
              >
                <Settings size={20} /> Admin Panel
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-item ${activeTab === "ship-control" ? "active" : ""}`}
                onClick={() => setActiveTab("ship-control")}
              >
                <Settings size={20} /> Ship Control
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-item ${activeTab === "market" ? "active" : ""}`}
                onClick={() => setActiveTab("market")}
              >
                <Wallet size={20} /> Market
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-item ${activeTab === "notes" ? "active" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                <Book size={20} /> Notes
              </a>
            </li>
          </ul>
        </nav>
        <div className="mt-auto">
          <button onClick={handleLogout} className="nav-item w-full">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
      <main className="main-content">
        <div className="main-content-header">
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("-", " ")}</h2>
          <div className="user-info">
            <span>Welcome, {username}</span>
          </div>
        </div>
        <div className="content-area">{renderContent()}</div>
      </main>
      <div className="crt-overlay"></div>
      <div className="scanlines"></div>
      <Toast toasts={toasts} />
    </div>
  )
}
