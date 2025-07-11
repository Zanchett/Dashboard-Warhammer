import { NextResponse } from "next/server"
import { addUser, findUser } from "@/lib/users"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  console.log("[SERVER][Register API] Processing registration request...")
  try {
    const { username, password } = await request.json()
    console.log(`[SERVER][Register API] Registration attempt for username: ${username}`)
    console.log(`[SERVER][Register API] Request body keys: ${Object.keys({ username, password })}`)

    if (!username || !password) {
      console.warn("[SERVER][Register API] Missing username or password.")
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      console.warn("[SERVER][Register API] Password too short")
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 })
    }

    console.log("[SERVER][Register API] Attempting to add user to database...")
    const existingUser = await findUser(username)
    if (existingUser) {
      console.warn(`[SERVER][Register API] User ${username} already exists.`)
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const success = await addUser({ username, password: hashedPassword })

    if (success) {
      console.log(`[SERVER][Register API] User ${username} registered successfully.`)
      return NextResponse.json({ message: "Registration successful" }, { status: 201 })
    } else {
      console.error("[SERVER][Register API] Failed to add user for unknown reason.")
      return NextResponse.json({ message: "Registration failed" }, { status: 500 })
    }
  } catch (error: any) {
    console.error(`[SERVER][Register API] Registration error: ${error.message}`)
    console.error(`[SERVER][Register API] Error message: ${error.message}`)
    console.error(`[SERVER][Register API] Error stack: ${error.stack}`)
    return NextResponse.json({ message: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
