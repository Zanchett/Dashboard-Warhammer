import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  const { conversationId } = params

  try {
    const messages = (await redis.get(`messages:${conversationId}`)) || []
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { conversationId: string } }) {
  const { conversationId } = params

  try {
    const newMessage = await request.json()
    let messages = (await redis.get(`messages:${conversationId}`)) || []

    messages = Array.isArray(messages) ? messages : []
    messages.push(newMessage)

    await redis.set(`messages:${conversationId}`, messages)

    // Update the conversation's last message and unread count
    const conversations = (await redis.get("conversations")) || []
    const updatedConversations = conversations.map((conv: any) => {
      if (conv.id === conversationId) {
        return { ...conv, lastMessage: newMessage.content, unread: (conv.unread || 0) + 1 }
      }
      return conv
    })
    await redis.set("conversations", updatedConversations)

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error("Failed to send message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
