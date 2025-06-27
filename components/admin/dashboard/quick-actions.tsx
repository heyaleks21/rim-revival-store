"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, ShoppingCart, AlertTriangle, Truck, BarChart3, Search, Gauge } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function QuickActions() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("actions")

  // These would typically come from an API
  const lowStockCount = 3
  const pendingOrdersCount = 2

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center justify-between text-base md:text-lg">
          <span>Business Dashboard</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {new Date().toLocaleDateString("en-AU", { weekday: "short" })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <div className="overflow-x-auto -mx-2 px-2">
            <TabsList className="w-full">
              <TabsTrigger value="actions" className="flex-1 text-xs sm:text-sm">
                Quick Actions
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex-1 text-xs sm:text-sm">
                Alerts
                {lowStockCount > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {lowStockCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="actions" className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center justify-center gap-1"
                onClick={() => router.push("/admin/products/new")}
              >
                <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs">Add Product</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center justify-center gap-1"
                onClick={() => router.push("/admin/products")}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs">Find Product</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center justify-center gap-1"
                onClick={() => router.push("/admin/products?filter=in_stock")}
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs">Mark as Sold</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center justify-center gap-1"
                onClick={() => router.push("/admin/dashboard")}
              >
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs">Sales Report</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-3">
              {lowStockCount > 0 ? (
                <div className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mr-2" />
                    <div>
                      <p className="font-medium text-xs sm:text-sm">Low Stock Alert</p>
                      <p className="text-xs text-muted-foreground">{lowStockCount} products running low</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/admin/products?filter=low_stock")}
                    className="text-xs"
                  >
                    View
                  </Button>
                </div>
              ) : null}

              {pendingOrdersCount > 0 ? (
                <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="font-medium text-xs sm:text-sm">Pending Orders</p>
                      <p className="text-xs text-muted-foreground">{pendingOrdersCount} orders awaiting processing</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/admin/orders")} className="text-xs">
                    View
                  </Button>
                </div>
              ) : null}

              <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm">Tyre Pressure Check</p>
                    <p className="text-xs text-muted-foreground">Reminder to update seasonal recommendations</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/admin/settings")} className="text-xs">
                  Update
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
