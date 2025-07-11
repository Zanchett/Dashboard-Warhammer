import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  const { conversationId } = params

  if (!conversationId) {
    return NextResponse.json({ message: "Conversation ID is required" }, { status: 400 })
  }

  try {
    const messages = await redis.lrange(`conversation:${conversationId}:messages`, 0, -1)
    return NextResponse.json(messages.map((msg) => JSON.parse(msg as string)))
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ message: "Failed to fetch messages" }, { status: 500 })
  }
}
