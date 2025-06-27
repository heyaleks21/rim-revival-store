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
    const productId = params.id

    // Get the product data before deleting
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", productId)
      .single()

    if (fetchError || !product) {
      console.error("Error fetching product:", fetchError)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Only allow rim category products to be marked as sold
    if (product.category !== "rim") {
      return NextResponse.json({ error: "Only rim products can be marked as sold" }, { status: 400 })
    }

    // Extract the data we want to keep
    const soldProductData = {
      original_product_id: product.id,
      title: product.title,
      brand: product.vehicle_brand || product.custom_brand || "Unknown",
      rim_size: product.rim_size || "Unknown",
      price: product.price,
      category: product.category,
    }

    // Insert into sold_products table
    const { error: insertError } = await supabase.from("sold_products").insert(soldProductData)

    if (insertError) {
      console.error("Error inserting sold product data:", insertError)
      return NextResponse.json({ error: "Failed to archive product data" }, { status: 500 })
    }

    // Delete product images from storage and database
    if (product.product_images && product.product_images.length > 0) {
      // First, delete the image files from storage
      for (const image of product.product_images) {
        // Extract the path from the full URL
        const imagePath = image.image_url

        if (imagePath) {
          try {
            // Delete the image from storage
            const { error: storageError } = await supabase.storage.from("product-images").remove([imagePath])

            if (storageError) {
              console.error(`Error deleting image file ${imagePath}:`, storageError)
              // Continue with other images even if one fails
            }
          } catch (err) {
            console.error(`Error during storage deletion for ${imagePath}:`, err)
          }
        }
      }

      // Then delete the image records from the database
      const { error: imageDeleteError } = await supabase.from("product_images").delete().eq("product_id", productId)

      if (imageDeleteError) {
        console.error("Error deleting product image records:", imageDeleteError)
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete the product
    const { error: deleteError } = await supabase.from("products").delete().eq("id", productId)

    if (deleteError) {
      console.error("Error deleting product:", deleteError)
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }

    // Revalidate all relevant paths to ensure fresh data
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/products")

    return NextResponse.json(
      {
        success: true,
        message: "Product marked as sold and archived",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Error marking product as sold:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
