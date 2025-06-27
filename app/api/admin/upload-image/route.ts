import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check authentication
    await requireAuth()

    const supabase = createServerClient()
    const { fileName, contentType } = await request.json()

    // Create a signed URL for uploading
    const { data, error } = await supabase.storage.from("product-images").createSignedUploadUrl(fileName)

    if (error) {
      console.error("Error creating signed URL:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return the signed URL data
    return NextResponse.json({
      success: true,
      data: {
        signedUrl: data.signedUrl,
        path: fileName,
        token: data.token,
      },
    })
  } catch (error) {
    console.error("Error handling upload:", error)
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 })
  }
}
