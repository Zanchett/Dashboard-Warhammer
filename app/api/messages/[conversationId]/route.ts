import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis client
let redis: Redis | null = null
let isRedisAvailable = false
let storageType: "redis" | "memory" = "memory"

// In-memory storage for development/fallback
const inMemoryMessages: any[] = [] // Store messages in memory

function initializeRedis() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
      isRedisAvailable = true
      storageType = "redis"
      console.log("[Redis] Messages by Conversation Redis client initialized successfully.")
    } catch (error) {
      console.error("[Redis] Failed to initialize Messages by Conversation Redis client:", error)
      isRedisAvailable = false
      storageType = "memory"
    }
  } else {
    console.warn(
      "[Redis] KV_REST_API_URL or KV_REST_API_TOKEN not set for messages by conversation. Using in-memory storage.",
    )
    isRedisAvailable = false
    storageType = "memory"
  }
}

initializeRedis()

async function getMessagesFromStore(): Promise<any[]> {
  if (storageType === "memory") {
    return inMemoryMessages
  }
  if (!redis) return []
  try {
    const messagesJson = await redis.get<string>("messages")
    return messagesJson ? JSON.parse(messagesJson) : []
  } catch (error) {
    console.error("Error reading messages from Redis:", error)
    return []
  }
}

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  try {
    const { conversationId } = params
    const allMessages = await getMessagesFromStore()
    const conversationMessages = allMessages.filter((msg) => msg.conversationId === conversationId)
    return NextResponse.json(conversationMessages)
  } catch (error) {
    console.error("Error in GET /api/messages/[conversationId]:", error)
    return NextResponse.json({ message: "Failed to fetch messages for conversation" }, { status: 500 })
  }
}
