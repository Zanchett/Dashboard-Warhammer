"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "../styles/login-screen.css"

export default function LoginScreen() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("username", username)
        router.push("/dashboard")
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Login error:", err)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <h1 className="login-title">ACCESS TERMINAL</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="USERNAME"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">
            INITIATE LOGIN
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <a href="/register" className="login-link">
          NEW USER REGISTRATION
        </a>
      </div>
    </div>
  )
}
