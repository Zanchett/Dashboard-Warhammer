import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function GET() {
  try {
    // Test setting and getting a value
    await redis.set("test_key", "test_value")
    const value = await redis.get("test_key")

    if (value === "test_value") {
      return NextResponse.json({ message: "Database connection successful!", value })
    } else {
      return NextResponse.json({ message: "Database connection failed: Value mismatch.", value }, { status: 500 })
    }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json(
      { message: "Database connection failed.", error: (error as Error).message },
      { status: 500 },
    )
  }
}
