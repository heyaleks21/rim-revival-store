import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check authentication
    await requireAuth()

    const formData = await request.formData()
    const file = formData.get("file") as File
    const path = formData.get("path") as string

    if (!file || !path) {
      return NextResponse.json({ error: "File and path are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Upload the file using server-side client with admin privileges
    const { data: uploadData, error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Error uploading to Supabase:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path)

    return NextResponse.json({
      path,
      publicUrl: publicUrlData.publicUrl,
      success: true,
    })
  } catch (error) {
    console.error("Error handling upload:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
