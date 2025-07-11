import { NextResponse } from "next/server"
import { addUser } from "@/lib/users"

export async function POST(request: Request) {
  try {
    console.log("[SERVER][Register API] Processing registration request...")

    const body = await request.json()
    const { username, password } = body

    console.log("[SERVER][Register API] Registration attempt for username:", username)
    console.log("[SERVER][Register API] Request body keys:", Object.keys(body))

    if (!username || !password) {
      console.log("[SERVER][Register API] Missing username or password")
      return NextResponse.json(
        {
          error: "Username and password are required",
          details: {
            username: username ? "provided" : "missing",
            password: password ? "provided" : "missing",
          },
        },
        { status: 400 },
      )
    }

    if (typeof username !== "string" || typeof password !== "string") {
      console.log("[SERVER][Register API] Invalid data types")
      return NextResponse.json(
        {
          error: "Username and password must be strings",
          details: {
            usernameType: typeof username,
            passwordType: typeof password,
          },
        },
        { status: 400 },
      )
    }

    if (username.trim().length < 3) {
      console.log("[SERVER][Register API] Username too short")
      return NextResponse.json(
        {
          error: "Username must be at least 3 characters long",
        },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      console.log("[SERVER][Register API] Password too short")
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters long",
        },
        { status: 400 },
      )
    }

    console.log("[SERVER][Register API] Attempting to add user to database...")
    const newUser = await addUser(username.trim(), password)

    console.log("[SERVER][Register API] User registered successfully:", newUser.id)
    return NextResponse.json({
      message: "User registered successfully",
      userId: newUser.id,
      username: newUser.username,
    })
  } catch (error) {
    console.error("[SERVER][Register API] Registration error:", error)

    if (error instanceof Error) {
      console.error("[SERVER][Register API] Error message:", error.message)

      // Handle specific error cases
      if (error.message === "Username already exists") {
        return NextResponse.json(
          {
            error: "Username already exists",
            details: "Please choose a different username",
          },
          { status: 409 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "An error occurred during registration",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
