import { NextResponse } from "next/server"
import { findUser } from "@/lib/users"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ message: "Username is required" }, { status: 400 })
  }

  try {
    const user = await findUser(username)
    if (user) {
      return NextResponse.json({ exists: true }, { status: 200 })
    } else {
      return NextResponse.json({ exists: false }, { status: 200 })
    }
  } catch (error: any) {
    console.error(`Error checking user existence: ${error.message}`)
    return NextResponse.json({ message: "Failed to check user existence" }, { status: 500 })
  }
}
