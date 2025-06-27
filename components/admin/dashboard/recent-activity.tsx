"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ShoppingCart, Package, DollarSign, RefreshCw } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"

interface ActivityItem {
  id: string
  type: "product_added" | "product_sold" | "price_updated"
  productId: string
  productTitle: string
  timestamp: string
  details?: {
    price?: number
    oldPrice?: number
    newPrice?: number
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/recent-activity", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch recent activities")
        }

        const data = await response.json()
        setActivities(data.activities || [])
      } catch (err) {
        console.error("Error fetching activities:", err)
        setError("Failed to load recent activities")
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()

    // Set up event listener for product marked as sold
    const handleProductSold = () => {
      fetchActivities()
    }

    window.addEventListener("product-marked-sold", handleProductSold)

    return () => {
      window.removeEventListener("product-marked-sold", handleProductSold)
    }
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "product_added":
        return <Package className="h-4 w-4 text-blue-500" />
      case "product_sold":
        return <ShoppingCart className="h-4 w-4 text-green-500" />
      case "price_updated":
        return <DollarSign className="h-4 w-4 text-amber-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case "product_added":
        return `New product added: ${activity.productTitle}`
      case "product_sold":
        return `Product sold: ${activity.productTitle} for ${
          activity.details?.price ? formatPrice(activity.details.price) : "N/A"
        }`
      case "price_updated":
        return `Price updated for ${activity.productTitle}: ${
          activity.details?.oldPrice ? formatPrice(activity.details.oldPrice) : "N/A"
        } → ${activity.details?.newPrice ? formatPrice(activity.details.newPrice) : "N/A"}`
      default:
        return `Activity on ${activity.productTitle}`
    }
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-medium">No recent activity</h3>
            <p className="text-xs text-muted-foreground mt-1">Activities will appear here as they happen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex">
                <div className="mr-3 mt-0.5">
                  <div className="rounded-full bg-gray-100 p-2">{getActivityIcon(activity.type)}</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{getActivityText(activity)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
