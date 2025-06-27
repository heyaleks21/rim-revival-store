import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Update the PUT function to handle imagesToDelete separately
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Check admin session
  const sessionCheck = await checkAdminSession()
  if (!sessionCheck.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createServerClient()
    const { id } = params
    const data = await request.json()

    // Extract image data and imagesToDelete
    const { images, imagesToDelete, ...productData } = data

    // Process center_bore value - convert "None" to null
    if (productData.center_bore === "None") {
      productData.center_bore = null
    }

    // Update product
    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Handle image updates
    if (images) {
      // First, delete all existing product images from the database
      const { error: deleteError } = await supabase.from("product_images").delete().eq("product_id", id)

      if (deleteError) {
        console.error("Error deleting existing product images:", deleteError)
        // Continue with the update even if there's an error
      }

      // Then insert the new images
      if (images.length > 0) {
        const productImages = images.map((image: any, index: number) => ({
          product_id: id,
          image_url: image.image_url,
          position: index,
        }))

        const { error: insertError } = await supabase.from("product_images").insert(productImages)

        if (insertError) {
          console.error("Error inserting updated product images:", insertError)
          // Continue with the update even if there's an error
        }
      }
    }

    // Handle image deletions if any
    if (imagesToDelete && imagesToDelete.length > 0) {
      try {
        // Delete images from storage
        for (const imageUrl of imagesToDelete) {
          const response = await fetch("/api/admin/delete-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageUrl }),
          })

          if (!response.ok) {
            console.error(`Failed to delete image: ${imageUrl}`)
          }
        }
      } catch (deleteError) {
        console.error("Error deleting images:", deleteError)
        // Don't fail the request if image deletion fails
      }
    }

    // Revalidate the products page to ensure fresh data
    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${id}`)
    revalidatePath("/admin/dashboard")

    return NextResponse.json(
      {
        success: true,
        product: updatedProduct,
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
    console.error("Error in PUT /api/admin/products/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Check admin session
  const sessionCheck = await checkAdminSession()
  if (!sessionCheck.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("products").select("*, product_images(*)").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/admin/products/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Check admin session
  const sessionCheck = await checkAdminSession()
  if (!sessionCheck.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createServerClient()
    console.log("Deleting product with ID:", params.id)

    // First, get the product with its images
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      console.error("Error fetching product for deletion:", fetchError)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete product images from storage and database
    if (product.product_images && product.product_images.length > 0) {
      // First, delete the image files from storage
      for (const image of product.product_images) {
        // Get the image path directly from the database
        const imagePath = image.image_url

        if (imagePath) {
          try {
            // Delete the image from storage
            const { error: storageError } = await supabase.storage.from("product-images").remove([imagePath])

            if (storageError) {
              console.error(`Error deleting image file ${imagePath}:`, storageError)
              // Continue with other images even if one fails
            } else {
              console.log(`Successfully deleted image from storage: ${imagePath}`)
            }
          } catch (err) {
            console.error(`Error during storage deletion for ${imagePath}:`, err)
          }
        }
      }

      // Then delete the image records from the database
      const { error: imageDeleteError } = await supabase.from("product_images").delete().eq("product_id", params.id)

      if (imageDeleteError) {
        console.error("Error deleting product image records:", imageDeleteError)
        // Continue with product deletion even if image deletion fails
      } else {
        console.log("Successfully deleted product image records from database")
      }
    }

    // Finally delete the product
    const { error: deleteError } = await supabase.from("products").delete().eq("id", params.id)

    if (deleteError) {
      console.error("Error deleting product:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Revalidate the products page to ensure fresh data
    revalidatePath("/admin/products")

    console.log("Successfully deleted product:", params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/products/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
