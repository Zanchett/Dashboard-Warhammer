import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis client
let redis: Redis | null = null
let isRedisAvailable = false
let storageType: "redis" | "memory" = "memory"

// In-memory storage for development/fallback
let inMemoryConversations: any[] = [] // Store conversations in memory

function initializeRedis() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
      isRedisAvailable = true
      storageType = "redis"
      console.log("[Redis] Conversations Redis client initialized successfully.")
    } catch (error) {
      console.error("[Redis] Failed to initialize Conversations Redis client:", error)
      isRedisAvailable = false
      storageType = "memory"
    }
  } else {
    console.warn("[Redis] KV_REST_API_URL or KV_REST_API_TOKEN not set for conversations. Using in-memory storage.")
    isRedisAvailable = false
    storageType = "memory"
  }
}

initializeRedis()

async function getConversationsFromStore(): Promise<any[]> {
  if (storageType === "memory") {
    return inMemoryConversations
  }
  if (!redis) return []
  try {
    const conversationsJson = await redis.get<string>("conversations")
    return conversationsJson ? JSON.parse(conversationsJson) : []
  } catch (error) {
    console.error("Error reading conversations from Redis:", error)
    return []
  }
}

async function setConversationsInStore(conversations: any[]): Promise<void> {
  if (storageType === "memory") {
    inMemoryConversations = conversations
    return
  }
  if (!redis) return
  try {
    await redis.set("conversations", JSON.stringify(conversations))
  } catch (error) {
    console.error("Error writing conversations to Redis:", error)
  }
}

export async function GET() {
  try {
    const conversations = await getConversationsFromStore()
    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error in GET /api/conversations:", error)
    return NextResponse.json({ message: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { participant1, participant2 } = await request.json()
    const newConversation = { id: Date.now().toString(), participant1, participant2, messages: [] }
    const conversations = await getConversationsFromStore()
    conversations.push(newConversation)
    await setConversationsInStore(conversations)
    return NextResponse.json(newConversation, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/conversations:", error)
    return NextResponse.json({ message: "Failed to create conversation" }, { status: 500 })
  }
}
