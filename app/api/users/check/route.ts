import { NextResponse } from "next/server"
import { getUserByUsername } from "@/lib/users"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ message: "Username is required" }, { status: 400 })
  }

  try {
    const user = await getUserByUsername(username)
    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error("Error checking username:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
