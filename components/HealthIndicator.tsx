"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import styles from "../styles/HealthIndicator.module.css"

interface HealthIndicatorProps {
  currentHealth: number
  maxHealth: number
}

export default function HealthIndicator({ currentHealth, maxHealth }: HealthIndicatorProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculatedProgress = (currentHealth / maxHealth) * 100
    setProgress(calculatedProgress)
  }, [currentHealth, maxHealth])

  const getHealthColorClass = (value: number) => {
    if (value > 75) return styles.healthHigh
    if (value > 40) return styles.healthMedium
    return styles.healthLow
  }

  return (
    <div className={cn("w-full", styles.healthIndicatorContainer)}>
      <div className={styles.healthText}>
        Health: {currentHealth}/{maxHealth}
      </div>
      <Progress value={progress} className={cn("w-full", styles.healthProgressBar, getHealthColorClass(progress))} />
    </div>
  )
}
