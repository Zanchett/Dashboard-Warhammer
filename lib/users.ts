import { Redis } from "@upstash/redis"

type User = {
  id: string
  username: string
  password: string
}

// Check if we're in a restricted environment (like v0 preview)
const isRestrictedEnvironment = () => {
  return typeof window !== "undefined" || process.env.NODE_ENV === "development"
}

// In-memory storage for development/preview
let memoryUsers: User[] = []

// Initialize Redis only if not in restricted environment
let redis: Redis | null = null

try {
  if (!isRestrictedEnvironment() && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
} catch (error) {
  console.log("[Redis] Failed to initialize Redis, using memory storage:", error)
  redis = null
}

async function getUsers(): Promise<User[]> {
  try {
    console.log("[getUsers] Starting to retrieve users...")

    // Use memory storage if Redis is not available
    if (!redis) {
      console.log("[getUsers] Using memory storage, current users:", memoryUsers.length)
      return [...memoryUsers]
    }

    console.log("[getUsers] Using Redis storage...")
    const usersString = await redis.get("users")
    console.log("[getUsers] Raw users data from Redis:", usersString)

    if (!usersString) {
      console.log("[getUsers] No users found in Redis, returning empty array")
      return []
    }

    let users: User[]
    if (typeof usersString === "string") {
      try {
        users = JSON.parse(usersString)
      } catch (parseError) {
        console.error("[getUsers] Failed to parse users JSON:", parseError)
        return []
      }
    } else if (Array.isArray(usersString)) {
      users = usersString
    } else {
      console.error("[getUsers] Unexpected data type for users:", typeof usersString)
      return []
    }

    if (!Array.isArray(users)) {
      console.error("[getUsers] Users data is not an array:", users)
      return []
    }

    console.log("[getUsers] Successfully retrieved users:", users.length, "users found")
    return users
  } catch (error) {
    console.error("[getUsers] Error reading users, falling back to memory storage:", error)
    return [...memoryUsers]
  }
}

async function setUsers(users: User[]): Promise<void> {
  try {
    console.log("[setUsers] Starting to save users...")
    console.log("[setUsers] Users to save:", users.length)

    // Always update memory storage
    memoryUsers = [...users]
    console.log("[setUsers] Updated memory storage")

    // Try to update Redis if available
    if (!redis) {
      console.log("[setUsers] Redis not available, using memory storage only")
      return
    }

    console.log("[setUsers] Updating Redis storage...")
    const usersString = JSON.stringify(users)
    const result = await redis.set("users", usersString)
    console.log("[setUsers] Redis set result:", result)
    console.log("[setUsers] Users updated successfully in Redis")
  } catch (error) {
    console.error("[setUsers] Error writing to Redis, using memory storage:", error)
    // Memory storage is already updated above, so this is not a critical error
    console.log("[setUsers] Continuing with memory storage")
  }
}

export async function addUser(username: string, password: string): Promise<User> {
  console.log("[addUser] Adding new user:", username)

  try {
    const users = await getUsers()
    console.log("[addUser] Current users count:", users.length)

    const existingUser = users.find((user) => user.username === username)
    if (existingUser) {
      console.log("[addUser] Username already exists:", username)
      throw new Error("Username already exists")
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
    }

    users.push(newUser)
    console.log("[addUser] New users array length:", users.length)

    await setUsers(users)
    console.log("[addUser] User successfully added:", newUser.id)

    return newUser
  } catch (error) {
    console.error("[addUser] Error adding user:", error)
    throw error
  }
}

export async function findUser(username: string): Promise<User | undefined> {
  console.log("[findUser] Searching for user:", username)
  try {
    const users = await getUsers()
    const user = users.find((user) => user.username === username)
    console.log("[findUser] User found:", user ? "Yes" : "No")
    return user
  } catch (error) {
    console.error("[findUser] Error finding user:", error)
    return undefined
  }
}

export function validatePassword(user: User, password: string): boolean {
  const isValid = user.password === password
  console.log("[validatePassword] Password validation result:", isValid)
  return isValid
}

// Export function to check storage type for debugging
export function getStorageInfo() {
  return {
    usingRedis: redis !== null,
    memoryUsersCount: memoryUsers.length,
    environment: process.env.NODE_ENV,
    hasRedisCredentials: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
  }
}
