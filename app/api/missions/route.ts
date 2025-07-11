import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import type { Mission } from "@/types/missions"

const redis = Redis.fromEnv()

// Seed some initial missions if none exist
async function seedMissions() {
  const count = await redis.llen("missions:all_ids")
  if (count === 0) {
    const initialMissions: Mission[] = [
      {
        id: "m1",
        title: "Purge the Heretics",
        description: "Eliminate the Chaos cultists infesting Sector 7G.",
        rewardCredits: 500,
        status: "active",
      },
      {
        id: "m2",
        title: "Recover Archeotech",
        description: "Retrieve ancient technology from a derelict space hulk.",
        rewardCredits: 750,
        status: "active",
      },
      {
        id: "m3",
        title: "Investigate Xenos Incursion",
        description: "Determine the nature and scale of the alien presence on Kepler-186f.",
        rewardCredits: 1000,
        status: "active",
      },
    ]

    const pipeline = redis.pipeline()
    for (const mission of initialMissions) {
      pipeline.hset(`mission:${mission.id}`, mission)
      pipeline.rpush("missions:all_ids", mission.id)
    }
    await pipeline.exec()
    console.log("Missions seeded.")
  }
}

seedMissions()

export async function GET() {
  try {
    const missionIds = await redis.lrange("missions:all_ids", 0, -1)
    const pipeline = redis.pipeline()
    for (const id of missionIds) {
      pipeline.hgetall(`mission:${id}`)
    }
    const results = await pipeline.exec()
    const missions: Mission[] = results.map((res) => res.result as Mission)
    return NextResponse.json(missions)
  } catch (error) {
    console.error("Error fetching missions:", error)
    return NextResponse.json({ message: "Failed to fetch missions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { title, description, rewardCredits } = await request.json()
  if (!title || !description || rewardCredits === undefined) {
    return NextResponse.json({ message: "Missing required mission fields" }, { status: 400 })
  }

  const newId = `m:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`
  const newMission: Mission = {
    id: newId,
    title,
    description,
    rewardCredits,
    status: "active",
  }

  try {
    await redis.hset(`mission:${newId}`, newMission)
    await redis.rpush("missions:all_ids", newId)
    return NextResponse.json(newMission, { status: 201 })
  } catch (error) {
    console.error("Error creating mission:", error)
    return NextResponse.json({ message: "Failed to create mission" }, { status: 500 })
  }
}
