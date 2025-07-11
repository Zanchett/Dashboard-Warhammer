import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export async function GET(request: Request, { params }: { params: { username: string } }) {
  try {
    const { username } = params
    const balance = ((await redis.get(`wallet:${username}:balance`)) as number) || 0
    return NextResponse.json({ balance })
  } catch (error) {
    console.error("Error fetching user balance:", error)
    return NextResponse.json({ error: "Failed to fetch user balance" }, { status: 500 })
  }
}
