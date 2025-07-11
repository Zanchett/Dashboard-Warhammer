import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import type { Mission } from "@/types/missions"

const redis = Redis.fromEnv()

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const mission = await redis.hgetall(`mission:${id}`)
    if (mission) {
      return NextResponse.json(mission)
    } else {
      return NextResponse.json({ message: "Mission not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching mission:", error)
    return NextResponse.json({ message: "Failed to fetch mission" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { status } = await request.json()

  if (!status || (status !== "active" && status !== "completed")) {
    return NextResponse.json({ message: "Invalid status provided" }, { status: 400 })
  }

  try {
    const mission = await redis.hgetall(`mission:${id}`)
    if (!mission) {
      return NextResponse.json({ message: "Mission not found" }, { status: 404 })
    }

    const updatedMission: Mission = { ...(mission as Mission), status }
    await redis.hset(`mission:${id}`, updatedMission)
    return NextResponse.json(updatedMission)
  } catch (error) {
    console.error("Error updating mission:", error)
    return NextResponse.json({ message: "Failed to update mission" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const deletedCount = await redis.del(`mission:${id}`)
    if (deletedCount > 0) {
      await redis.lrem("missions:all_ids", 0, id) // Remove from the list of all mission IDs
      return NextResponse.json({ message: "Mission deleted successfully" })
    } else {
      return NextResponse.json({ message: "Mission not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting mission:", error)
    return NextResponse.json({ message: "Failed to delete mission" }, { status: 500 })
  }
}
