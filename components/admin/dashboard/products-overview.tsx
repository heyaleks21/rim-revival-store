"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SupabaseImage } from "@/components/supabase-image"
import { formatPrice } from "@/lib/utils"
import { Loader2, Package, Search, ShoppingCart, CircleOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@/lib/types"

export function ProductsOverview() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [inStockCount, setInStockCount] = useState<number>(0)
  const [outOfStockCount, setOutOfStockCount] = useState<number>(0)
  const router = useRouter()

  // Function to fetch products
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data)
      setFilteredProducts(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
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
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
    }
  }

  // Fetch products on component mount and when router changes
  useEffect(() => {
    fetchProducts()
    fetchStats()

    // Set up event listener for product changes
    const handleProductChange = () => {
      fetchProducts()
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
  }, [router])

  // Apply filters whenever filter values or products change
  useEffect(() => {
    if (!products.length) return

    let result = [...products]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) =>
          product.title?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((product) => product.category === categoryFilter)
    }

    // Apply stock filter
    if (stockFilter !== "all") {
      const inStock = stockFilter === "true"
      result = result.filter((product) => product.in_stock === inStock)
    }

    setFilteredProducts(result)
  }, [searchQuery, categoryFilter, stockFilter, products])

  // Filter products by category for tabs
  const rimProducts = filteredProducts.filter((product) => product.category === "rim")
  const tyreProducts = filteredProducts.filter((product) => product.category === "tyre")

  // Get recent products (last 5)
  const recentProducts = [...filteredProducts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg">Products Overview</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="flex justify-center py-10 px-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg">Products Overview</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Products Overview</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center p-3 bg-white border rounded-md">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{inStockCount}</p>
              <p className="text-xs text-muted-foreground">In Stock</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-white border rounded-md">
            <div className="rounded-full bg-red-100 p-2 mr-3">
              <CircleOff className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{outOfStockCount}</p>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="rim">Rims</SelectItem>
                <SelectItem value="tyre">Tyres</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">In Stock</SelectItem>
                <SelectItem value="false">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <Tabs defaultValue="recent">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="recent" className="flex-1">
                Recent
              </TabsTrigger>
              <TabsTrigger value="rims" className="flex-1">
                Rims ({rimProducts.length})
              </TabsTrigger>
              <TabsTrigger value="tyres" className="flex-1">
                Tyres ({tyreProducts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              {recentProducts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No products found</div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4">
                  {recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 border-b pb-4 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors"
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                    >
                      <div className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-md">
                        {product.product_images && product.product_images.length > 0 ? (
                          <SupabaseImage
                            path={product.product_images[0].image_url}
                            alt={product.title || "Product image"}
                            className="h-full w-full object-cover"
                            size="thumbnail"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm sm:text-base">{product.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)} •
                          {product.in_stock ? (
                            <span className="text-green-600"> In Stock</span>
                          ) : (
                            <span className="text-red-600"> Out of Stock</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm sm:text-base">{formatPrice(product.price)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(product.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rims">
              {rimProducts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No rim products found</div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4">
                  {rimProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 border-b pb-4 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors"
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                    >
                      <div className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-md">
                        {product.product_images && product.product_images.length > 0 ? (
                          <SupabaseImage
                            path={product.product_images[0].image_url}
                            alt={product.title || "Product image"}
                            className="h-full w-full object-cover"
                            size="thumbnail"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm sm:text-base">{product.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {product.rim_size ? `${product.rim_size}" ` : ""}
                          {product.in_stock ? (
                            <span className="text-green-600">In Stock</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm sm:text-base">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tyres">
              {tyreProducts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No tyre products found</div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4">
                  {tyreProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 border-b pb-4 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors"
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                    >
                      <div className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-md">
                        {product.product_images && product.product_images.length > 0 ? (
                          <SupabaseImage
                            path={product.product_images[0].image_url}
                            alt={product.title || "Product image"}
                            className="h-full w-full object-cover"
                            size="thumbnail"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm sm:text-base">{product.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {product.tyre_size ? `${product.tyre_size} ` : ""}
                          {product.in_stock ? (
                            <span className="text-green-600">In Stock</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm sm:text-base">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
