"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getSupabaseSignedUrl } from "@/lib/supabase-image"

interface ReliableImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fallbackSrc?: string
}

export function ReliableImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fallbackSrc = "/modern-alloy-wheel.png",
}: ReliableImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadImage() {
      if (!src) {
        setImageSrc(fallbackSrc)
        setIsLoading(false)
        return
      }

      try {
        // If it's already a full URL that's not a Supabase URL, use it directly
        if (src.startsWith("http") && !src.includes("supabase")) {
          setImageSrc(src)
          setIsLoading(false)
          return
        }

        // If it's a local path starting with /, use it directly
        if (src.startsWith("/") && !src.includes("supabase")) {
          setImageSrc(src)
          setIsLoading(false)
          return
        }

        // For Supabase URLs or paths, get a signed URL
        const signedUrl = await getSupabaseSignedUrl(src)
        setImageSrc(signedUrl)
      } catch (err) {
        console.error("Error loading image:", err)
        setError(true)
        setImageSrc(fallbackSrc)
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [src, fallbackSrc])

  // Handle image load error
  const handleError = () => {
    console.error("Image failed to load:", imageSrc)
    setError(true)
    setImageSrc(fallbackSrc)
  }

  if (isLoading) {
    return <div className={`bg-gray-200 animate-pulse ${className}`} style={{ width, height }} />
  }

  // Use Next.js Image for optimized images
  return (
    <Image
      src={imageSrc || "/placeholder.svg"}
      alt={alt}
      width={width || 500}
      height={height || 300}
      className={className}
      priority={priority}
      onError={handleError}
    />
  )
}
