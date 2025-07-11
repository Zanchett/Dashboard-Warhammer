"use client"

import { Label } from "@/components/ui/label"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"

interface HackingMinigameProps {
  onHackSuccess: () => void
  onHackFail: () => void
}

const SEQUENCES = [
  ["ALPHA", "BETA", "GAMMA"],
  ["0101", "1010", "1100"],
  ["FIREWALL", "BREACH", "ACCESS"],
  ["VOID", "SHIELD", "OVERLOAD"],
]

const HackingMinigame: React.FC<HackingMinigameProps> = ({ onHackSuccess, onHackFail }) => {
  const [currentSequence, setCurrentSequence] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timer, setTimer] = useState(15) // 15 seconds for the minigame
  const [isActive, setIsActive] = useState(false)
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const startGame = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SEQUENCES.length)
    setCurrentSequence(SEQUENCES[randomIndex])
    setInput("")
    setCurrentIndex(0)
    setTimer(15)
    setIsActive(true)
    setMessage("Initiating hack... Enter the sequence!")
    toast({
      title: "Hacking Minigame Started",
      description: "Enter the sequence correctly before time runs out!",
    })
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    } else if (isActive && timer === 0) {
      setIsActive(false)
      setMessage("Hack failed: Time expired!")
      toast({
        title: "Hack Failed",
        description: "You ran out of time!",
        variant: "destructive",
      })
      onHackFail()
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timer, onHackFail, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return
    const value = e.target.value.toUpperCase()
    setInput(value)

    if (value === currentSequence[currentIndex]) {
      if (currentIndex === currentSequence.length - 1) {
        setIsActive(false)
        setMessage("Hack successful! Access granted.")
        toast({
          title: "Hack Successful",
          description: "You have successfully breached the system!",
        })
        onHackSuccess()
      } else {
        setMessage("Correct! Next word...")
        setCurrentIndex((prev) => prev + 1)
        setInput("")
      }
    } else if (currentSequence[currentIndex].startsWith(value) && value.length > 0) {
      setMessage("Keep going...")
    } else if (value.length > 0) {
      setMessage("Incorrect entry. Try again.")
    } else {
      setMessage("")
    }
  }

  const progressValue = (timer / 15) * 100

  return (
    <div className="panel-cyberpunk p-6 flex flex-col items-center gap-6">
      <h3 className="text-neon text-xl">Hacking Minigame</h3>
      <div className="w-full">
        <Label htmlFor="timer-progress" className="text-neon mb-2 block">
          Time Remaining: {timer}s
        </Label>
        <Progress value={progressValue} className="w-full" />
      </div>

      {isActive && (
        <>
          <div className="text-center text-neon text-3xl font-bold tracking-widest">
            {currentSequence[currentIndex]}
          </div>
          <Input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter sequence here..."
            className="input-cyberpunk w-full max-w-md text-center text-xl"
            disabled={!isActive}
            autoFocus
          />
          <p className="text-sm text-center text-neon">{message}</p>
        </>
      )}

      {!isActive && (
        <Button onClick={startGame} className="btn-cyberpunk text-lg px-8 py-3">
          <Icons.play className="mr-2 h-5 w-5" /> Start Hack
        </Button>
      )}
    </div>
  )
}

export default HackingMinigame
