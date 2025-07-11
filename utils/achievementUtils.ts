import type { Achievement } from "@/types/achievements"

// In a real application, this would interact with a database
let achievements: Achievement[] = [
  {
    id: "1",
    name: "First Contact",
    description: "Send your first message in the chat.",
    unlocked: false,
    icon: "MessageSquare",
  },
  {
    id: "2",
    name: "Master of Coin",
    description: "Accumulate 1000 Imperial Credits.",
    unlocked: false,
    icon: "Wallet",
  },
  {
    id: "3",
    name: "Data Scavenger",
    description: "Access 5 entries in the Library.",
    unlocked: false,
    icon: "Book",
  },
  {
    id: "4",
    name: "Loyalist",
    description: "Complete your first mission for the Imperium.",
    unlocked: false,
    icon: "ScrollText",
  },
  {
    id: "5",
    name: "Tech-Priest Initiate",
    description: "Perform your first Mechanicus upgrade.",
    unlocked: false,
    icon: "Hammer",
  },
]

export const getAchievements = (): Achievement[] => {
  // Simulate fetching from a database
  return [...achievements]
}

export const unlockAchievement = (id: string): Achievement | null => {
  const achievementIndex = achievements.findIndex((a) => a.id === id)
  if (achievementIndex > -1 && !achievements[achievementIndex].unlocked) {
    achievements[achievementIndex] = {
      ...achievements[achievementIndex],
      unlocked: true,
      unlockedDate: new Date().toISOString(),
    }
    return achievements[achievementIndex]
  }
  return null
}

export const resetAchievements = () => {
  achievements = achievements.map((a) => ({ ...a, unlocked: false, unlockedDate: undefined }))
}
