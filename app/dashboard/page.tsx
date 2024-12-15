'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/components/dashboard'

export default function DashboardPage() {
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    if (storedUsername) {
      setUsername(storedUsername)
      setLoading(false)
    } else {
      setError('No username found. Redirecting to login...')
      setTimeout(() => router.push('/'), 2000)
    }
  }, [router])

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!username) {
    return <div>No username found. Redirecting to login...</div>
  }

  return <Dashboard username={username} />
}

