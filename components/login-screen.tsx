'use client'

import { useState, useEffect, useRef } from 'react'
import Image from "next/image"
import Link from "next/link"
import { CSSTransition } from 'react-transition-group'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import StartupAnimation from './StartupAnimation'
import '../styles/login-screen.css'
import '../styles/transitions.css'
import { useRouter } from 'next/navigation'

export default function LoginScreen() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const nodeRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const animationPlayed = localStorage.getItem('animationPlayed');
    console.log('Animation played status:', animationPlayed);
    if (animationPlayed !== 'true') {
      console.log('Animation not played before, showing startup animation');
      setShowLogin(false);
    } else {
      console.log('Animation played before, skipping startup animation');
      setShowLogin(true);
      setIsAnimationComplete(true);
    }
  }, [])

  useEffect(() => {
    if (isAnimationComplete) {
      setIsVisible(true);
    }
  }, [isAnimationComplete]);

  const handleAnimationComplete = () => {
    console.log('Animation complete, setting flags');
    localStorage.setItem('animationPlayed', 'true');
    setIsAnimationComplete(true);
    setShowLogin(true);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      console.log('User logged in:', data)
      localStorage.setItem('username', username)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login')
    }
  }

  const handleRegisterClick = () => {
    setIsVisible(false)
    setTimeout(() => nodeRef.current?.focus(), 300) //Added focus to avoid keyboard issues after redirect
  }

  if (!isAnimationComplete) {
    return <StartupAnimation onComplete={handleAnimationComplete} />;
  }

  return (
    <div className="login-screen">
      <CSSTransition
        in={isVisible}
        timeout={300}
        classNames="fade"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div className="fade-container" ref={nodeRef}>
          <div className="login-container">
            <div className="logo-container">
              <div className="logo">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/empire-logo-RF6sXeBwXQCgK8yx2pJoMjqI6WeJlb.png"
                  alt="Empire Logo"
                  width={400}
                  height={128}
                  className="object-contain mx-auto"
                />
              </div>
              <div className="title">
                <h1>DATASLATE</h1>
                <p>V231.231.2-1</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="input-container">
                <Input
                  type="text"
                  placeholder="EMPIRE ID"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="PASSWORD"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="button-container">
                <Button type="submit" className="button">
                  LOGIN
                </Button>
                <Link href="/register" passHref>
                  <Button type="button" className="button">
                    REGISTER
                  </Button>
                </Link>
              </div>
            </form>

            <Link 
              href="/recovery" 
              className="recovery-link"
            >
              Password Recovery
            </Link>
          </div>
        </div>
      </CSSTransition>
    </div>
  )
}
