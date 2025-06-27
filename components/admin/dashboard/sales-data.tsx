"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, BarChart3 } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { SalesAnalysis } from "./sales-analysis"

interface SalesDataItem {
  month: string
  sales: number
  revenue: number
}

interface SalesDataResponse {
  totalSales: number
  totalRevenue: number
  averagePrice: number
  topSellingSize: string
  salesGrowth: number
  revenueGrowth: number
  monthlySales: SalesDataItem[]
  isEmpty: boolean
}

// Custom price formatter that removes the .00 when there are no cents
const formatPriceWithoutZeroCents = (value: number): string => {
  const formatted = formatPrice(value)
  return formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted
}

export function SalesData() {
  const [salesData, setSalesData] = useState<SalesDataResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [chartView, setChartView] = useState<"revenue" | "sales">("revenue")

  const fetchSalesData = async () => {
    try {
      const isInitialLoad = loading
      if (!isInitialLoad) setIsRefreshing(true)

      const response = await fetch("/api/admin/sales/data", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch sales data")
      }

      const data = await response.json()
      setSalesData(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching sales data:", err)
      setError("Failed to load sales data")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSalesData()

    // Set up event listener for product marked as sold
    const handleProductSold = () => {
      fetchSalesData()
    }

    window.addEventListener("product-marked-sold", handleProductSold)

    return () => {
      window.removeEventListener("product-marked-sold", handleProductSold)
    }
  }, [])

  if (loading) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg">Sales Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-6">
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg">Sales Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <h3 className="text-sm md:text-base font-medium text-red-500">{error}</h3>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchSalesData} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!salesData || salesData.isEmpty) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg">Sales Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <h3 className="text-sm md:text-base font-medium">No sales data available yet</h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              Mark rim products as sold to start tracking sales analytics
            </p>
            {isRefreshing && (
              <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
                <RefreshCw className="animate-spin h-3 w-3 mr-2" />
                Refreshing...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Sales Analytics</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Chart Controls */}
        <div className="flex justify-end mb-4">
          <div className="flex rounded-md overflow-hidden border">
            <Button
              size="sm"
              variant={chartView === "revenue" ? "default" : "outline"}
              onClick={() => setChartView("revenue")}
              className="h-8 text-xs"
            >
              Revenue
            </Button>
            <Button
              size="sm"
              variant={chartView === "sales" ? "default" : "outline"}
              onClick={() => setChartView("sales")}
              className="h-8 text-xs"
            >
              Units Sold
            </Button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData?.monthlySales || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
                tickFormatter={(value) =>
                  chartView === "revenue" ? formatPriceWithoutZeroCents(value) : value.toString()
                }
              />
              <Tooltip
                formatter={(value) =>
                  chartView === "revenue"
                    ? [formatPriceWithoutZeroCents(value as number), "Revenue"]
                    : [value, "Units Sold"]
                }
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  padding: "8px 12px",
                }}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
              />
              <Bar
                dataKey={chartView}
                fill={chartView === "revenue" ? "#4f46e5" : "#10b981"}
                radius={[4, 4, 0, 0]}
                barSize={20}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics */}
        <SalesAnalysis
          totalSales={salesData.totalSales}
          totalRevenue={salesData.totalRevenue}
          averagePrice={salesData.averagePrice}
          topSellingSize={salesData.topSellingSize}
          salesGrowth={salesData.salesGrowth}
          revenueGrowth={salesData.revenueGrowth}
        />
      </CardContent>
    </Card>
  )
}
