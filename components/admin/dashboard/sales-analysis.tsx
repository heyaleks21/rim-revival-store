"use client"
import { formatPrice } from "@/lib/utils"
import { TrendingUp, TrendingDown, CircleDollarSign, BarChart3, Ruler } from "lucide-react"

interface SalesAnalysisProps {
  totalSales: number
  totalRevenue: number
  averagePrice: number
  topSellingSize: string
  salesGrowth: number
  revenueGrowth: number
}

// Custom price formatter that removes the .00 when there are no cents
const formatPriceWithoutZeroCents = (value: number): string => {
  const formatted = formatPrice(value)
  return formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted
}

export function SalesAnalysis({
  totalSales,
  totalRevenue,
  averagePrice,
  topSellingSize,
  salesGrowth,
  revenueGrowth,
}: SalesAnalysisProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Total Sales */}
      <div className="rounded-lg bg-white border p-3 shadow-sm">
        <div className="flex items-center mb-1.5">
          <div className="rounded-full bg-blue-100 p-1.5 mr-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xs text-muted-foreground">Total Sales</p>
        </div>
        <p className="text-sm font-medium ml-8">{totalSales}</p>
        <div className="mt-1.5 flex items-center text-xs ml-8">
          {salesGrowth >= 0 ? (
            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
          )}
          <span className={salesGrowth >= 0 ? "text-green-600" : "text-red-600"}>
            {salesGrowth >= 0 ? "+" : ""}
            {salesGrowth}% from last month
          </span>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="rounded-lg bg-white border p-3 shadow-sm">
        <div className="flex items-center mb-1.5">
          <div className="rounded-full bg-indigo-100 p-1.5 mr-2">
            <CircleDollarSign className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <p className="text-sm font-medium ml-8">{formatPriceWithoutZeroCents(totalRevenue)}</p>
        <div className="mt-1.5 flex items-center text-xs ml-8">
          {revenueGrowth >= 0 ? (
            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
          )}
          <span className={revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
            {revenueGrowth >= 0 ? "+" : ""}
            {revenueGrowth}% from last month
          </span>
        </div>
      </div>

      {/* Average Price */}
      <div className="rounded-lg bg-white border p-3 shadow-sm">
        <div className="flex items-center mb-1.5">
          <div className="rounded-full bg-purple-100 p-1.5 mr-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xs text-muted-foreground">Average Price</p>
        </div>
        <p className="text-sm font-medium ml-8">{formatPriceWithoutZeroCents(averagePrice)}</p>
      </div>

      {/* Top Selling Size */}
      <div className="rounded-lg bg-white border p-3 shadow-sm">
        <div className="flex items-center mb-1.5">
          <div className="rounded-full bg-amber-100 p-1.5 mr-2">
            <Ruler className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xs text-muted-foreground">Top Selling Size</p>
        </div>
        <p className="text-sm font-medium ml-8">{topSellingSize || "N/A"}</p>
      </div>
    </div>
  )
}
