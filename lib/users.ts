import { Redis } from "@upstash/redis"
import type { User } from "@/types/user"

// Initialize Redis client
let redis: Redis | null = null
let isRedisAvailable = false
let storageType: "redis" | "memory" = "memory"

// In-memory storage for development/fallback
let inMemoryUsers: User[] = []

function initializeRedis() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
      isRedisAvailable = true
      storageType = "redis"
      console.log("[Redis] Redis client initialized successfully.")
    } catch (error) {
      console.error("[Redis] Failed to initialize Redis client:", error)
      isRedisAvailable = false
      storageType = "memory"
    }
  } else {
    console.warn("[Redis] KV_REST_API_URL or KV_REST_API_TOKEN not set. Using in-memory storage.")
    isRedisAvailable = false
    storageType = "memory"
  }
}

initializeRedis()

// Function to test raw Upstash connection
async function testRawUpstashRequest(method: string, path: string, body?: any) {
  const url = `${process.env.KV_REST_API_URL}${path}`
  const token = process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    return { error: "Missing Upstash URL or Token for raw test." }
  }

  try {
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }

    const options: RequestInit = {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    }

    console.log(`[testRawUpstashRequest] Sending ${method} request to: ${url}`)
    const response = await fetch(url, options)
    const rawText = await response.text()

    console.log(`[testRawUpstashRequest] Response status: ${response.status}`)
    console.log(`[testRawUpstashRequest] Response headers: ${JSON.stringify(response.headers.raw())}`)
    console.log(`[testRawUpstashRequest] Raw response text: ${rawText}`)

    try {
      const jsonBody = JSON.parse(rawText)
      return { status: response.status, headers: response.headers.raw(), body: jsonBody, success: response.ok }
    } catch (jsonError: any) {
      console.error(`[testRawUpstashRequest] Failed to parse JSON: ${jsonError.message}`)
      console.error(`[testRawUpstashRequest] Raw text that failed: ${rawText}`)
      return { error: "JSON parse failed", rawText: rawText }
    }
  } catch (error: any) {
    console.error(`[testRawUpstashRequest] Fetch error: ${error.message}`)
    return { error: error.message }
  }
}

export async function getUsers(): Promise<User[]> {
  console.log(`[getUsers] Starting to retrieve users. Storage type: ${storageType}`)

  if (storageType === "memory") {
    console.log("[getUsers] Retrieving users from in-memory storage.")
    return inMemoryUsers
  }

  if (!redis) {
    console.error("[getUsers] Redis client not initialized. Falling back to memory.")
    return inMemoryUsers
  }

  try {
    console.log('[getUsers] Attempting Redis get operation for "users"...')
    const usersJson = await redis.get<string>("users")
    console.log(`[getUsers] Raw data from Redis: ${usersJson ? usersJson.substring(0, 100) + "..." : "null"}`)

    if (usersJson) {
      const users = JSON.parse(usersJson) as User[]
      console.log(`[getUsers] Successfully retrieved ${users.length} users from Redis.`)
      return users
    }
    console.log("[getUsers] No users found in Redis, returning empty array.")
    return []
  } catch (error: any) {
    console.error(`[getUsers] Error reading users from Redis: ${error.message}`)
    console.error(`[getUsers] Error details: ${error.message}`)
    console.error(`[getUsers] Error stack: ${error.stack}`)
    console.log("[getUsers] Returning empty array due to error.")
    return []
  }
}

export async function setUsers(users: User[]): Promise<void> {
  console.log(`[setUsers] Starting to save users. Storage type: ${storageType}`)

  if (storageType === "memory") {
    console.log(`[setUsers] Saving ${users.length} users to in-memory storage.`)
    inMemoryUsers = users
    return
  }

  if (!redis) {
    console.error("[setUsers] Redis client not initialized. Cannot save to Redis.")
    throw new Error("Redis client not initialized.")
  }

  try {
    console.log(`[setUsers] Users to save: ${users.length}`)
    const usersJson = JSON.stringify(users)
    console.log(`[setUsers] Serialized users data length: ${usersJson.length}`)
    await redis.set("users", usersJson)
    console.log("[setUsers] Successfully saved users to Redis.")
  } catch (error: any) {
    console.error(`[setUsers] Error writing users to Redis: ${error.message}`)
    console.error(`[setUsers] Error details: ${error.message}`)
    console.error(`[setUsers] Error stack: ${error.stack}`)
    throw new Error(`Failed to update users: ${error.message}`)
  }
}

export async function addUser(user: User): Promise<boolean> {
  console.log(`[addUser] Adding new user: ${user.username}`)
  try {
    const users = await getUsers()
    console.log(`[addUser] Current users count: ${users.length}`)

    if (users.some((u) => u.username === user.username)) {
      console.warn(`[addUser] User ${user.username} already exists.`)
      return false
    }

    const newUsers = [...users, user]
    console.log(`[addUser] New users array length: ${newUsers.length}`)
    await setUsers(newUsers)
    console.log(`[addUser] User ${user.username} added successfully.`)
    return true
  } catch (error: any) {
    console.error(`[addUser] Error adding user: ${error.message}`)
    throw new Error(`Failed to add user: ${error.message}`)
  }
}

