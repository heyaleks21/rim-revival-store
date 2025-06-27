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

    // Get counts from database
    const { count: inStockCount, error: inStockError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("in_stock", true)

    const { count: outOfStockCount, error: outOfStockError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("in_stock", false)

    if (inStockError) {
      console.error("Error fetching in-stock products:", inStockError)
      return NextResponse.json({ error: inStockError.message }, { status: 500 })
    }

    if (outOfStockError) {
      console.error("Error fetching out-of-stock products:", outOfStockError)
      return NextResponse.json({ error: outOfStockError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        inStockCount: inStockCount || 0,
        outOfStockCount: outOfStockCount || 0,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Error in GET /api/admin/dashboard/stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
