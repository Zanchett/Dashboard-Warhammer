import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

interface Conversation {
  id: string
  name: string
  lastMessage: string
  lastMessageTime: string
}

// Seed some initial conversations if none exist
async function seedConversations() {
  const count = await redis.llen("conversations:all_ids")
  if (count === 0) {
    const initialConversations: Conversation[] = [
      { id: "conv1", name: "Tech-Priest Dominus", lastMessage: "Data transfer complete.", lastMessageTime: "14:30" },
      { id: "conv2", name: "Commissar Yarrick", lastMessage: "Enemy forces engaged.", lastMessageTime: "Yesterday" },
      { id: "conv3", name: "Lord Inquisitor", lastMessage: "Report on xenos activity.", lastMessageTime: "2 days ago" },
    ]

    const pipeline = redis.pipeline()
    for (const conv of initialConversations) {
      pipeline.hset(`conversation:${conv.id}:meta`, conv)
      pipeline.rpush("conversations:all_ids", conv.id)
    }
    await pipeline.exec()
    console.log("Conversations seeded.")
  }
}

seedConversations()

export async function GET() {
  try {
    const conversationIds = await redis.lrange("conversations:all_ids", 0, -1)
    const pipeline = redis.pipeline()
    for (const id of conversationIds) {
      pipeline.hgetall(`conversation:${id}:meta`)
    }
    const results = await pipeline.exec()
    const conversations: Conversation[] = results.map((res) => res.result as Conversation)
    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ message: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { name } = await request.json()
  if (!name) {
    return NextResponse.json({ message: "Conversation name is required" }, { status: 400 })
  }

  const newId = `conv:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`
  const newConversation: Conversation = {
    id: newId,
    name,
    lastMessage: "No messages yet.",
    lastMessageTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }

  try {
    await redis.hset(`conversation:${newId}:meta`, newConversation)
    await redis.rpush("conversations:all_ids", newId)
    return NextResponse.json(newConversation, { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ message: "Failed to create conversation" }, { status: 500 })
  }
}
