export const dynamic = "force-dynamic"
export const revalidate = 0

import { SalesData } from "@/components/admin/dashboard/sales-data"
import { ProductsOverview } from "@/components/admin/dashboard/products-overview"
import { WeatherTimeCard } from "@/components/admin/dashboard/weather-time-card"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="space-y-4 px-1 sm:px-2 md:px-4 pb-6">
      <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>

      {/* Top Row - Weather and Quick Actions */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <WeatherTimeCard />
        <QuickActions />
      </div>

      {/* Middle Row - Products Overview and Sales Analytics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <ProductsOverview />
        <SalesData />
      </div>
    </div>
  )
}
