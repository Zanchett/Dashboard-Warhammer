'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RegisterScreen from '../../components/register-screen'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Registration successful:', data)
        router.push('/') // Redirect to login page after successful registration
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('An unexpected error occurred')
    }
  }

  return (
    <main>
      <RegisterScreen onRegister={handleRegister} error={error} />
    </main>
  )
}

