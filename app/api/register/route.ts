import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { createUser, getUserByUsername } from "@/lib/users"

export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
  }

  const existingUser = await getUserByUsername(username)
  if (existingUser) {
    return NextResponse.json({ message: "Username already exists" }, { status: 409 })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    await createUser(username, hashedPassword)
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
