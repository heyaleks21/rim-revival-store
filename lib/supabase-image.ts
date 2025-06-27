import { getSupabaseClient } from "./supabase/client"

/**
 * Gets a signed URL for a Supabase storage path with a default expiry of 1 year
 * @param path The path within the bucket
 * @param bucket The storage bucket name (default: 'product-images')
 * @param expiresIn Expiry time in seconds (default: 31536000 = 1 year)
 * @returns The signed URL for the image
 */
export async function getSupabaseSignedUrl(
  path: string | null | undefined,
  bucket = "product-images",
  expiresIn = 31536000, // 1 year in seconds
): Promise<string> {
  if (!path) {
    return "/modern-alloy-wheel.png" // Default fallback image
  }

  try {
    // If it's already a full URL but not a Supabase URL, return it
    if (path.startsWith("http") && !path.includes("supabase")) {
      return path
    }

    // If it's a local path starting with /, return it
    if (path.startsWith("/") && !path.includes("supabase")) {
      return path
    }

    // Extract path if it's a full Supabase URL
    if (path.includes("/storage/v1/object/public/")) {
      const match = path.match(/\/public\/([^/]+)\/(.+)/)
      if (match) {
        bucket = match[1]
        path = match[2]
      }
    }

    // Get a signed URL from Supabase with a long expiry
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

    if (error) {
      return "/modern-alloy-wheel.png" // Fallback image on error
    }

    if (!data || !data.signedUrl) {
      return "/modern-alloy-wheel.png" // Fallback image if no URL
    }

    return data.signedUrl
  } catch (error) {
    return "/modern-alloy-wheel.png" // Fallback image on error
  }
}

/**
 * Gets the public URL for a Supabase storage path (fallback method)
 * @param path The path within the bucket
 * @param bucket The storage bucket name (default: 'product-images')
 * @returns The public URL for the image
 */
export function getSupabasePublicUrl(path: string | null | undefined, bucket = "product-images"): string {
  if (!path) {
    return "/modern-alloy-wheel.png" // Default fallback image
  }

  try {
    // If it's already a full URL, return it
    if (path.startsWith("http")) {
      return path
    }

    // If it's a local path starting with /, return it
    if (path.startsWith("/")) {
      return path
    }

    // If it's a path, get the public URL from Supabase
    const supabase = getSupabaseClient()
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)

    return data.publicUrl
  } catch (error) {
    return "/modern-alloy-wheel.png" // Fallback image on error
  }
}

/**
 * Extracts the storage path from a Supabase URL
 * @param url The full Supabase URL
 * @returns The storage path or null if not a valid Supabase URL
 */
export function extractPathFromSupabaseUrl(url: string): { bucket: string; path: string } | null {
  if (!url || typeof url !== "string") return null

  try {
    // Check if it's a Supabase URL
    if (url.includes("/storage/v1/object/")) {
      // Extract path from signed URL
      if (url.includes("/sign/")) {
        const match = url.match(/\/sign\/([^/]+)\/(.+)\?token=/)
        if (match) {
          return {
            bucket: match[1],
            path: match[2],
          }
        }
      }

      // Extract path from public URL
      if (url.includes("/public/")) {
        const match = url.match(/\/public\/([^/]+)\/(.+)/)
        if (match) {
          return {
            bucket: match[1],
            path: match[2],
          }
        }
      }
    }
    return null
  } catch (e) {
    return null
  }
}
