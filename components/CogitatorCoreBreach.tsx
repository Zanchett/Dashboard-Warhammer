"use client"

import { Label } from "@/components/ui/label"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"

interface CogitatorCoreBreachProps {
  onBreachSuccess: () => void
  onBreachFail: () => void
}

const MAX_BREACH_LEVEL = 100
const BREACH_RATE_PER_CLICK = 10
const DECAY_RATE_PER_SECOND = 5

const CogitatorCoreBreach: React.FC<CogitatorCoreBreachProps> = ({ onBreachSuccess, onBreachFail }) => {
  const [breachLevel, setBreachLevel] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const startGame = useCallback(() => {
    setBreachLevel(0)
    setIsActive(true)
    setMessage("Initiating core breach... Click to overload!")
    toast({
      title: "Cogitator Core Breach Started",
      description: "Click rapidly to overload the core before it stabilizes!",
    })
  }, [toast])

  useEffect(() => {
    let decayInterval: NodeJS.Timeout | null = null
    if (isActive) {
      decayInterval = setInterval(() => {
        setBreachLevel((prevLevel) => {
          const newLevel = Math.max(0, prevLevel - DECAY_RATE_PER_SECOND)
          if (newLevel === 0 && prevLevel > 0) {
            setIsActive(false)
            setMessage("Breach failed: Core stabilized.")
            toast({
              title: "Breach Failed",
              description: "The cogitator core stabilized.",
              variant: "destructive",
            })
            onBreachFail()
          }
          return newLevel
        })
      }, 1000) // Decay every second
    }

    return () => {
      if (decayInterval) clearInterval(decayInterval)
    }
  }, [isActive, onBreachFail, toast])

  const handleOverloadClick = () => {
    if (!isActive) return

    setBreachLevel((prevLevel) => {
      const newLevel = Math.min(MAX_BREACH_LEVEL, prevLevel + BREACH_RATE_PER_CLICK)
      if (newLevel >= MAX_BREACH_LEVEL) {
        setIsActive(false)
        setMessage("Core breached! System compromised.")
        toast({
          title: "Breach Successful",
          description: "The cogitator core has been successfully breached!",
        })
        onBreachSuccess()
      }
      return newLevel
    })
  }

  return (
    <div className="panel-cyberpunk p-6 flex flex-col items-center gap-6">
      <h3 className="text-neon text-xl">Cogitator Core Breach</h3>
      <div className="w-full">
        <Label htmlFor="breach-progress" className="text-neon mb-2 block">
          Breach Level: {breachLevel}%
        </Label>
        <Progress value={breachLevel} className="w-full" />
      </div>

      {isActive ? (
        <>
          <Button
            onClick={handleOverloadClick}
            className="btn-cyberpunk text-lg px-8 py-3 w-full max-w-xs animate-pulse"
          >
            <Icons.zap className="mr-2 h-5 w-5" /> Overload Core!
          </Button>
          <p className="text-sm text-center text-neon">{message}</p>
        </>
      ) : (
        <Button onClick={startGame} className="btn-cyberpunk text-lg px-8 py-3">
          <Icons.play className="mr-2 h-5 w-5" /> Initiate Breach
        </Button>
      )}
    </div>
  )
}

export default CogitatorCoreBreach
