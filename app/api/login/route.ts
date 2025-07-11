import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { getUserByUsername } from "@/lib/users"

export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
  }

  const user = await getUserByUsername(username)
  if (!user) {
    return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)
  if (!isPasswordValid) {
    return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
  }

  // In a real application, you would set a session cookie or JWT here
  return NextResponse.json({ message: "Login successful", user: { id: user.id, username: user.username } })
}
