"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { getSupabaseSignedUrl } from "@/lib/supabase-image"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  id: string
  title?: string
  name?: string
  description?: string
  short_description?: string
  price: number
  category?: string
  image?: string
  product?: Product
}

export function ProductCard({
  id,
  title,
  name,
  description,
  short_description,
  price,
  category,
  image,
  product,
}: ProductCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Handle both ways of passing data (full product object or individual props)
  const productTitle = title || name || product?.title || product?.name || "Untitled Product"
  const productDescription =
    description || short_description || product?.description || product?.short_description || ""

  // Handle image from either direct prop or from product.images
  let mainImage = image || null
  if (!mainImage && product?.images && product.images.length > 0) {
    mainImage = product.images[0].image_url
  } else if (!mainImage && product?.product_images && product.product_images.length > 0) {
    // Handle product_images array structure
    mainImage = product.product_images[0].image_url
  }

  // Get category-specific fallback image
  const getFallbackImage = () => {
    const productCategory = category || product?.category
    switch (productCategory) {
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

  // Load image URL
  useEffect(() => {
    async function loadImage() {
      if (mainImage) {
        try {
          const url = await getSupabaseSignedUrl(mainImage)
          setImageUrl(url)
        } catch (error) {
          console.error("Error loading image:", error)
          setImageUrl(getFallbackImage())
        }
      } else {
        setImageUrl(getFallbackImage())
      }
    }

    loadImage()
  }, [mainImage])

  return (
    <Link href={`/product/${id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-square overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={productTitle}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gray-100"></div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-medium">{productTitle}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{productDescription}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="text-lg font-bold">{formatPrice(price)}</div>
        </CardFooter>
      </Card>
    </Link>
  )
}
