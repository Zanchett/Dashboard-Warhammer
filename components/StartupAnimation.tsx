"use client"

import { useState, useEffect } from "react"
import { CSSTransition } from "react-transition-group"
import "../styles/StartupAnimation.module.css" // Import the CSS module

export default function StartupAnimation({ onComplete }: { onComplete: () => void }) {
  const [showScreen, setShowScreen] = useState(true)
  const [showText, setShowText] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowText(true)
    }, 500) // Show text after 0.5 seconds

    const timer2 = setTimeout(() => {
      setShowScreen(false) // Start fading out the animation screen
    }, 3000) // Keep animation for 3 seconds

    const timer3 = setTimeout(() => {
      onComplete() // Call onComplete after animation is fully gone
    }, 4000) // Allow 1 second for fade-out transition

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  return (
    <CSSTransition
      in={showScreen}
      timeout={1000} // Match this with the CSS transition duration
      classNames="startup-screen"
      unmountOnExit
    >
      <div className="startup-screen">
        <CSSTransition in={showText} timeout={500} classNames="startup-text" unmountOnExit>
          <h1 className="startup-text">Initializing... For the Emperor!</h1>
        </CSSTransition>
      </div>
    </CSSTransition>
  )
}
