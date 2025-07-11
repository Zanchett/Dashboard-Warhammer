import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export async function GET() {
  try {
    const items = ((await redis.get("market_items")) as any[]) || []
    return NextResponse.json(items.filter((item) => item.isShown))
  } catch (error) {
    console.error("Error fetching market items:", error)
    return NextResponse.json({ error: "Failed to fetch market items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json()
    const items = ((await redis.get("market_items")) as any[]) || []
    newItem.id = Date.now().toString()
    items.push(newItem)
    await redis.set("market_items", items)
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Error adding market item:", error)
    return NextResponse.json({ error: "Failed to add market item" }, { status: 500 })
  }
}
