import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // Check admin session
  const sessionCheck = await checkAdminSession()
  if (!sessionCheck.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createServerClient()

    // Get the original product
    const { data: originalProduct, error: fetchError } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      console.error("Error fetching product for duplication:", fetchError)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Create a new product with the same data
    const { id: originalId, created_at, updated_at, product_images, ...productData } = originalProduct

    // Keep the original title as requested
    // productData.title = `${productData.title} (Copy)`

    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single()

    if (insertError) {
      console.error("Error creating duplicate product:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Duplicate images if there are any
    if (product_images && product_images.length > 0) {
      const newImages = []

      for (const image of product_images) {
        // Get the original image path
        const originalPath = image.image_url

        // Generate a new filename for the duplicate
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 15)
        const fileExt = originalPath.split(".").pop()
        const newFileName = `${timestamp}-${random}.${fileExt}`

        // Always store in staging folder
        const newPath = `staging/${newFileName}`

        try {
          // Copy the file in storage
          const { data: copyData, error: copyError } = await supabase.storage
            .from("product-images")
            .copy(originalPath, newPath)

          if (copyError) {
            console.error(`Error copying image ${originalPath}:`, copyError)
            continue // Skip this image but continue with others
          }

          // Add the new image to the array
          newImages.push({
            product_id: newProduct.id,
            image_url: newPath,
            position: image.position,
          })
        } catch (err) {
          console.error(`Error during image duplication for ${originalPath}:`, err)
        }
      }

      // Insert all the new images
      if (newImages.length > 0) {
        const { error: imageInsertError } = await supabase.from("product_images").insert(newImages)

        if (imageInsertError) {
          console.error("Error inserting duplicate images:", imageInsertError)
          // Continue even if image insertion fails
        }
      }
    }

    // Revalidate the products page to ensure fresh data
    revalidatePath("/admin/products")

    return NextResponse.json({
      success: true,
      message: "Product duplicated successfully",
      product: newProduct,
    })
  } catch (error) {
    console.error("Error in POST /api/admin/products/[id]/duplicate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
