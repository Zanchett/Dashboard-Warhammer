import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const items = ((await redis.get("market_items")) as any[]) || []
    const itemIndex = items.findIndex((i) => i.id === id)

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    items[itemIndex].isShown = !items[itemIndex].isShown
    await redis.set("market_items", items)

    return NextResponse.json({ message: "Item visibility toggled successfully" })
  } catch (error) {
    console.error("Error toggling item visibility:", error)
    return NextResponse.json({ error: "Failed to toggle item visibility" }, { status: 500 })
  }
}
