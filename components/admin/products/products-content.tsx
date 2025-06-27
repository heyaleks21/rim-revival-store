import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { ProductsClient } from "@/components/admin/products/products-client"

export async function ProductsContent() {
  // Fetch initial products on the server for faster initial render
  const supabase = createServerClient()
  const { data: initialProducts, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching initial products:", error)
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-red-500">
        Error loading products: {error.message}
      </div>
    )
  }

  if (!initialProducts || initialProducts.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        No products found. Add your first product to get started.
      </div>
    )
  }

  // Pass initial products to ProductsClient, but it will fetch its own fresh data
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading products...</div>}>
      <ProductsClient initialProducts={initialProducts} />
    </Suspense>
  )
}
