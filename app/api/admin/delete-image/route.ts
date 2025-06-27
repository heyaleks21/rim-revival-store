import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check authentication
    await requireAuth()

    const supabase = createServerClient()
    const { path, fullUrl } = await request.json()

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 })
    }

    console.log("Deleting image with path:", path)
    console.log("Is full URL:", fullUrl)

    let storagePath = path

    // If this is a full URL, extract the path
    if (fullUrl) {
      // Extract the path from the URL
      const urlParts = path.split("product-images/")
      if (urlParts.length > 1) {
        storagePath = urlParts[1]
        console.log("Extracted storage path:", storagePath)
      }
    }

    // Delete the file from storage
    const { data, error } = await supabase.storage.from("product-images").remove([storagePath])

    if (error) {
      console.error("Supabase error deleting image:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Image deletion result:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error handling delete:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
