"use client"

import { useEffect, useState } from "react"
import styles from "../styles/StartupAnimation.module.css"
import { usePathname } from "next/navigation"

export default function StartupAnimation() {
  const [showAnimation, setShowAnimation] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    console.log("StartupAnimation useEffect triggered")
    const animationPlayed = sessionStorage.getItem("animationPlayed")
    console.log("Animation played status:", animationPlayed)

    // Only show animation on the root path and if it hasn't been played before
    if (pathname === "/" && !animationPlayed) {
      setShowAnimation(true)
      sessionStorage.setItem("animationPlayed", "true")
      console.log("Animation played before, skipping startup animation")
    } else {
      setShowAnimation(false)
    }
  }, [pathname])

  if (!showAnimation) {
    return null
  }

  return (
    <div className={styles.animationContainer}>
      <div className={styles.glitchText}>
        <span className={styles.glitch}>WARHAMMER 40,000</span>
        <span className={styles.glitch}>IMPERIAL DATA NETWORK</span>
        <span className={styles.glitch}>ACCESSING...</span>
      </div>
      <div className={styles.scanline}></div>
      <div className={styles.noise}></div>
    </div>
  )
}
