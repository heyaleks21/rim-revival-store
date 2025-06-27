"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseSignedUrl } from "@/lib/supabase-image"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductImage {
  id: string
  product_id: string
  image_url: string
  position: number
}

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  stud_pattern?: string
  rim_size?: string
  is_staggered?: boolean
  vehicle_brand?: string
  created_at: string
  product_images: ProductImage[]
  [key: string]: any // For other dynamic fields
}

// Sort options
type SortOption = "newest" | "price-low" | "price-high" | "name-asc" | "name-desc"

export default function CatalogPage() {
  // State management - completely self-contained
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productImages, setProductImages] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    category: "all",
    studPattern: "all",
    rimSize: "all",
    vehicleBrand: "all",
    isStaggered: "all",
  })
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  // Create refs to avoid closures in event handlers
  const supabase = getSupabaseClient()
  const router = useRouter()

  // Refs for smooth scrolling
  const homeRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  // Smooth scroll function that doesn't change URL
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Function to navigate to homepage contact section
  const navigateToContact = () => {
    // Store a flag in sessionStorage to indicate we want to scroll to contact
    sessionStorage.setItem("scrollToContact", "true")
    // Navigate to homepage
    router.push("/")
  }

  // Function to navigate to homepage featured section
  const navigateToFeatured = () => {
    // Store a flag in sessionStorage to indicate we want to scroll to featured
    sessionStorage.setItem("scrollToFeatured", "true")
    // Navigate to homepage
    router.push("/")
  }

  // Car brands for the dropdown
  const carBrands = [
    "All Brands",
    "BMW",
    "Mercedes",
    "Audi",
    "Volkswagen",
    "Toyota",
    "Honda",
    "Ford",
    "Holden",
    "Nissan",
    "Hyundai",
  ]

  // Rim sizes for the dropdown
  const rimSizes = [
    { value: "all", label: "All Sizes" },
    { value: "17", label: '17"' },
    { value: "18", label: '18"' },
    { value: "19", label: '19"' },
    { value: "20", label: '20"' },
    { value: "21", label: '21"' },
    { value: "22", label: '22"' },
  ]

  // Stud patterns for the dropdown
  const studPatterns = [
    { value: "all", label: "All Patterns" },
    // Most common patterns at the top
    { value: "5x120", label: "5x120" },
    { value: "5x114.3", label: "5x114.3" },
    { value: "5x112", label: "5x112" },
    // Other patterns
    { value: "4x100", label: "4x100" },
    { value: "4x108", label: "4x108" },
    { value: "5x100", label: "5x100" },
    { value: "5x108", label: "5x108" },
    { value: "5x110", label: "5x110" },
    { value: "5x115", label: "5x115" },
    { value: "5x127", label: "5x127" },
    { value: "6x139.7", label: "6x139.7" },
  ]

  // Fetch products only once on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("products")
          .select("*, product_images(*)")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching products:", error)
          return
        }

        setProducts(data || [])
        setFilteredProducts(data || [])

        // Load product images
        const imageMap: Record<string, string> = {}

        await Promise.all(
          data.map(async (product) => {
            if (product.product_images && product.product_images.length > 0) {
              // Sort images by position
              const sortedImages = [...product.product_images].sort((a, b) => a.position - b.position)
              const firstImage = sortedImages[0]

              if (firstImage && firstImage.image_url) {
                try {
                  const imageUrl = await getSupabaseSignedUrl(firstImage.image_url)
                  imageMap[product.id] = imageUrl
                } catch (error) {
                  console.error(`Error loading image for product ${product.id}:`, error)
                  // Use category-specific fallback image
                  imageMap[product.id] = getFallbackImage(product.category)
                }
              } else {
                imageMap[product.id] = getFallbackImage(product.category)
              }
            } else {
              imageMap[product.id] = getFallbackImage(product.category)
            }
          }),
        )

        setProductImages(imageMap)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [supabase])

  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (!products.length) return

    let result = [...products]

    // Apply text search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) =>
          product.title?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.vehicle_brand?.toLowerCase().includes(query),
      )
    }

    // Filter by category
    if (filters.category !== "all") {
      result = result.filter((product) => product.category === filters.category)
    }

    // Filter by stud pattern
    if (filters.studPattern !== "all") {
      result = result.filter((product) => product.stud_pattern === filters.studPattern)
    }

    // Filter by rim size
    if (filters.rimSize !== "all") {
      result = result.filter((product) => product.rim_size === filters.rimSize)
    }

    // Filter by staggered setup (renamed to rim setup)
    if (filters.isStaggered !== "all") {
      const isStaggeredValue = filters.isStaggered === "true"
      result = result.filter((product) => product.is_staggered === isStaggeredValue)
    }

    // Filter by vehicle brand
    if (filters.vehicleBrand !== "all" && filters.vehicleBrand !== "All Brands") {
      result = result.filter((product) => product.vehicle_brand === filters.vehicleBrand)
    }

    // Sort the filtered products
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name-asc":
          return a.title.localeCompare(b.title)
        case "name-desc":
          return b.title.localeCompare(a.title)
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredProducts(result)
  }, [searchQuery, filters, sortBy, products])

  // Get fallback image based on category
  const getFallbackImage = (category?: string) => {
    switch (category) {
      case "rim":
        return "/sleek-black-alloy-rim.png"
      case "tyre":
        return "/aggressive-tire-grip.png"
      case "package":
        return "/performance-wheel-tyre-set.png"
      default:
        return "/modern-alloy-wheel.png"
    }
  }

  // Get product image
  const getProductImage = (product: Product) => {
    return productImages[product.id] || getFallbackImage(product.category)
  }

  // Reset all filters - use useCallback to prevent recreating on every render
  const resetFilters = useCallback(() => {
    setSearchQuery("")
    setFilters({
      category: "all",
      studPattern: "all",
      rimSize: "all",
      vehicleBrand: "all",
      isStaggered: "all",
    })
    setSortBy("newest")
  }, [])

  // Handle search input change - use useCallback to prevent recreating on every render
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  return (
    <div className="flex min-h-screen flex-col" ref={homeRef}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Rim Revival Store" width={40} height={40} />
            <span className="hidden font-bold sm:inline-block">Rim Revival Store</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <button onClick={navigateToFeatured} className="text-sm font-medium transition-colors hover:text-primary">
              Featured
            </button>
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Services
            </Link>
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              FAQ
            </Link>
            <button onClick={navigateToContact} className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </button>
            <Link href="/catalog" className="text-sm font-medium text-primary font-semibold">
              Catalog
            </Link>
          </nav>
          <Button onClick={navigateToContact} className="hidden sm:flex bg-secondary hover:bg-secondary/90">
            Contact Us
          </Button>
          <Button variant="outline" size="icon" className="md:hidden">
            <span className="sr-only">Toggle menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Catalog Header */}
        <div className="bg-gray-50 dark:bg-gray-800 py-8">
          <div className="container">
            <h1 className="text-3xl font-bold">Product Catalog</h1>
            <p className="text-muted-foreground mt-2">Browse our collection of quality wheels and tyres</p>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Left Sidebar - Filters */}
            <div className="md:col-span-1 overflow-visible">
              <div className="sticky top-24 space-y-6 overflow-visible">
                <div>
                  <h3 className="text-lg font-medium mb-4">Filters</h3>

                  {/* Search Input */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3">Search</h4>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search products..."
                        className="w-full pl-8 pr-8"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                      {searchQuery && (
                        <button
                          className="absolute right-2.5 top-2.5"
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Sort By and Vehicle Brand Filters - Side by side */}
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-3">Sort By</h4>
                          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="newest">Newest First</SelectItem>
                              <SelectItem value="price-low">Price: Low to High</SelectItem>
                              <SelectItem value="price-high">Price: High to Low</SelectItem>
                              <SelectItem value="name-asc">Name: A to Z</SelectItem>
                              <SelectItem value="name-desc">Name: Z to A</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-3">Vehicle Brand</h4>
                          <Select
                            value={filters.vehicleBrand}
                            onValueChange={(value) => setFilters({ ...filters, vehicleBrand: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {carBrands.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                  {brand}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Stud Pattern and Rim Size Filters - Side by side */}
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-3">Stud Pattern</h4>
                          <Select
                            value={filters.studPattern}
                            onValueChange={(value) => setFilters({ ...filters, studPattern: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select pattern" />
                            </SelectTrigger>
                            <SelectContent>
                              {studPatterns.map((pattern) => (
                                <SelectItem key={pattern.value} value={pattern.value}>
                                  {pattern.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-3">Rim Size</h4>
                          <Select
                            value={filters.rimSize}
                            onValueChange={(value) => setFilters({ ...filters, rimSize: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {rimSizes.map((size) => (
                                <SelectItem key={size.value} value={size.value}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Category and Rim Setup Filters - Side by side */}
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-3">Category</h4>
                          <RadioGroup
                            value={filters.category}
                            onValueChange={(value) => setFilters({ ...filters, category: value })}
                            className="space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="category-all" />
                              <Label htmlFor="category-all">All</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rim" id="category-rim" />
                              <Label htmlFor="category-rim">Rims</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="tyre" id="category-tyre" />
                              <Label htmlFor="category-tyre">Tyres</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-3">Rim Setup</h4>
                          <RadioGroup
                            value={filters.isStaggered}
                            onValueChange={(value) => setFilters({ ...filters, isStaggered: value })}
                            className="space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="staggered-all" />
                              <Label htmlFor="staggered-all">All</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="staggered-yes" />
                              <Label htmlFor="staggered-yes">Staggered</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button className="w-full bg-secondary hover:bg-secondary/90" onClick={resetFilters} type="button">
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="md:col-span-3">
              {/* Product Count */}
              <div className="mb-6">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
              </div>

              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="group overflow-hidden rounded-lg border">
                      <div className="aspect-square w-full bg-gray-100"></div>
                      <div className="p-4">
                        <div className="h-6 w-3/4 bg-gray-100"></div>
                        <div className="mt-2 h-4 w-1/4 bg-gray-100"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="group overflow-hidden rounded-lg border hover:border-primary transition-colors"
                    >
                      <div className="aspect-square relative overflow-hidden bg-gray-100">
                        <img
                          src={getProductImage(product) || "/placeholder.svg"}
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium line-clamp-1">{product.title}</h3>
                        <p className="mt-1 text-lg font-bold text-primary">{formatPrice(product.price)}</p>
                        <div className="mt-4">
                          <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h2 className="mt-4 text-xl font-semibold">No Products Found</h2>
                  <p className="mt-2 text-muted-foreground">Try adjusting your filters or search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Rim Revival Store. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/catalog" className="hover:text-white transition-colors">
              Catalog
            </Link>
            <button onClick={navigateToContact} className="hover:text-white transition-colors">
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
