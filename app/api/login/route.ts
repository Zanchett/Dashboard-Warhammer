import { NextResponse } from "next/server"
import { findUser } from "@/lib/users"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  console.log("[SERVER][Login API] Processing login request...")
  try {
    const { username, password } = await request.json()
    console.log(`[SERVER][Login API] Login attempt for username: ${username}`)

    if (!username || !password) {
      console.warn("[SERVER][Login API] Missing username or password.")
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    console.log(`[SERVER][Login API] Attempting to find user: ${username}`)
    const user = await findUser(username)

    if (!user) {
      console.warn(`[SERVER][Login API] User ${username} not found.`)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    console.log(`[SERVER][Login API] User ${username} found. Comparing passwords...`)
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (isPasswordValid) {
      console.log(`[SERVER][Login API] User ${username} logged in successfully.`)
      // In a real application, you would issue a session token or JWT here.
      return NextResponse.json({ message: "Login successful", username: user.username }, { status: 200 })
    } else {
      console.warn(`[SERVER][Login API] Invalid password for user: ${username}`)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error: any) {
    console.error(`[SERVER][Login API] Login error: ${error.message}`)
    console.error(`[SERVER][Login API] Error message: ${error.message}`)
    console.error(`[SERVER][Login API] Error stack: ${error.stack}`)
    return NextResponse.json({ message: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
