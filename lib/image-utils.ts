/**
 * Utility functions for handling images
 */

// Extract path from Supabase URL
export function extractPathFromSupabaseUrl(url: string): { bucket: string; path: string } | null {
  try {
    if (!url || typeof url !== "string") return null

    // Check if it's a Supabase URL
    if (url.includes("supabase.co") && url.includes("/storage/v1/object/public/")) {
      // Extract bucket and path from URL
      const match = url.match(/\/public\/([^/]+)\/(.+)/)
      if (match) {
        return {
          bucket: match[1],
          path: match[2],
        }
      }
    }
    return null
  } catch (e) {
    console.error("Error extracting path from Supabase URL:", e)
    return null
  }
}

// Get a proxied URL for Supabase images
export function getProxiedImageUrl(url: string): string {
  const extracted = extractPathFromSupabaseUrl(url)
  if (extracted) {
    return `/api/image-proxy?bucket=${extracted.bucket}&path=${extracted.path}`
  }
  return url
}

// Check if an image exists at a URL
export async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch (e) {
    return false
  }
}
