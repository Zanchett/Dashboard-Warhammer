import { NextResponse } from "next/server"

// In-memory storage for messages in development
const memoryMessages: any[] = []

export async function GET() {
  try {
    console.log("[Messages API] Fetching messages from memory storage...")
    return NextResponse.json(memoryMessages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { message, username } = await request.json()

    if (!message || !username) {
      return NextResponse.json({ error: "Message and username are required" }, { status: 400 })
    }

    const newMessage = {
      id: Date.now().toString(),
      message,
      username,
      timestamp: new Date().toISOString(),
    }

    memoryMessages.push(newMessage)
    console.log("[Messages API] Message added to memory storage:", newMessage.id)

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error saving message:", error)
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}