export async function findUser(username: string): Promise<User | undefined> {
  console.log(`[findUser] Searching for user: ${username}`)
  try {
    const users = await getUsers()
    const foundUser = users.find((u) => u.username === username)
    if (foundUser) {
      console.log(`[findUser] User ${username} found.`)
    } else {
      console.log(`[findUser] User ${username} not found.`)
    }
    return foundUser
  } catch (error: any) {
    console.error(`[findUser] Error finding user: ${error.message}`)
    return undefined
  }
}

export async function getAllUsers(): Promise<string[]> {
  console.log("[getAllUsers] Retrieving all usernames.")
  try {
    const users = await getUsers()
    return users.map((user) => user.username)
  } catch (error: any) {
    console.error(`[getAllUsers] Error retrieving all users: ${error.message}`)
    return []
  }
}

export async function getUserData(username: string): Promise<any | null> {
  console.log(`[getUserData] Retrieving data for user: ${username}`)
  try {
    const user = await findUser(username)
    if (user) {
      // For now, return a simplified user object.
      // In a real app, you'd fetch more detailed data from other sources/keys.
      return {
        username: user.username,
        balance: user.balance || 1000, // Default balance
        characterSheet: user.characterSheet || {
          attributes: {
            strength: { rating: 30 },
            agility: { rating: 30 },
            toughness: { rating: 30 },
            intelligence: { rating: 30 },
            willpower: { rating: 30 },
            fellowship: { rating: 30 },
          },
        },
        upgrades: user.upgrades || {},
        techPoints: user.techPoints || 0,
      }
    }
    return null
  } catch (error: any) {
    console.error(`[getUserData] Error fetching user data: ${error.message}`)
    return null
  }
}

export async function updateUserBalance(username: string, newBalance: number): Promise<number> {
  console.log(`[updateUserBalance] Updating balance for ${username} to ${newBalance}`)
  try {
    const users = await getUsers()
    const userIndex = users.findIndex((u) => u.username === username)
    if (userIndex !== -1) {
      users[userIndex].balance = newBalance
      await setUsers(users)
      console.log(`[updateUserBalance] Balance updated for ${username}.`)
      return newBalance
    }
    console.warn(`[updateUserBalance] User ${username} not found.`)
    return -1 // Indicate user not found
  } catch (error: any) {
    console.error(`[updateUserBalance] Error updating balance: ${error.message}`)
    throw new Error(`Failed to update user balance: ${error.message}`)
  }
}

export async function updateUserTechPoints(username: string, pointsToAdd: number): Promise<number> {
  console.log(`[updateUserTechPoints] Updating tech points for ${username} by ${pointsToAdd}`)
  try {
    const users = await getUsers()
    const userIndex = users.findIndex((u) => u.username === username)
    if (userIndex !== -1) {
      users[userIndex].techPoints = (users[userIndex].techPoints || 0) + pointsToAdd
      await setUsers(users)
      console.log(
        `[updateUserTechPoints] Tech points updated for ${username}. New points: ${users[userIndex].techPoints}`,
      )
      return users[userIndex].techPoints!
    }
    console.warn(`[updateUserTechPoints] User ${username} not found.`)
    return -1
  } catch (error: any) {
    console.error(`[updateUserTechPoints] Error updating tech points: ${error.message}`)
    throw new Error(`Failed to update user tech points: ${error.message}`)
  }
}

export async function getUserTechPoints(username: string): Promise<number> {
  console.log(`[getUserTechPoints] Getting tech points for ${username}`)
  try {
    const user = await findUser(username)
    if (user) {
      return user.techPoints || 0
    }
    console.warn(`[getUserTechPoints] User ${username} not found.`)
    return 0
  } catch (error: any) {
    console.error(`[getUserTechPoints] Error getting tech points: ${error.message}`)
    return 0
  }
}

export async function updateUserCharacterSheet(username: string, updatedSheet: any): Promise<void> {
  console.log(`[updateUserCharacterSheet] Updating character sheet for ${username}`)
  try {
    const users = await getUsers()
    const userIndex = users.findIndex((u) => u.username === username)
    if (userIndex !== -1) {
      users[userIndex].characterSheet = updatedSheet
      await setUsers(users)
      console.log(`[updateUserCharacterSheet] Character sheet updated for ${username}.`)
    } else {
      console.warn(`[updateUserCharacterSheet] User ${username} not found.`)
    }
  } catch (error: any) {
    console.error(`[updateUserCharacterSheet] Error updating character sheet: ${error.message}`)
    throw new Error(`Failed to update character sheet: ${error.message}`)
  }
}
