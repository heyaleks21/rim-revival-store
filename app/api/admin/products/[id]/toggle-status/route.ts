import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { checkAdminSession } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Check admin session
  const sessionCheck = await checkAdminSession()
  if (!sessionCheck.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { field, value } = await request.json()

    // Validate field - only allow toggling in_stock and featured
    if (field !== "in_stock" && field !== "featured") {
      return NextResponse.json(
        { error: "Invalid field. Only 'in_stock' and 'featured' can be toggled." },
        { status: 400 },
      )
    }

    // Validate value type
    if (typeof value !== "boolean") {
      return NextResponse.json({ error: "Invalid value. Must be a boolean." }, { status: 400 })
    }

    const supabase = createServerClient()

    // Update the product
    const { data, error } = await supabase
      .from("products")
      .update({ [field]: value })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating product ${field}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Product ${field} updated successfully`,
      product: data,
    })
  } catch (error) {
    console.error(`Error in PATCH /api/admin/products/[id]/toggle-status:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
