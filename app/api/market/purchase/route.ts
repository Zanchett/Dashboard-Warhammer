import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export async function POST(request: Request) {
  try {
    const { username, itemId } = await request.json()
    const items = ((await redis.get("market_items")) as any[]) || []
    const item = items.find((i) => i.id === itemId)

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    const userBalance = ((await redis.get(`wallet:${username}:balance`)) as number) || 0

    if (userBalance < item.price) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
    }

    // Update user balance
    await redis.set(`wallet:${username}:balance`, userBalance - item.price)

    // Add item to user's equipment
    const userEquipment = ((await redis.get(`character:${username}:equipment`)) as any[]) || []
    userEquipment.push(item)
    await redis.set(`character:${username}:equipment`, userEquipment)

    return NextResponse.json({ message: "Purchase successful" })
  } catch (error) {
    console.error("Error processing purchase:", error)
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 })
  }
}
