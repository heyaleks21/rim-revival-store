import { NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()
    const password = "1EhuloGoeyBML8xI"

    // Get the stored hash from the database
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("username, password_hash")
      .eq("username", "admin")
      .single()

    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin user not found",
          error: error?.message,
        },
        { status: 404 },
      )
    }

    // Compare the password with the stored hash
    const passwordMatch = await bcryptjs.compare(password, user.password_hash)

    // Generate a new hash for the password for verification
    const newHash = await bcryptjs.hash(password, 12)
    const verifyNewHash = await bcryptjs.compare(password, newHash)

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        stored_hash: user.password_hash,
      },
      password_check: {
        input_password: password,
        matches_stored_hash: passwordMatch,
        new_hash: newHash,
        new_hash_verified: verifyNewHash,
      },
    })
  } catch (error) {
    console.error("Debug auth error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error debugging auth",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
