"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"
import "../styles/mechanicus-upgrades.css"

interface Upgrade {
  id: string
  name: string
  description: string
  cost: number
  effect: string
  level: number
  maxLevel: number
  baseCost: number
}

const initialUpgrades: Upgrade[] = [
  {
    id: "1",
    name: "Augmented Cogitator",
    description: "Enhances data processing capabilities.",
    cost: 100,
    effect: "+10% data analysis speed",
    level: 0,
    maxLevel: 3,
    baseCost: 100,
  },
  {
    id: "2",
    name: "Reinforced Plating",
    description: "Increases structural integrity.",
    cost: 150,
    effect: "+5% damage resistance",
    level: 0,
    maxLevel: 5,
    baseCost: 150,
  },
  {
    id: "3",
    name: "Plasma Conduit Optimization",
    description: "Improves energy transfer efficiency.",
    cost: 200,
    effect: "+15% energy output",
    level: 0,
    maxLevel: 2,
    baseCost: 200,
  },
]

export default function MechanicusUpgrades() {
  const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgrades)
  const [credits, setCredits] = useState(1000) // Placeholder for user's credits
  const { toast } = useToast()

  const handleUpgrade = (upgradeId: string) => {
    setUpgrades((prevUpgrades) => {
      const updatedUpgrades = prevUpgrades.map((upgrade) => {
        if (upgrade.id === upgradeId) {
          if (upgrade.level < upgrade.maxLevel) {
            if (credits >= upgrade.cost) {
              setCredits((prevCredits) => prevCredits - upgrade.cost)
              const newLevel = upgrade.level + 1
              const newCost = upgrade.baseCost * (newLevel + 1) // Cost increases with level
              toast({
                title: "Upgrade Successful",
                description: `${upgrade.name} upgraded to Level ${newLevel}!`,
              })
              return { ...upgrade, level: newLevel, cost: newCost }
            } else {
              toast({
                title: "Insufficient Funds",
                description: `You need ${upgrade.cost - credits} more credits for this upgrade.`,
                variant: "destructive",
              })
            }
          } else {
            toast({
              title: "Max Level Reached",
              description: `${upgrade.name} is already at maximum level.`,
            })
          }
        }
        return upgrade
      })
      return updatedUpgrades
    })
  }

  return (
    <div className="mechanicus-upgrades-container panel-cyberpunk">
      <h2 className="text-neon text-2xl mb-6 text-center">Mechanicus Upgrades</h2>

      <div className="mb-6 text-center">
        <p className="text-xl">
          Available Credits: <span className="text-neon font-bold">{credits} ℣</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upgrades.map((upgrade) => (
          <Card key={upgrade.id} className="upgrade-card panel-cyberpunk">
            <CardHeader>
              <CardTitle className="text-neon text-xl flex items-center">
                <Icons.hammer className="mr-2 h-5 w-5" /> {upgrade.name} (Lvl {upgrade.level}/{upgrade.maxLevel})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{upgrade.description}</p>
              <p className="text-base">
                Effect: <span className="text-neon">{upgrade.effect}</span>
              </p>
              <Progress value={(upgrade.level / upgrade.maxLevel) * 100} className="w-full" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-neon">{upgrade.cost} ℣</span>
                <Button
                  onClick={() => handleUpgrade(upgrade.id)}
                  disabled={upgrade.level === upgrade.maxLevel || credits < upgrade.cost}
                  className="btn-cyberpunk"
                >
                  {upgrade.level === upgrade.maxLevel ? "Max Level" : "Upgrade"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
