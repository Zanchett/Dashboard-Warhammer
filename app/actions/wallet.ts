"use server"

import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function getWalletBalance(
  username: string,
): Promise<{ success: boolean; balance: number | null; message?: string }> {
  try {
    const balance = await redis.get<number>(`wallet:${username}:balance`)
    return { success: true, balance: balance !== null ? balance : 0 }
  } catch (error) {
    console.error("Error fetching wallet balance:", error)
    return { success: false, balance: null, message: "Failed to fetch wallet balance." }
  }
}

export async function updateWalletBalance(
  username: string,
  newBalance: number,
): Promise<{ success: boolean; balance: number | null; message?: string }> {
  if (newBalance < 0) {
    return { success: false, balance: null, message: "Balance cannot be negative." }
  }
  try {
    await redis.set(`wallet:${username}:balance`, newBalance)
    return { success: true, balance: newBalance }
  } catch (error) {
    console.error("Error updating wallet balance:", error)
    return { success: false, balance: null, message: "Failed to update wallet balance." }
  }
}

export async function addCredits(
  username: string,
  amount: number,
): Promise<{ success: boolean; balance: number | null; message?: string }> {
  if (amount <= 0) {
    return { success: false, balance: null, message: "Amount must be positive." }
  }
  try {
    const currentBalance = (await redis.get<number>(`wallet:${username}:balance`)) || 0
    const newBalance = currentBalance + amount
    await redis.set(`wallet:${username}:balance`, newBalance)
    return { success: true, balance: newBalance }
  } catch (error) {
    console.error("Error adding credits:", error)
    return { success: false, balance: null, message: "Failed to add credits." }
  }
}

export async function deductCredits(
  username: string,
  amount: number,
): Promise<{ success: boolean; balance: number | null; message?: string }> {
  if (amount <= 0) {
    return { success: false, balance: null, message: "Amount must be positive." }
  }
  try {
    const currentBalance = (await redis.get<number>(`wallet:${username}:balance`)) || 0
    if (currentBalance < amount) {
      return { success: false, balance: currentBalance, message: "Insufficient funds." }
    }
    const newBalance = currentBalance - amount
    await redis.set(`wallet:${username}:balance`, newBalance)
    return { success: true, balance: newBalance }
  } catch (error) {
    console.error("Error deducting credits:", error)
    return { success: false, balance: null, message: "Failed to deduct credits." }
  }
}
