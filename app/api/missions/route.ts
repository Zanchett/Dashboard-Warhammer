import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import type { Mission } from "@/types/missions"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export async function GET() {
  try {
    const missions = ((await redis.get("missions")) as Mission[]) || []
    return NextResponse.json(missions)
  } catch (error) {
    console.error("Error fetching missions:", error)
    return NextResponse.json({ error: "Failed to fetch missions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newMission = await request.json()
    const missions = ((await redis.get("missions")) as Mission[]) || []

    const missionWithId: Mission = {
      ...newMission,
      id: Date.now().toString(),
      hexCode: `0x${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase()}`,
    }

    missions.push(missionWithId)
    await redis.set("missions", missions)

    return NextResponse.json(missionWithId, { status: 201 })
  } catch (error) {
    console.error("Error creating mission:", error)
    return NextResponse.json({ error: "Failed to create mission" }, { status: 500 })
  }
}
