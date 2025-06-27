import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  // Check admin session
  const sessionCheck = await checkAdminSession()
  if (!sessionCheck.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createServerClient()
    const { imageUrls } = await request.json()

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: "No image URLs provided" }, { status: 400 })
    }

    console.log("Cleaning up temporary images:", imageUrls.length)

    const results = []
    // Delete each image from storage
    for (const imageUrl of imageUrls) {
      try {
        // Extract the path from the URL if it's a full URL
        let path = imageUrl
        if (imageUrl.includes("storage/v1/object/public/")) {
          const urlParts = imageUrl.split("storage/v1/object/public/")
          if (urlParts.length > 1) {
            path = urlParts[1]
          }
        }

        // Delete the image from storage
        const { error } = await supabase.storage.from("product-images").remove([path])

        if (error) {
          console.error("Error deleting image:", error)
          results.push({ path, success: false, error: error.message })
        } else {
          results.push({ path, success: true })
        }
      } catch (error) {
        console.error("Error processing image deletion:", error)
        results.push({
          path: imageUrl,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${imageUrls.length} images`,
      results,
    })
  } catch (error) {
    console.error("Error in cleanup-temp-images:", error)
    return NextResponse.json(
      {
        error: "Failed to clean up images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
