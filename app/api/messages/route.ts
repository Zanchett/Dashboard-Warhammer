import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get("conversationId")

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

export async function POST(request: Request) {
  const { conversationId, sender, text, timestamp } = await request.json()

  if (!conversationId || !sender || !text || !timestamp) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
  }

  const message = { sender, text, timestamp }

  try {
    await redis.rpush(`conversation:${conversationId}:messages`, JSON.stringify(message))
    return NextResponse.json({ message: "Message sent successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 })
  }
}
