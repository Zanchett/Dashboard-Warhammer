"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "../styles/register-screen.css"

export default function RegisterScreen() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || "Registration successful! Redirecting to login...")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setError(data.message || "Registration failed.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Registration error:", err)
    }
  }

  return (
    <div className="register-screen">
      <div className="register-container">
        <h1 className="register-title">NEW USER PROTOCOL</h1>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="DESIGNATION (USERNAME)"
            className="register-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="ACCESS KEY (PASSWORD)"
            className="register-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="CONFIRM ACCESS KEY"
            className="register-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="register-button">
            INITIATE REGISTRATION
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <a href="/" className="register-link">
          RETURN TO LOGIN
        </a>
      </div>
    </div>
  )
}
