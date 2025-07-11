import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis client
let redis: Redis | null = null
let isRedisAvailable = false
let storageType: "redis" | "memory" = "memory"

// In-memory storage for development/fallback
let inMemoryMessages: any[] = [] // Store messages in memory

function initializeRedis() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
      isRedisAvailable = true
      storageType = "redis"
      console.log("[Redis] Messages Redis client initialized successfully.")
    } catch (error) {
      console.error("[Redis] Failed to initialize Messages Redis client:", error)
      isRedisAvailable = false
      storageType = "memory"
    }
  } else {
    console.warn("[Redis] KV_REST_API_URL or KV_REST_API_TOKEN not set for messages. Using in-memory storage.")
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

async function setMessagesInStore(messages: any[]): Promise<void> {
  if (storageType === "memory") {
    inMemoryMessages = messages
    return
  }
  if (!redis) return
  try {
    await redis.set("messages", JSON.stringify(messages))
  } catch (error) {
    console.error("Error writing messages to Redis:", error)
  }
}

export async function GET() {
  try {
    const messages = await getMessagesFromStore()
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error in GET /api/messages:", error)
    return NextResponse.json({ message: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { sender, content, timestamp, conversationId } = await request.json()
    const newMessage = { id: Date.now().toString(), sender, content, timestamp, conversationId }
    const messages = await getMessagesFromStore()
    messages.push(newMessage)
    await setMessagesInStore(messages)
    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/messages:", error)
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 })
  }
}
