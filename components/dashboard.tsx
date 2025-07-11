"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/utils/i18n"
import "../styles/dashboard.css"
import { Chat } from "./Chat"
import { Contacts } from "./Contacts"
import { Messages } from "./Messages"
import { Missions } from "./Missions"
import { Library } from "./Library"
import { Wallet } from "./Wallet"
import { CharacterSheet } from "./CharacterSheet"
import { ServitorAssistant } from "./ServitorAssistant"
import { MechanicusUpgrades } from "./MechanicusUpgrades"
import { PuritySealDisplay } from "./PuritySealDisplay"
import { Notes } from "./Notes"
import { ShipControl } from "./ShipControl"
import { Market } from "./Market"
import { CogitatorCoreBreach } from "./CogitatorCoreBreach"
import { HackingMinigame } from "./HackingMinigame"
import { HealthIndicator } from "./HealthIndicator"
import { WarpFluctuationGraph } from "./WarpFluctuationGraph"
import { LanguageToggle } from "./LanguageToggle"

export default function Dashboard() {
  const [username, setUsername] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("username")
    router.push("/")
  }

  if (!username) {
    return <div className="loading-screen">Authenticating...</div>
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">{t("dashboard.welcome", { username })}</h1>
        <nav className="dashboard-nav">
          <LanguageToggle />
          <button onClick={() => setActiveTab("chat")} className="dashboard-nav-button">
            {t("dashboard.nav.chat")}
          </button>
          <button onClick={() => setActiveTab("contacts")} className="dashboard-nav-button">
            {t("dashboard.nav.contacts")}
          </button>
          <button onClick={() => setActiveTab("messages")} className="dashboard-nav-button">
            {t("dashboard.nav.messages")}
          </button>
          <button onClick={() => setActiveTab("missions")} className="dashboard-nav-button">
            {t("dashboard.nav.missions")}
          </button>
          <button onClick={() => setActiveTab("library")} className="dashboard-nav-button">
            {t("dashboard.nav.library")}
          </button>
          <button onClick={() => setActiveTab("wallet")} className="dashboard-nav-button">
            {t("dashboard.nav.wallet")}
          </button>
          <button onClick={() => setActiveTab("character-sheet")} className="dashboard-nav-button">
            {t("dashboard.nav.characterSheet")}
          </button>
          <button onClick={() => setActiveTab("servitor-assistant")} className="dashboard-nav-button">
            {t("dashboard.nav.servitorAssistant")}
          </button>
          <button onClick={() => setActiveTab("mechanicus-upgrades")} className="dashboard-nav-button">
            {t("dashboard.nav.mechanicusUpgrades")}
          </button>
          <button onClick={() => setActiveTab("purity-seal")} className="dashboard-nav-button">
            {t("dashboard.nav.puritySeal")}
          </button>
          <button onClick={() => setActiveTab("notes")} className="dashboard-nav-button">
            {t("dashboard.nav.notes")}
          </button>
          <button onClick={() => setActiveTab("ship-control")} className="dashboard-nav-button">
            {t("dashboard.nav.shipControl")}
          </button>
          <button onClick={() => setActiveTab("market")} className="dashboard-nav-button">
            {t("dashboard.nav.market")}
          </button>
          <button onClick={() => setActiveTab("cogitator-core-breach")} className="dashboard-nav-button">
            {t("dashboard.nav.cogitatorCoreBreach")}
          </button>
          <button onClick={() => setActiveTab("hacking-minigame")} className="dashboard-nav-button">
            {t("dashboard.nav.hackingMinigame")}
          </button>
          <button onClick={() => setActiveTab("health-indicator")} className="dashboard-nav-button">
            {t("dashboard.nav.healthIndicator")}
          </button>
          <button onClick={() => setActiveTab("warp-fluctuation-graph")} className="dashboard-nav-button">
            {t("dashboard.nav.warpFluctuationGraph")}
          </button>
          <button onClick={handleLogout} className="dashboard-nav-button">
            {t("dashboard.nav.logout")}
          </button>
        </nav>
      </header>

      <main className="dashboard-main">
        {activeTab === "chat" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.chat")}</h2>
            <Chat username={username} />
          </section>
        )}
        {activeTab === "contacts" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.contacts")}</h2>
            <Contacts />
          </section>
        )}
        {activeTab === "messages" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.messages")}</h2>
            <Messages />
          </section>
        )}
        {activeTab === "missions" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.missions")}</h2>
            <Missions />
          </section>
        )}
        {activeTab === "library" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.library")}</h2>
            <Library />
          </section>
        )}
        {activeTab === "wallet" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.wallet")}</h2>
            <Wallet username={username} />
          </section>
        )}
        {activeTab === "character-sheet" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.characterSheet")}</h2>
            <CharacterSheet username={username} />
          </section>
        )}
        {activeTab === "servitor-assistant" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.servitorAssistant")}</h2>
            <ServitorAssistant />
          </section>
        )}
        {activeTab === "mechanicus-upgrades" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.mechanicusUpgrades")}</h2>
            <MechanicusUpgrades username={username} />
          </section>
        )}
        {activeTab === "purity-seal" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.puritySeal")}</h2>
            <PuritySealDisplay />
          </section>
        )}
        {activeTab === "notes" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.notes")}</h2>
            <Notes />
          </section>
        )}
        {activeTab === "ship-control" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.shipControl")}</h2>
            <ShipControl />
          </section>
        )}
        {activeTab === "market" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.market")}</h2>
            <Market username={username} />
          </section>
        )}
        {activeTab === "cogitator-core-breach" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.cogitatorCoreBreach")}</h2>
            <CogitatorCoreBreach />
          </section>
        )}
        {activeTab === "hacking-minigame" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.hackingMinigame")}</h2>
            <HackingMinigame />
          </section>
        )}
        {activeTab === "health-indicator" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.healthIndicator")}</h2>
            <HealthIndicator />
          </section>
        )}
        {activeTab === "warp-fluctuation-graph" && (
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">{t("dashboard.section.warpFluctuationGraph")}</h2>
            <WarpFluctuationGraph />
          </section>
        )}
      </main>

      <footer className="dashboard-footer">
        <p>{t("dashboard.footer.copyright")}</p>
      </footer>
    </div>
  )
}
