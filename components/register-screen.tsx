'use client'

import { useState, useEffect, useRef } from 'react'
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { CSSTransition } from 'react-transition-group'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import StartupAnimation from './StartupAnimation'
import '../styles/register-screen.css'
import '../styles/transitions.css'

interface RegisterScreenProps {
  onRegister: (username: string, password: string) => Promise<void>
  error: string | null
}

export default function RegisterScreen({ onRegister, error }: RegisterScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()
  const nodeRef = useRef(null)

  useEffect(() => {
    const animationPlayed = localStorage.getItem('animationPlayed')
    if (animationPlayed) {
      setShowRegister(true)
    }
  }, [])

  const handleAnimationComplete = () => {
    localStorage.setItem('animationPlayed', 'true')
    setShowRegister(true)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      setIsLoading(false)
      return
    }

    try {
      await onRegister(username, password)
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsVisible(false)
    setTimeout(() => router.push('/'), 300)
  }

  if (!showRegister) {
    return <StartupAnimation onComplete={handleAnimationComplete} />
  }

  return (
    <div className="register-screen">
      <CSSTransition
        in={isVisible}
        timeout={300}
        classNames="fade"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div className="fade-container" ref={nodeRef}>
          <div className="register-container">
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
                <h1>REGISTER</h1>
                <p>Join the Empire</p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="register-form">
              <div className="input-container">
                <Input
                  type="text"
                  placeholder="EMPIRE ID"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="PASSWORD"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="CONFIRM PASSWORD"
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="button-container">
                <Button type="submit" className="button" disabled={isLoading}>
                  {isLoading ? 'REGISTERING...' : 'REGISTER'}
                </Button>
              </div>
            </form>

            <Link 
              href="/"
              className="back-link"
              onClick={handleBackToLogin}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </CSSTransition>
    </div>
  )
}
