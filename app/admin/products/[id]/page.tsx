import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/products/product-form"
import type { Product } from "@/lib/types"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params
  const isNewProduct = id === "new"

  let product: Product | null = null

  if (!isNewProduct) {
    const supabase = createServerClient()
    const { data, error } = await supabase.from("products").select("*, product_images(*)").eq("id", id).single()

    if (error || !data) {
      notFound()
    }

    product = data
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{isNewProduct ? "Add New Product" : "Edit Product"}</h1>

      <ProductForm product={product} />
    </div>
  )
}
