"use client"

import type React from "react"

import { useState, useEffect, useCallback, memo, useMemo, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductsTable } from "@/components/admin/products/products-table"
import { Plus, Search, X, RefreshCw } from "lucide-react"
import type { Product } from "@/lib/types"

interface ProductsClientProps {
  initialProducts: Product[]
}

// Create the component function
function ProductsClientComponent({ initialProducts }: ProductsClientProps) {
  console.log("ProductsClient rendering with", initialProducts.length, "products")

  // State declarations with proper initialization
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [tableKey, setTableKey] = useState(Date.now()) // Add a key to force re-render
  const pageSize = 10

  // Ref to track if this is the initial render
  const isInitialRender = useRef(true)

  // Fetch products directly from API
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/products", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      console.log("Fetched fresh products:", data.length)
      setProducts(data)
      setFilteredProducts(data) // Update filtered products when new data arrives
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching products:", error)
      setIsLoading(false)
    }
  }, [])

  // Initialize with initialProducts, then fetch fresh data
  useEffect(() => {
    console.log("Setting initial products:", initialProducts.length)
    setProducts(initialProducts)
    setFilteredProducts(initialProducts)

    // Fetch fresh data after initial render
    fetchProducts()

    // No interval setup - removed auto-refresh
  }, [fetchProducts]) // Only run on mount

  // Reset filters function with useCallback
  const resetFilters = useCallback(() => {
    setSearchQuery("")
    setCategoryFilter("all")
    setStockFilter("all")
    setCurrentPage(1) // Reset to first page when filters are reset
    setTableKey(Date.now()) // Force table re-render
  }, [])

  // Handle search input with useCallback
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Search changed:", e.target.value)
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when search changes
  }, [])

  // Filter effect - runs when filter criteria or products change
  useEffect(() => {
    console.log("Filter effect running with:", {
      searchQuery,
      categoryFilter,
      stockFilter,
      productsCount: products.length,
    })

    if (!products.length) return

    let result = [...products]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) =>
          product.title?.toLowerCase().includes(query) ||
          false ||
          product.description?.toLowerCase().includes(query) ||
          false ||
          product.brand?.toLowerCase().includes(query) ||
          false,
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

    console.log("Filtered products:", result.length)
    setFilteredProducts(result)

    // Force table re-render when filters change, but not on initial render
    if (!isInitialRender.current) {
      setTableKey(Date.now())
    } else {
      isInitialRender.current = false
    }
  }, [searchQuery, categoryFilter, stockFilter, products])

  // Calculate pagination using useMemo to ensure it's always in sync
  const paginationData = useMemo(() => {
    const totalItems = filteredProducts.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalItems)
    const currentItems = filteredProducts.slice(startIndex, endIndex)

    console.log("Pagination calculated:", {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentItemsLength: currentItems.length,
    })

    return { totalItems, totalPages, startIndex, endIndex, currentItems }
  }, [filteredProducts, currentPage, pageSize])

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > 1 && paginationData.totalPages < currentPage) {
      setCurrentPage(Math.max(1, paginationData.totalPages))
    }
  }, [paginationData.totalPages, currentPage])

  // Handle page change with useCallback
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
    setTableKey(Date.now()) // Force table re-render when page changes
  }, [])

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    fetchProducts()
    setTableKey(Date.now()) // Force table re-render on refresh
  }, [fetchProducts])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-8 pr-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button className="absolute right-2.5 top-2.5" onClick={() => setSearchQuery("")} aria-label="Clear search">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="rim">Rims</SelectItem>
              <SelectItem value="tyre">Tyres</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">In Stock</SelectItem>
              <SelectItem value="false">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset filters">
            <X className="h-4 w-4" />
            <span className="sr-only">Reset filters</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && products.length === 0 ? (
          <div className="text-center p-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : paginationData.currentItems.length > 0 ? (
          <>
            <div className="text-sm text-muted-foreground">
              Showing {paginationData.currentItems.length} of {paginationData.totalItems} products
              {paginationData.totalItems !== products.length && ` (filtered from ${products.length} total)`}
            </div>
            <ProductsTable
              products={paginationData.currentItems}
              key={tableKey} // Force re-render when data changes
            />
          </>
        ) : (
          <div className="text-center p-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No products found matching your filters.</p>
          </div>
        )}

        {/* Only show pagination if there are more than one page */}
        {paginationData.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {currentPage > 1 && (
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)}>
                Previous
              </Button>
            )}

            <div className="flex items-center text-sm">
              Page {currentPage} of {paginationData.totalPages}
            </div>

            {currentPage < paginationData.totalPages && (
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)}>
                Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Export a memoized version of the component to prevent unnecessary re-renders
export const ProductsClient = memo(ProductsClientComponent)
