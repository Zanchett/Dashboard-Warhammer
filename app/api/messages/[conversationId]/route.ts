import { NextResponse } from "next/server"

// In-memory storage for conversation messages in development
const memoryConversationMessages: { [key: string]: any[] } = {}

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  try {
    const { conversationId } = params
    const messages = memoryConversationMessages[conversationId] || []
    console.log(`[Conversation Messages API] Fetching ${messages.length} messages for conversation:`, conversationId)
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching conversation messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { conversationId: string } }) {
  try {
    const { conversationId } = params
    const { message, username } = await request.json()

    if (!message || !username) {
      return NextResponse.json({ error: "Message and username are required" }, { status: 400 })
    }

    if (!memoryConversationMessages[conversationId]) {
      memoryConversationMessages[conversationId] = []
    }

    const newMessage = {
      id: Date.now().toString(),
      message,
      username,
      timestamp: new Date().toISOString(),
      conversationId,
    }

    memoryConversationMessages[conversationId].push(newMessage)
    console.log("[Conversation Messages API] Message added to memory storage:", newMessage.id)

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error saving conversation message:", error)
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}
