"use server"

import { Redis } from "@upstash/redis"
import { findUser } from "@/lib/users"
import { getBalance, updateBalance } from "./wallet"
import type { CharacterSheet } from "@/types/character-sheet"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export async function getAllUsers(): Promise<string[]> {
  try {
    const users = (await redis.get("users")) as any[]
    return users.map((user) => user.username)
  } catch (error) {
    console.error("Error fetching all users:", error)
    return []
  }
}

export async function getUserData(username: string): Promise<any> {
  try {
    const user = await findUser(username)
    if (!user) {
      throw new Error("User not found")
    }
    const balance = await getBalance(username)
    const characterSheet = (await redis.get(`character-sheet:${username}`)) as CharacterSheet | null
    const upgrades = (await redis.get(`upgrades:${username}`)) || {}
    return { user, balance, characterSheet, upgrades }
  } catch (error) {
    console.error("Error fetching user data:", error)
    throw error
  }
}

export async function updateUserBalance(username: string, newBalance: number): Promise<number> {
  try {
    return await updateBalance(username, newBalance)
  } catch (error) {
    console.error("Error updating user balance:", error)
    throw error
  }
}

export async function updateUserCharacterSheet(username: string, characterSheet: CharacterSheet): Promise<void> {
  try {
    await redis.set(`character-sheet:${username}`, characterSheet)
  } catch (error) {
    console.error("Error updating user character sheet:", error)
    throw error
  }
}

export interface Upgrade {
  name: string
  attributes: { [key: string]: number }
  techPointCost: number
}

export interface UserUpgrades {
  [category: string]: Upgrade[]
}

export async function addUpgradeCategory(category: string): Promise<void> {
  try {
    const categories = ((await redis.get("upgrade-categories")) as string[]) || []
    if (!categories.includes(category)) {
      categories.push(category)
      await redis.set("upgrade-categories", categories)
    }
  } catch (error) {
    console.error("Error adding upgrade category:", error)
    throw error
  }
}

export async function getUpgradeCategories(): Promise<string[]> {
  try {
    return ((await redis.get("upgrade-categories")) as string[]) || []
  } catch (error) {
    console.error("Error fetching upgrade categories:", error)
    throw error
  }
}

export async function addUpgrade(category: string, upgrade: Upgrade): Promise<void> {
  try {
    const upgrades = ((await redis.get(`upgrades:${category}`)) as Upgrade[]) || []
    upgrades.push(upgrade)
    await redis.set(`upgrades:${category}`, upgrades)
  } catch (error) {
    console.error("Error adding upgrade:", error)
    throw error
  }
}

export async function getUpgrades(category: string): Promise<Upgrade[]> {
  try {
    return ((await redis.get(`upgrades:${category}`)) as Upgrade[]) || []
  } catch (error) {
    console.error("Error fetching upgrades:", error)
    throw error
  }
}

export async function assignUpgradeToUser(username: string, category: string, upgradeName: string): Promise<boolean> {
  try {
    const userUpgrades = await getUserUpgrades(username)
    const categoryUpgrades = await getUpgrades(category)
    const upgrade = categoryUpgrades.find((u) => u.name === upgradeName)

    if (!upgrade) {
      throw new Error("Upgrade not found")
    }

    const userTechPoints = await getUserTechPoints(username)

    if (userTechPoints < upgrade.techPointCost) {
      return false // Not enough tech points
    }

    if (!userUpgrades[category]) {
      userUpgrades[category] = []
    }
    userUpgrades[category].push(upgrade)

    await redis.set(`upgrades:${username}`, userUpgrades)
    await updateUserTechPoints(username, -upgrade.techPointCost)

    return true
  } catch (error) {
    console.error("Error assigning upgrade to user:", error)
    throw error
  }
}

export async function getUserUpgrades(username: string): Promise<UserUpgrades> {
  try {
    return ((await redis.get(`upgrades:${username}`)) as UserUpgrades) || {}
  } catch (error) {
    console.error("Error fetching user upgrades:", error)
    throw error
  }
}

export async function getUserTechPoints(username: string): Promise<number> {
  try {
    const techPoints = (await redis.get(`user:${username}:techpoints`)) as number
    return techPoints || 0
  } catch (error) {
    console.error("Error fetching user tech points:", error)
    throw error
  }
}

export async function updateUserTechPoints(username: string, amount: number): Promise<number> {
  try {
    const currentPoints = await getUserTechPoints(username)
    const newPoints = Math.max(currentPoints + amount, 0) // Ensure points don't go below 0
    await redis.set(`user:${username}:techpoints`, newPoints)
    return newPoints
  } catch (error) {
    console.error("Error updating user tech points:", error)
    throw error
  }
}

export async function removeUpgradeFromUser(
  username: string,
  category: string,
  upgradeName: string,
): Promise<{ success: boolean; message?: string }> {
  console.log(`Attempting to remove upgrade: ${upgradeName} from category: ${category} for user: ${username}`)
  try {
    const userUpgrades = await getUserUpgrades(username)
    console.log("User upgrades:", userUpgrades)

    if (!userUpgrades[category]) {
      console.log(`Category ${category} doesn't exist for user ${username}`)
      return { success: false, message: "Category doesn't exist for this user" }
    }

    const upgradeIndex = userUpgrades[category].findIndex((u) => u.name === upgradeName)
    if (upgradeIndex === -1) {
      console.log(`Upgrade ${upgradeName} not found in category ${category} for user ${username}`)
      return { success: false, message: "Upgrade not found" }
    }

    const removedUpgrade = userUpgrades[category].splice(upgradeIndex, 1)[0]
    console.log("Removed upgrade:", removedUpgrade)

    await redis.set(`upgrades:${username}`, userUpgrades)
    console.log("Updated user upgrades in Redis")

    // Refund tech points
    const refundedPoints = await updateUserTechPoints(username, removedUpgrade.techPointCost)
    console.log(`Refunded ${removedUpgrade.techPointCost} tech points. New balance: ${refundedPoints}`)

    return { success: true, message: "Upgrade removed successfully" }
  } catch (error) {
    console.error("Error removing upgrade from user:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred while removing the upgrade",
    }
  }
}

export async function editUpgrade(category: string, upgradeName: string, newUpgrade: Upgrade): Promise<boolean> {
  try {
    const upgrades = await getUpgrades(category)
    const upgradeIndex = upgrades.findIndex((u) => u.name === upgradeName)
    if (upgradeIndex === -1) {
      return false // Upgrade not found
    }
    upgrades[upgradeIndex] = newUpgrade
    await redis.set(`upgrades:${category}`, upgrades)
    return true
  } catch (error) {
    console.error("Error editing upgrade:", error)
    throw error
  }
}

export async function cleanUpgradesDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Attempting to clean upgrades database")

    // Delete all upgrade categories
    await redis.del("upgrade-categories")

    // Get all users
    const users = await getAllUsers()

    // Delete upgrades for each user
    for (const username of users) {
      await redis.del(`upgrades:${username}`)
    }

    // Delete all category upgrades
    const categories = await getUpgradeCategories()
    for (const category of categories) {
      await redis.del(`upgrades:${category}`)
    }

    console.log("Upgrades database cleaned successfully")
    return { success: true, message: "Upgrades database cleaned successfully" }
  } catch (error) {
    console.error("Error cleaning upgrades database:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred while cleaning the upgrades database",
    }
  }
}
