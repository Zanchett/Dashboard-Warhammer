import { NextResponse } from "next/server"
import { findUser, validatePassword } from "@/lib/users"

export async function POST(request: Request) {
  try {
    console.log("[SERVER][Login API] Processing login request...")

    const body = await request.json()
    const { username, password } = body

    console.log("[SERVER][Login API] Login attempt for username:", username)

    if (!username || !password) {
      console.log("[SERVER][Login API] Missing username or password")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    console.log("[SERVER][Login API] Searching for user...")
    const user = await findUser(username)

    if (!user) {
      console.log("[SERVER][Login API] User not found")
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    console.log("[SERVER][Login API] User found, validating password...")
    const isValidPassword = validatePassword(user, password)

    if (!isValidPassword) {
      console.log("[SERVER][Login API] Invalid password")
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    console.log("[SERVER][Login API] Login successful for user:", user.id)
    return NextResponse.json({
      message: "Login successful",
      user: { id: user.id, username: user.username },
    })
  } catch (error) {
    console.error("[SERVER][Login API] Login error:", error)
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 })
  }
}
