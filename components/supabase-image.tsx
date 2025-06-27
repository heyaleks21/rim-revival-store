"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getProxiedImageUrl } from "@/lib/image-utils"

interface SupabaseImageProps {
  path: string
  alt: string
  className?: string
  fallbackSrc?: string
  size?: "thumbnail" | "medium" | "full"
}

export function SupabaseImage({
  path,
  alt,
  className,
  fallbackSrc = "/modern-alloy-wheel.png",
  size = "medium",
}: SupabaseImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function getImageUrl() {
      if (!path) {
        setError(true)
        setLoading(false)
        return
      }

      try {
        // First, try using the image proxy for Supabase URLs
        if (path.includes("supabase.co") && path.includes("/storage/v1/object/")) {
          const proxiedUrl = getProxiedImageUrl(path)
          setImageUrl(proxiedUrl)
          setLoading(false)
          return
        }

        // If it's already a full URL (but not Supabase), use it directly
        if (path.startsWith("http")) {
          setImageUrl(path)
          setLoading(false)
          return
        }

        // If it's a local path starting with /, use it directly
        if (path.startsWith("/")) {
          setImageUrl(path)
          setLoading(false)
          return
        }

        // Try to get a signed URL first (more reliable)
        try {
          const { data: signedData, error: signedError } = await supabase.storage
            .from("product-images")
            .createSignedUrl(path, 3600) // 1 hour expiry

          if (!signedError && signedData?.signedUrl) {
            setImageUrl(signedData.signedUrl)
            setLoading(false)
            return
          }
        } catch (signedErr) {
          console.log("Failed to get signed URL, falling back to public URL", signedErr)
        }

        // Fallback to public URL if signed URL fails
        const { data } = await supabase.storage.from("product-images").getPublicUrl(path)

        if (data?.publicUrl) {
          setImageUrl(data.publicUrl)
        } else {
          // If all else fails, try the image proxy
          setImageUrl(`/api/image-proxy?path=${encodeURIComponent(path)}`)
        }
      } catch (err) {
        console.error("Error loading image:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    getImageUrl()
  }, [path, supabase])

  if (loading) {
    return <div className={`bg-gray-200 animate-pulse ${className}`} />
  }

  if (error || !imageUrl) {
    return <img src={fallbackSrc || "/placeholder.svg"} alt={alt} className={className} />
  }

  return (
    <img
      src={imageUrl || "/placeholder.svg"}
      alt={alt}
      className={className}
      onError={() => {
        console.log("Image failed to load:", imageUrl)
        setError(true)
      }}
    />
  )
}
