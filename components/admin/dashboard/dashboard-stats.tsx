"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
}

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const [inStockCount, setInStockCount] = useState<number>(0)
  const [outOfStockCount, setOutOfStockCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/dashboard/stats", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats")
      }

      const data = await response.json()
      setInStockCount(data.inStockCount)
      setOutOfStockCount(data.outOfStockCount)
      setError(null)
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError("Failed to load dashboard stats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Set up event listener for product changes
    const handleProductChange = () => {
      fetchStats()
    }

    window.addEventListener("product-marked-sold", handleProductChange)
    window.addEventListener("product-status-changed", handleProductChange)
    window.addEventListener("product-created", handleProductChange)
    window.addEventListener("product-deleted", handleProductChange)

    return () => {
      window.removeEventListener("product-marked-sold", handleProductChange)
      window.removeEventListener("product-status-changed", handleProductChange)
      window.removeEventListener("product-created", handleProductChange)
      window.removeEventListener("product-deleted", handleProductChange)
    }
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatsCard
        title="In Stock"
        value={inStockCount}
        description="Products available for sale"
        icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
      />

      <StatsCard
        title="Out of Stock"
        value={outOfStockCount}
        description="Products not available"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}
