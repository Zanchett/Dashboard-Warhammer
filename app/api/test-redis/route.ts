import { NextResponse } from "next/server"
import { getStorageInfo } from "@/lib/users"

export async function GET() {
  try {
    console.log("[Test Redis] Getting storage information...")

    const storageInfo = getStorageInfo()
    console.log("[Test Redis] Storage info:", storageInfo)

    return NextResponse.json({
      success: true,
      message: "Storage information retrieved",
      storage: storageInfo,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasRedisUrl: !!process.env.KV_REST_API_URL,
        hasRedisToken: !!process.env.KV_REST_API_TOKEN,
      },
    })
  } catch (error) {
    console.error("[Test Redis] Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: {
          type: error instanceof Error ? error.constructor.name : typeof error,
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
