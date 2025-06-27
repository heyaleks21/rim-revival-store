"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface ProductFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  stockFilter: string
  onStockChange: (value: string) => void
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  stockFilter,
  onStockChange,
}: ProductFiltersProps) {
  const resetFilters = () => {
    onSearchChange("")
    onCategoryChange("all")
    onStockChange("all")
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-8 md:w-[200px] lg:w-[300px]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="rim">Rims</SelectItem>
            <SelectItem value="tyre">Tyres</SelectItem>
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={onStockChange}>
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
  )
}
