import { Redis } from "@upstash/redis"
import bcrypt from "bcrypt"

type User = {
  id: string
  username: string
  hashedPassword: string
}

const redis = Redis.fromEnv()

// In a real application, you'd use a more robust ID generation
const generateUserId = () => `user:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`

async function ensureRedisConnection(maxRetries = 5, retryDelay = 1000): Promise<void> {
  let retries = 0
  while (retries < maxRetries) {
    try {
      await redis.ping()
      console.log("[Upstash Redis] Connection established successfully.")
      return
    } catch (error) {
      console.error(`[Upstash Redis] Connection attempt ${retries + 1} failed:`, error)
      retries++
      if (retries >= maxRetries) {
        throw new Error("Failed to connect to Redis after multiple attempts")
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
    }
  }
}

// Check if Redis is properly configured
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.error("[Upstash Redis] Missing URL or token in environment variables.")
}

async function getUsers(): Promise<User[]> {
  try {
    await ensureRedisConnection()

    const usernames = await redis.smembers("users:all")
    const users: User[] = []
    for (const username of usernames) {
      const user = await redis.hgetall(`user:${username}`)
      if (user) {
        users.push(user as User)
      }
    }

    console.log("Retrieved users:", users)
    return users
  } catch (error) {
    console.error("Error reading users:", error)
    return []
  }
}

async function setUsers(users: User[]): Promise<void> {
  try {
    await ensureRedisConnection()

    for (const user of users) {
      await redis.hset(`user:${user.username}`, user)
      await redis.sadd("users:all", user.username)
    }
    console.log("Users updated successfully.")
  } catch (error) {
    console.error("Error writing users:", error)
    throw new Error("Failed to update users")
  }
}

export async function createUser(username: string, password: string): Promise<User> {
  console.log("Creating new user:", username)
  const users = await getUsers()
  const existingUser = users.find((user) => user.username === username)
  if (existingUser) {
    throw new Error("Username already exists")
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser: User = { id: generateUserId(), username, hashedPassword }
  users.push(newUser)
  await setUsers(users)
  return newUser
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const user = await redis.hgetall(`user:${username}`)
  return user ? (user as User) : null
}

export async function getUserById(id: string): Promise<User | null> {
  // This would require storing user IDs mapping to usernames or direct user objects
  // For simplicity, assuming username is the primary key for now in redis.hgetall
  // If you need to look up by ID, you'd need a separate index or store user objects by ID
  // For now, this function is a placeholder or would require a different Redis structure
  const allUsernames = await redis.smembers("users:all")
  for (const username of allUsernames) {
    const user = await redis.hgetall(`user:${username}`)
    if (user && user.id === id) {
      return user as User
    }
  }
  return null
}

export async function getAllUsers(): Promise<User[]> {
  const usernames = await redis.smembers("users:all")
  const users: User[] = []
  for (const username of usernames) {
    const user = await redis.hgetall(`user:${username}`)
    if (user) {
      users.push(user as User)
    }
  }
  return users
}

export async function deleteUserByUsername(username: string): Promise<boolean> {
  const userExists = await redis.exists(`user:${username}`)
  if (!userExists) {
    return false
  }
  await redis.del(`user:${username}`)
  await redis.srem("users:all", username)
  return true
}

export async function findUser(username: string): Promise<User | undefined> {
  console.log("Searching for user:", username)
  try {
    const user = await getUserByUsername(username)
    console.log("User found:", user)
    return user
  } catch (error) {
    console.error("Error finding user:", error)
    return undefined
  }
}

export async function validatePassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.hashedPassword)
}
