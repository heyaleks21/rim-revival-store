import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Modify the POST function to handle imagesToDelete separately
export async function POST(request: NextRequest) {
  // Check admin session
  const sessionCheck = await checkAdminSession()
  if (!sessionCheck.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createServerClient()
    const data = await request.json()

    // Extract image data and imagesToDelete
    const { images, imagesToDelete, ...productData } = data

    // Log the product data for debugging
    console.log("Product data to insert:", productData)

    // Process center_bore value - convert "None" to null
    if (productData.center_bore === "None") {
      productData.center_bore = null
    }

    // Insert product directly without filtering fields
    const { data: product, error } = await supabase.from("products").insert([productData]).select().single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If there are images, insert them
    if (images && images.length > 0) {
      const productImages = images.map((image: any, index: number) => ({
        product_id: product.id,
        image_url: image.image_url,
        position: index,
      }))

      const { error: imageError } = await supabase.from("product_images").insert(productImages)

      if (imageError) {
        console.error("Error inserting product images:", imageError)
        // Don't fail the request if image insertion fails
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
    revalidatePath("/admin/dashboard")

    return NextResponse.json(
      {
        success: true,
        product,
        event: "product-created", // Include event name for client-side handling
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
    console.error("Error in POST /api/admin/products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Check admin session
  const sessionCheck = await checkAdminSession()
  if (!sessionCheck.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("products").select("*, product_images(*)")

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error in GET /api/admin/products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
