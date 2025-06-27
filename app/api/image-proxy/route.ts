import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { extractPathFromSupabaseUrl } from "@/lib/image-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let path = searchParams.get("path")
    let bucket = searchParams.get("bucket") || "product-images"

    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 })
    }

    // If the path is a full Supabase URL, extract the bucket and path
    if (path.includes("supabase.co") && path.includes("/storage/v1/object/")) {
      const extracted = extractPathFromSupabaseUrl(path)
      if (extracted) {
        bucket = extracted.bucket
        path = extracted.path
      }
    }

    const supabase = createServerClient()

    // Try to download the file directly
    try {
      const { data, error } = await supabase.storage.from(bucket).download(path)

      if (error) {
        console.error("Error downloading from storage:", error)
        throw error
      }

      if (!data) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      // Determine content type
      let contentType = "image/jpeg" // Default
      if (path.toLowerCase().endsWith(".png")) contentType = "image/png"
      if (path.toLowerCase().endsWith(".gif")) contentType = "image/gif"
      if (path.toLowerCase().endsWith(".svg")) contentType = "image/svg+xml"
      if (path.toLowerCase().endsWith(".webp")) contentType = "image/webp"
      if (path.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg"
      if (path.toLowerCase().endsWith(".jpg")) contentType = "image/jpeg"

      // Return the image with appropriate headers
      return new NextResponse(data, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    } catch (downloadError) {
      console.error("Download error, trying signed URL:", downloadError)

      // Try to get a signed URL as a fallback
      try {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600) // 1 hour expiry

        if (signedUrlError) {
          console.error("Signed URL error:", signedUrlError)
          throw signedUrlError
        }

        if (signedUrlData?.signedUrl) {
          return NextResponse.redirect(signedUrlData.signedUrl)
        }
      } catch (signedUrlError) {
        console.error("Failed to get signed URL:", signedUrlError)
        // If all else fails, return a 404
        return NextResponse.json({ error: "Image not found" }, { status: 404 })
      }

      // If we get here, return a 404
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Image proxy error:", error)
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 })
  }
}
