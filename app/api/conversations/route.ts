import { NextResponse } from "next/server"

// In-memory storage for conversations in development
const memoryConversations: any[] = []

export async function GET() {
  try {
    console.log("[Conversations API] Fetching conversations from memory storage...")
    return NextResponse.json(memoryConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, participants } = await request.json()

    if (!name || !participants) {
      return NextResponse.json({ error: "Name and participants are required" }, { status: 400 })
    }

    const newConversation = {
      id: Date.now().toString(),
      name,
      participants,
      createdAt: new Date().toISOString(),
    }

    memoryConversations.push(newConversation)
    console.log("[Conversations API] Conversation added to memory storage:", newConversation.id)

    return NextResponse.json(newConversation)
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
