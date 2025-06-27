"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, Package, ShoppingCart, Eye, RefreshCcw } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  title: string
  price: number
  category: string
  quantity: number
  status: string
  images: string[]
}

export function InventoryAlerts() {
  const [lowStockItems, setLowStockItems] = useState<Product[]>([])
  const [outOfStockItems, setOutOfStockItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("low-stock")

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true)
        // In a real implementation, this would fetch from an API
        // For now, we'll simulate the data

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        const mockLowStock = [
          {
            id: "1",
            title: '18" BMW Style 189 Alloy Wheels',
            price: 450,
            category: "rim",
            quantity: 2,
            status: "active",
            images: ["/modern-alloy-wheel.png"],
          },
          {
            id: "2",
            title: "Michelin Pilot Sport 4 225/45R17",
            price: 180,
            category: "tyre",
            quantity: 1,
            status: "active",
            images: ["/aggressive-tire-grip.png"],
          },
        ]

        const mockOutOfStock = [
          {
            id: "3",
            title: '19" Mercedes AMG Style Wheels',
            price: 650,
            category: "rim",
            quantity: 0,
            status: "out_of_stock",
            images: ["/silver-mercedes-wheel-rim.png"],
          },
        ]

        setLowStockItems(mockLowStock)
        setOutOfStockItems(mockOutOfStock)
      } catch (error) {
        console.error("Error fetching inventory data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInventoryData()
  }, [])

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Inventory Alerts</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="low-stock" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="low-stock" className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100 mr-3">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-sm font-medium mr-2 ${
                            item.category === "rim" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.category === "rim" ? "Rim" : "Tyre"}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded-sm font-medium bg-red-100 text-red-800">
                          {item.quantity} left
                        </span>
                      </div>
                      <h4 className="text-sm font-medium truncate mt-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex space-x-2 ml-2">
                      <Button asChild size="sm" variant="outline" className="h-8 px-2">
                        <Link href={`/admin/products/${item.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">View</span>
                        </Link>
                      </Button>
                      <Button size="sm" className="h-8 px-2">
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Restock</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-sm font-medium">No low stock items</h3>
                <p className="text-xs text-muted-foreground mt-1">All inventory levels are healthy</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="out-of-stock" className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : outOfStockItems.length > 0 ? (
              <div className="space-y-3">
                {outOfStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100 mr-3">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-sm font-medium mr-2 ${
                            item.category === "rim" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.category === "rim" ? "Rim" : "Tyre"}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded-sm font-medium bg-red-100 text-red-800">
                          Out of stock
                        </span>
                      </div>
                      <h4 className="text-sm font-medium truncate mt-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex space-x-2 ml-2">
                      <Button asChild size="sm" variant="outline" className="h-8 px-2">
                        <Link href={`/admin/products/${item.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">View</span>
                        </Link>
                      </Button>
                      <Button size="sm" className="h-8 px-2">
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Restock</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-sm font-medium">No out of stock items</h3>
                <p className="text-xs text-muted-foreground mt-1">All products are currently in stock</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
