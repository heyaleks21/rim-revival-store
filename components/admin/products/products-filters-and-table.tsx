"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/admin/products/products-table"
import { Search, X } from "lucide-react"
import type { Product } from "@/lib/types"

interface ProductsFiltersAndTableProps {
  products: Product[]
}

export function ProductsFiltersAndTable({ products }: ProductsFiltersAndTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Apply filters whenever filter values or products change
  useEffect(() => {
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
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, categoryFilter, stockFilter, products])

  // Calculate pagination
  const totalItems = filteredProducts.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const currentItems = filteredProducts.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setStockFilter("all")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Catalog</CardTitle>
        <CardDescription>View and manage your product inventory</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="rim">Rims</SelectItem>
                <SelectItem value="tyre">Tyres</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">In Stock</SelectItem>
                <SelectItem value="false">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset filters" className="h-10 w-10">
              <X className="h-4 w-4" />
              <span className="sr-only">Reset filters</span>
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <div className="space-y-4">
          {currentItems.length > 0 ? (
            <ProductsTable products={currentItems} />
          ) : (
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No products found matching your filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {currentPage > 1 && (
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)}>
                  Previous
                </Button>
              )}

              <div className="flex items-center text-sm">
                Page {currentPage} of {totalPages}
              </div>

              {currentPage < totalPages && (
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)}>
                  Next
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
