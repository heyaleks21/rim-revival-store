"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { getSupabaseSignedUrl } from "@/lib/supabase-image"
import { ImageZoomModal } from "@/components/image-zoom-modal"
import Link from "next/link"

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
  product_images: ProductImage[]
  [key: string]: any // For other dynamic fields
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [zoomModalOpen, setZoomModalOpen] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, product_images(*)")
          .eq("id", params.id)
          .single()

        if (error) {
          console.error("Error fetching product:", error)
          return
        }

        // Sort images by position
        if (data.product_images) {
          data.product_images.sort((a, b) => a.position - b.position)
        }

        setProduct(data)

        // Load image URLs
        if (data.product_images && data.product_images.length > 0) {
          loadImageUrls(data.product_images)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, supabase])

  // Load all image URLs
  const loadImageUrls = async (productImages: ProductImage[]) => {
    try {
      const urls = await Promise.all(
        productImages.map(async (img) => {
          return await getSupabaseSignedUrl(img.image_url)
        }),
      )
      setImageUrls(urls)
      if (urls.length > 0) {
        setCurrentImageUrl(urls[0])
      }
    } catch (error) {
      console.error("Error loading image URLs:", error)
    }
  }

  // Update current image URL when index changes
  useEffect(() => {
    if (imageUrls.length > 0 && currentImageIndex < imageUrls.length) {
      setCurrentImageUrl(imageUrls[currentImageIndex])
    }
  }, [currentImageIndex, imageUrls])

  const handlePrevImage = () => {
    if (!product?.product_images?.length) return
    setCurrentImageIndex((prev) => (prev === 0 ? product.product_images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    if (!product?.product_images?.length) return
    setCurrentImageIndex((prev) => (prev === product.product_images.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleImageClick = () => {
    setZoomModalOpen(true)
  }

  const handleInquiry = () => {
    // Store product info in sessionStorage for the contact form
    if (product) {
      const productDetails = formatProductDetails()
      const detailsText = productDetails.map((detail) => `${detail.label}: ${detail.value}`).join("\n")

      sessionStorage.setItem(
        "inquiryProduct",
        JSON.stringify({
          id: product.id,
          title: product.title,
          price: product.price,
          category: product.category,
          details: detailsText,
        }),
      )

      // Set flag to scroll to contact form
      sessionStorage.setItem("scrollToContact", "true")

      // Redirect to home page with contact hash
      // This ensures consistent behavior with other navigation links
      router.push("/#contact")
    }
  }

  const formatProductDetails = () => {
    if (!product) return []

    const details = []

    // Add vehicle details if available
    if (product.vehicle_brand || product.vehicle_model || product.vehicle_year) {
      details.push({
        label: "Vehicle",
        value: [product.vehicle_year, product.vehicle_brand, product.vehicle_model].filter(Boolean).join(" "),
      })
    }

    // Add rim details if it's a rim
    if (product.category === "rim") {
      if (product.rim_size) details.push({ label: "Size", value: product.rim_size })
      if (product.rim_width) details.push({ label: "Width", value: product.rim_width })
      if (product.front_rim_width) details.push({ label: "Front Width", value: product.front_rim_width })
      if (product.front_offset) details.push({ label: "Front Offset", value: product.front_offset })
      if (product.rear_offset) details.push({ label: "Rear Offset", value: product.rear_offset })
      if (product.rim_quantity) details.push({ label: "Quantity", value: product.rim_quantity })
      if (product.paint_condition) details.push({ label: "Condition", value: product.paint_condition })
      if (product.custom_brand) details.push({ label: "Brand", value: product.custom_brand })
      if (product.custom_center_bore) details.push({ label: "Center Bore", value: product.custom_center_bore })
    }

    // Add tyre details if it's a tyre
    if (product.category === "tyre") {
      if (product.tyre_size) details.push({ label: "Size", value: product.tyre_size })
      if (product.front_tyre_size) details.push({ label: "Front Size", value: product.front_tyre_size })
      if (product.rear_tyre_size) details.push({ label: "Rear Size", value: product.rear_tyre_size })
      if (product.tyre_condition) details.push({ label: "Condition", value: product.tyre_condition })
      if (product.tyre_quantity) details.push({ label: "Quantity", value: product.tyre_quantity })
    }

    return details
  }

  const productDetails = formatProductDetails()

  return (
    <div className="flex min-h-screen flex-col">
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
            <Link href="/catalog" className="text-sm font-medium transition-colors hover:text-primary">
              Catalog
            </Link>
            <Link href="/#services" className="text-sm font-medium transition-colors hover:text-primary">
              Services
            </Link>
            <Link href="/#faq" className="text-sm font-medium transition-colors hover:text-primary">
              FAQ
            </Link>
            <Link href="/#contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
          <Button asChild className="hidden sm:flex bg-secondary hover:bg-secondary/90">
            <Link href="/#contact">Contact Us</Link>
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
        {/* Back to catalog link */}
        <div className="container py-4">
          <Link href="/catalog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Catalog
          </Link>
        </div>

        {loading ? (
          <div className="container py-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-gray-100 aspect-square w-full rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-10 w-3/4 bg-gray-100"></div>
                <div className="h-6 w-1/4 bg-gray-100"></div>
                <div className="h-24 w-full bg-gray-100"></div>
              </div>
            </div>
          </div>
        ) : product ? (
          <>
            <div className="container py-8">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Product Images */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    {product.product_images && product.product_images.length > 0 && currentImageUrl ? (
                      <>
                        <div className="h-full w-full cursor-zoom-in" onClick={handleImageClick}>
                          <img
                            src={currentImageUrl || "/placeholder.svg"}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Image Navigation Arrows */}
                        {product.product_images.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                              onClick={handlePrevImage}
                            >
                              <ChevronLeft className="h-6 w-6" />
                              <span className="sr-only">Previous image</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                              onClick={handleNextImage}
                            >
                              <ChevronRight className="h-6 w-6" />
                              <span className="sr-only">Next image</span>
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {product.product_images && product.product_images.length > 1 && imageUrls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {imageUrls.map((url, index) => (
                        <button
                          key={index}
                          className={`relative h-20 w-20 overflow-hidden rounded-md border-2 ${
                            index === currentImageIndex ? "border-primary" : "border-transparent"
                          }`}
                          onClick={() => handleThumbnailClick(index)}
                        >
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`${product.title} - Image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold">{product.title}</h1>
                    <p className="mt-2 text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
                  </div>

                  <div className="prose max-w-none">
                    <p>{product.description}</p>
                  </div>

                  <Button size="lg" className="w-full bg-secondary hover:bg-secondary/90" onClick={handleInquiry}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Inquire About This Product
                  </Button>

                  {/* Product Specifications */}
                  {productDetails.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-xl font-bold mb-4">Specifications</h2>
                      <div className="grid gap-2">
                        {productDetails.map((detail, index) => (
                          <div key={index} className="grid grid-cols-2 py-2 border-b">
                            <div className="font-medium">{detail.label}</div>
                            <div>{detail.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Image Zoom Modal */}
            {product.product_images && (
              <ImageZoomModal
                isOpen={zoomModalOpen}
                onClose={() => setZoomModalOpen(false)}
                images={product.product_images.map((img) => img.image_url)}
                currentIndex={currentImageIndex}
                onIndexChange={setCurrentImageIndex}
                alt={product.title}
                preloadedUrls={imageUrls}
              />
            )}
          </>
        ) : (
          <div className="container py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="mb-8">The product you are looking for does not exist or has been removed.</p>
            <Button asChild>
              <Link href="/catalog">Browse Catalog</Link>
            </Button>
          </div>
        )}
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
            <Link href="/#contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
