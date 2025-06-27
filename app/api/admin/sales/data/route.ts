import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminSession } from "@/lib/auth"
import { format, subMonths, parseISO } from "date-fns"

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

    // Get all sold products
    const { data: soldProducts, error } = await supabase
      .from("sold_products")
      .select("*")
      .eq("category", "rim")
      .order("sold_at", { ascending: false })

    if (error) {
      console.error("Error fetching sold products:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!soldProducts || soldProducts.length === 0) {
      return NextResponse.json({
        totalSales: 0,
        totalRevenue: 0,
        averagePrice: 0,
        topSellingSize: "N/A",
        salesGrowth: 0,
        revenueGrowth: 0,
        monthlySales: [],
        isEmpty: true,
      })
    }

    // Calculate total sales and revenue
    const totalSales = soldProducts.length
    const totalRevenue = soldProducts.reduce((sum, product) => sum + (product.price || 0), 0)
    const averagePrice = totalRevenue / totalSales

    // Find top selling rim size
    const sizeCount: Record<string, number> = {}
    soldProducts.forEach((product) => {
      const size = product.rim_size || "Unknown"
      sizeCount[size] = (sizeCount[size] || 0) + 1
    })

    const topSellingSize = Object.entries(sizeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown"

    // Calculate growth (mock data for now)
    // In a real app, you would compare with previous period
    const salesGrowth = 12 // 12% growth
    const revenueGrowth = 15 // 15% growth

    // Prepare monthly sales data for the chart
    const monthlyData: Record<string, { sales: number; revenue: number }> = {}

    // Initialize with last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthKey = format(date, "MMM yyyy")
      monthlyData[monthKey] = { sales: 0, revenue: 0 }
    }

    // Fill in actual data
    soldProducts.forEach((product) => {
      if (!product.sold_at) return

      const soldDate = parseISO(product.sold_at)
      const monthKey = format(soldDate, "MMM yyyy")

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sales: 0, revenue: 0 }
      }

      monthlyData[monthKey].sales += 1
      monthlyData[monthKey].revenue += product.price || 0
    })

    // Convert to array format for the chart
    const monthlySales = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sales: data.sales,
      revenue: data.revenue,
    }))

    return NextResponse.json(
      {
        totalSales,
        totalRevenue,
        averagePrice,
        topSellingSize,
        salesGrowth,
        revenueGrowth,
        monthlySales,
        isEmpty: false,
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
    console.error("Error in GET /api/admin/sales/data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
