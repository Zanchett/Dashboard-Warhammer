"use client"

import { useState, useEffect } from "react"
import { Icons } from "./icons"
import "../styles/puritySeal.css"
import { getAchievements } from "@/utils/achievementUtils"
import type { Achievement } from "@/types/achievements"

export default function PuritySealDisplay() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    const allAchievements = getAchievements()
    setUnlockedAchievements(allAchievements.filter((a) => a.unlocked))
  }, [])

  if (unlockedAchievements.length === 0) {
    return (
      <div className="purity-seal-display panel-cyberpunk text-center text-muted-foreground">
        No Purity Seals earned yet. Serve the Emperor!
      </div>
    )
  }

  return (
    <div className="purity-seal-display panel-cyberpunk">
      <h3 className="text-neon text-xl mb-4 text-center">Purity Seals Earned</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {unlockedAchievements.map((achievement) => {
          const IconComponent = Icons[achievement.icon as keyof typeof Icons]
          return (
            <div key={achievement.id} className="purity-seal-item">
              {IconComponent && <IconComponent className="purity-seal-icon" size={32} />}
              <div className="purity-seal-info">
                <h4 className="purity-seal-name">{achievement.name}</h4>
                <p className="purity-seal-description">{achievement.description}</p>
                {achievement.unlockedDate && (
                  <p className="purity-seal-date">
                    Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
