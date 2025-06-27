import { Suspense } from "react"
import { ProductsContent } from "@/components/admin/products/products-content"

// Add cache control to prevent caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Removed ProductsHeader component */}
      <Suspense fallback={<div className="p-8 text-center">Loading products...</div>}>
        <ProductsContent />
      </Suspense>
    </div>
  )
}
