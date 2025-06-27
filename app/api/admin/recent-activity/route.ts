import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminSession } from "@/lib/auth"

// Add cache control headers to prevent caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  // Check admin session
  const sessionCheck = await checkAdminSession()
  if (!sessionCheck.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createServerClient()

    // Get 5 most recent products
    const { data: recentProducts, error } = await supabase
      .from("products")
      .select("id, title, created_at, updated_at, in_stock")
      .order("updated_at", { ascending: false })
      .limit(5)

    if (error) {
      console.error("Error fetching recent products:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(recentProducts || [], {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error in GET /api/admin/recent-activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
