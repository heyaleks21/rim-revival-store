"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { formatPrice } from "@/lib/utils"
import { SupabaseImage } from "@/components/supabase-image"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, CheckCircle2, MoreHorizontal, Pencil, DollarSign, Trash2, Copy, Check } from "lucide-react"
import type { Product } from "@/lib/types"

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products: initialProducts }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [sortField, setSortField] = useState<keyof Product>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [loading, setLoading] = useState<{
    [key: string]: { stock?: boolean; featured?: boolean; duplicate?: boolean }
  }>({})
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [productToMarkSold, setProductToMarkSold] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMarkingSold, setIsMarkingSold] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSoldDialogOpen, setIsSoldDialogOpen] = useState(false)
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false)
  const [processingStep, setProcessingStep] = useState<string>("")
  const [processingComplete, setProcessingComplete] = useState(false)
  const [isDeleteProcessingDialogOpen, setIsDeleteProcessingDialogOpen] = useState(false)
  const [deleteProcessingStep, setDeleteProcessingStep] = useState<string>("")
  const [deleteProcessingComplete, setDeleteProcessingComplete] = useState(false)
  const [isDuplicateProcessingDialogOpen, setIsDuplicateProcessingDialogOpen] = useState(false)
  const [duplicateProcessingStep, setDuplicateProcessingStep] = useState<string>("")
  const [duplicateProcessingComplete, setDuplicateProcessingComplete] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  const [bulkProcessingStep, setBulkProcessingStep] = useState<string>("")
  const [isBulkProcessingDialogOpen, setIsBulkProcessingDialogOpen] = useState(false)
  const [bulkProcessingComplete, setBulkProcessingComplete] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>("")

  // New state for tracking if any toggle action is in progress
  const [isToggleActionInProgress, setIsToggleActionInProgress] = useState(false)
  const [toggleActionMessage, setToggleActionMessage] = useState<string>("")

  // Effect to handle body scroll locking when overlay is active
  useEffect(() => {
    if (isToggleActionInProgress) {
      // Prevent scrolling on the body when overlay is active
      document.body.style.overflow = "hidden"
    } else {
      // Re-enable scrolling when overlay is removed
      document.body.style.overflow = ""
    }

    // Cleanup function to ensure scroll is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = ""
    }
  }, [isToggleActionInProgress])

  const sortedProducts = [...products].sort((a, b) => {
    const fieldA = a[sortField]
    const fieldB = b[sortField]

    if (fieldA === null) return sortDirection === "asc" ? -1 : 1
    if (fieldB === null) return sortDirection === "asc" ? 1 : -1

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
    }

    // Handle numeric or date comparison
    const numA = fieldA instanceof Date ? fieldA.getTime() : Number(fieldA)
    const numB = fieldB instanceof Date ? fieldB.getTime() : Number(fieldB)

    return sortDirection === "asc" ? numA - numB : numB - numA
  })

  const handleSort = (field: keyof Product) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: keyof Product) => {
    if (field !== sortField) return null
    return sortDirection === "asc" ? " ↑" : " ↓"
  }

  const toggleProductStatus = async (productId: string, field: "in_stock" | "featured", currentValue: boolean) => {
    // Set loading state for this specific toggle
    setLoading((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: true },
    }))

    // Set global toggle action in progress state
    setIsToggleActionInProgress(true)
    setToggleActionMessage(`Updating ${field === "in_stock" ? "stock status" : "featured status"}...`)

    try {
      const response = await fetch(`/api/admin/products/${productId}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field,
          value: !currentValue,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update product status")
      }

      // Update local state to reflect the change
      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.id === productId ? { ...product, [field]: !currentValue } : product)),
      )

      // Dispatch event for product status change with more details
      const statusChangeEvent = new CustomEvent("product-status-changed", {
        detail: {
          productId,
          field,
          newValue: !currentValue,
        },
      })
      window.dispatchEvent(statusChangeEvent)

      toast({
        title: "Success",
        description: `Product ${field === "in_stock" ? "stock status" : "featured status"} updated`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating product status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product status",
        variant: "destructive",
      })
    } finally {
      // Clear loading state
      setLoading((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], [field]: false },
      }))

      // Clear global toggle action in progress state
      setIsToggleActionInProgress(false)
    }
  }

  const confirmDelete = (productId: string) => {
    setProductToDelete(productId)
    setIsDeleteDialogOpen(true)
  }

  const confirmMarkSold = (productId: string) => {
    setProductToMarkSold(productId)
    setIsSoldDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    setIsDeleteDialogOpen(false)
    setIsDeleteProcessingDialogOpen(true)
    setIsDeleting(true)
    setDeleteProcessingStep("Removing product data...")
    setDeleteProcessingComplete(false)

    try {
      // Short delay to show the first step
      await new Promise((resolve) => setTimeout(resolve, 800))

      const response = await fetch(`/api/admin/products/${productToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      // Show processing steps with delays to provide feedback
      setDeleteProcessingStep("Removing product images...")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setDeleteProcessingStep("Updating catalog...")
      await new Promise((resolve) => setTimeout(resolve, 800))

      setDeleteProcessingStep("Finalizing...")
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Mark as complete
      setDeleteProcessingComplete(true)

      // Remove the product from the local state
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productToDelete))

      // Dispatch event for product deletion
      window.dispatchEvent(new Event("product-deleted"))

      // Show success message after a short delay
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })

        // Close the processing dialog
        setIsDeleteProcessingDialogOpen(false)
      }, 1200)
    } catch (error) {
      console.error("Error deleting product:", error)
      setIsDeleteProcessingDialogOpen(false)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  const handleMarkSold = async () => {
    if (!productToMarkSold) return

    setIsSoldDialogOpen(false)
    setIsProcessingDialogOpen(true)
    setIsMarkingSold(true)
    setProcessingStep("Archiving product data...")
    setProcessingComplete(false)

    try {
      // Short delay to show the first step
      await new Promise((resolve) => setTimeout(resolve, 800))

      const response = await fetch(`/api/admin/products/${productToMarkSold}/mark-sold`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to mark product as sold")
      }

      // Show processing steps with delays to provide feedback
      setProcessingStep("Removing product images...")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setProcessingStep("Updating sales analytics...")
      await new Promise((resolve) => setTimeout(resolve, 800))

      setProcessingStep("Finalizing...")
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Mark as complete
      setProcessingComplete(true)

      // Remove the product from the local state
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productToMarkSold))

      // Dispatch event for product marked as sold
      window.dispatchEvent(new Event("product-marked-sold"))

      // Show success message after a short delay
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Product marked as sold and archived",
        })

        // Close the processing dialog
        setIsProcessingDialogOpen(false)
      }, 1200)
    } catch (error) {
      console.error("Error marking product as sold:", error)
      setIsProcessingDialogOpen(false)
      toast({
        title: "Error",
        description: "Failed to mark product as sold",
        variant: "destructive",
      })
    } finally {
      setIsMarkingSold(false)
      setProductToMarkSold(null)
    }
  }

  const handleDuplicate = async (productId: string) => {
    // Store the productId for reference in finally block
    const currentProductId = productId

    // Set loading state for this specific product
    setLoading((prev) => ({
      ...prev,
      [currentProductId]: { ...prev[currentProductId], duplicate: true },
    }))

    setIsDuplicateProcessingDialogOpen(true)
    setDuplicateProcessingStep("Copying product data...")
    setDuplicateProcessingComplete(false)

    try {
      // Short delay to show the first step
      await new Promise((resolve) => setTimeout(resolve, 800))

      const response = await fetch(`/api/admin/products/${currentProductId}/duplicate`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to duplicate product")
      }

      const result = await response.json()

      // Show processing steps with delays to provide feedback
      setDuplicateProcessingStep("Duplicating product images...")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setDuplicateProcessingStep("Updating catalog...")
      await new Promise((resolve) => setTimeout(resolve, 800))

      setDuplicateProcessingStep("Finalizing...")
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Mark as complete
      setDuplicateProcessingComplete(true)

      // Add the new product to the local state
      if (result && result.product && result.product.id) {
        try {
          // Fetch the complete product with images
          const productResponse = await fetch(`/api/admin/products/${result.product.id}`)
          if (productResponse.ok) {
            const productData = await productResponse.json()
            if (productData && productData.product) {
              setProducts((prevProducts) => [productData.product, ...prevProducts])
            } else {
              // Fallback to just adding the basic product data
              setProducts((prevProducts) => [result.product, ...prevProducts])
            }
          } else {
            // Fallback to just adding the basic product data
            setProducts((prevProducts) => [result.product, ...prevProducts])
          }
        } catch (fetchError) {
          console.error("Error fetching complete product data:", fetchError)
          // Still add the basic product data we have
          setProducts((prevProducts) => [result.product, ...prevProducts])
        }
      } else {
        console.warn("Duplicate product response did not contain expected product data:", result)
      }

      // Dispatch event for product duplication
      window.dispatchEvent(new Event("product-duplicated"))

      // Show success message after a short delay
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Product duplicated successfully",
        })

        // Close the processing dialog
        setIsDuplicateProcessingDialogOpen(false)
      }, 1200)
    } catch (error) {
      console.error("Error duplicating product:", error)
      setIsDuplicateProcessingDialogOpen(false)
      toast({
        title: "Error",
        description: "Failed to duplicate product",
        variant: "destructive",
      })
    } finally {
      // Clear loading state using the stored productId
      setLoading((prev) => ({
        ...prev,
        [currentProductId]: { ...prev[currentProductId], duplicate: false },
      }))
    }
  }

  const cancelDelete = () => {
    setProductToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  const cancelMarkSold = () => {
    setProductToMarkSold(null)
    setIsSoldDialogOpen(false)
  }

  // Check if any action is in progress for a product
  const isActionInProgress = (productId: string) => {
    const productLoading = loading[productId] || {}
    return (
      productLoading.stock ||
      productLoading.featured ||
      productLoading.duplicate ||
      (isDeleting && productToDelete === productId) ||
      (isMarkingSold && productToMarkSold === productId) ||
      isBulkProcessing
    )
  }

  // Handle checkbox selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  // Select/deselect all products
  const toggleSelectAll = () => {
    if (selectedProducts.length === sortedProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(sortedProducts.map((product) => product.id))
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product to perform this action",
        variant: "destructive",
      })
      return
    }

    setBulkAction(action)
    setIsBulkProcessing(true)
    setIsBulkProcessingDialogOpen(true)
    setBulkProcessingStep(`Processing ${selectedProducts.length} products...`)
    setBulkProcessingComplete(false)

    try {
      let successCount = 0
      let errorCount = 0
      let updatedProducts = [...products]

      // Process each selected product
      for (let i = 0; i < selectedProducts.length; i++) {
        const productId = selectedProducts[i]
        setBulkProcessingStep(`Processing product ${i + 1} of ${selectedProducts.length}...`)

        try {
          if (action === "duplicate") {
            // Duplicate product
            const response = await fetch(`/api/admin/products/${productId}/duplicate`, {
              method: "POST",
            })

            if (!response.ok) {
              throw new Error(`Failed to duplicate product ${productId}`)
            }

            const result = await response.json()

            // Add the new product to our updated list
            if (result && result.product && result.product.id) {
              try {
                // Fetch the complete product with images
                const productResponse = await fetch(`/api/admin/products/${result.product.id}`)
                if (productResponse.ok) {
                  const productData = await productResponse.json()
                  if (productData && productData.product) {
                    updatedProducts = [productData.product, ...updatedProducts]
                  } else {
                    // Fallback to just adding the basic product data
                    updatedProducts = [result.product, ...updatedProducts]
                  }
                } else {
                  // Fallback to just adding the basic product data
                  updatedProducts = [result.product, ...updatedProducts]
                }
              } catch (fetchError) {
                console.error("Error fetching complete product data:", fetchError)
                // Still add the basic product data we have
                updatedProducts = [result.product, ...updatedProducts]
              }
              successCount++
            } else {
              throw new Error(`Invalid response format for product ${productId}`)
            }
          } else if (action === "delete") {
            // Delete product
            const response = await fetch(`/api/admin/products/${productId}`, {
              method: "DELETE",
            })

            if (!response.ok) {
              throw new Error(`Failed to delete product ${productId}`)
            }

            // Remove from our updated list
            updatedProducts = updatedProducts.filter((product) => product.id !== productId)
            successCount++
          } else if (action === "mark-sold") {
            // Only process rims for mark-sold
            const product = products.find((p) => p.id === productId)
            if (product?.category !== "rim") {
              continue
            }

            // Mark product as sold
            const response = await fetch(`/api/admin/products/${productId}/mark-sold`, {
              method: "POST",
            })

            if (!response.ok) {
              throw new Error(`Failed to mark product ${productId} as sold`)
            }

            // Remove from our updated list
            updatedProducts = updatedProducts.filter((product) => product.id !== productId)
            successCount++
          } else if (action === "toggle-stock") {
            // Toggle in_stock status
            const product = products.find((p) => p.id === productId)
            if (!product) continue

            const response = await fetch(`/api/admin/products/${productId}/toggle-status`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                field: "in_stock",
                value: !product.in_stock,
              }),
            })

            if (!response.ok) {
              throw new Error(`Failed to update stock status for product ${productId}`)
            }

            // Update in our list
            updatedProducts = updatedProducts.map((p) => (p.id === productId ? { ...p, in_stock: !p.in_stock } : p))
            successCount++
          } else if (action === "toggle-featured") {
            // Toggle featured status
            const product = products.find((p) => p.id === productId)
            if (!product) continue

            const response = await fetch(`/api/admin/products/${productId}/toggle-status`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                field: "featured",
                value: !product.featured,
              }),
            })

            if (!response.ok) {
              throw new Error(`Failed to update featured status for product ${productId}`)
            }

            // Update in our list
            updatedProducts = updatedProducts.map((p) => (p.id === productId ? { ...p, featured: !p.featured } : p))
            successCount++
          }
        } catch (error) {
          console.error(`Error processing product ${productId}:`, error)
          errorCount++
        }

        // Add a small delay between operations to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      // Update the products state with our processed list
      setProducts(updatedProducts)

      // Mark as complete
      setBulkProcessingComplete(true)
      setBulkProcessingStep(
        `Completed: ${successCount} products processed successfully${errorCount > 0 ? `, ${errorCount} failed` : ""}`,
      )

      // Clear selected products
      setSelectedProducts([])

      // Dispatch event for product changes
      window.dispatchEvent(new Event("products-updated"))

      // Show success message after a short delay
      setTimeout(() => {
        toast({
          title: "Bulk Action Complete",
          description: `${successCount} products processed successfully${
            errorCount > 0 ? `, ${errorCount} failed` : ""
          }`,
        })

        // Close the processing dialog
        setIsBulkProcessingDialogOpen(false)
      }, 1500)
    } catch (error) {
      console.error("Error in bulk processing:", error)
      setIsBulkProcessingDialogOpen(false)
      toast({
        title: "Error",
        description: "Failed to complete bulk action",
        variant: "destructive",
      })
    } finally {
      setIsBulkProcessing(false)
    }
  }

  // Get action label based on the action type
  const getBulkActionLabel = (action: string) => {
    switch (action) {
      case "duplicate":
        return "Duplicating Products"
      case "delete":
        return "Deleting Products"
      case "mark-sold":
        return "Marking Products as Sold"
      case "toggle-stock":
        return "Updating Stock Status"
      case "toggle-featured":
        return "Updating Featured Status"
      default:
        return "Processing Products"
    }
  }

  return (
    <>
      {/* Full-screen overlay for toggle actions */}
      {isToggleActionInProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-6 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-center font-medium">{toggleActionMessage}</p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Please wait while we update the product status...
            </p>
          </div>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {selectedProducts.length} of {products.length} selected
          </span>
        </div>
        {selectedProducts.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isBulkProcessing}>
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkAction("duplicate")} className="flex items-center">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("toggle-stock")} className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Toggle Stock Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("toggle-featured")} className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Toggle Featured Status
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBulkAction("mark-sold")}
                className="flex items-center text-green-600"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Mark as Sold (Rims Only)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="flex items-center text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all products"
                  disabled={isBulkProcessing}
                />
              </TableHead>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                Name {getSortIcon("title")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                Price {getSortIcon("price")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                Category {getSortIcon("category")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("in_stock")}>
                In Stock {getSortIcon("in_stock")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("featured")}>
                Featured {getSortIcon("featured")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
                Created {getSortIcon("created_at")}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      aria-label={`Select ${product.title}`}
                      disabled={isActionInProgress(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {product.product_images && product.product_images.length > 0 ? (
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        <SupabaseImage
                          path={product.product_images[0].image_url}
                          alt={product.title || "Product image"}
                          className="h-full w-full object-cover"
                          size="thumbnail"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500">
                        No img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <Switch
                      checked={!!product.in_stock}
                      disabled={loading[product.id]?.stock || isActionInProgress(product.id)}
                      onCheckedChange={() => toggleProductStatus(product.id, "in_stock", !!product.in_stock)}
                      aria-label={`Toggle in stock status for ${product.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={!!product.featured}
                      disabled={loading[product.id]?.featured || isActionInProgress(product.id)}
                      onCheckedChange={() => toggleProductStatus(product.id, "featured", !!product.featured)}
                      aria-label={`Toggle featured status for ${product.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    {product.created_at ? new Date(product.created_at).toLocaleDateString() : "Unknown"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isActionInProgress(product.id)}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(product.id)}
                          className="flex items-center"
                          disabled={loading[product.id]?.duplicate}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {product.category === "rim" && (
                          <DropdownMenuItem
                            onClick={() => confirmMarkSold(product.id)}
                            className="flex items-center text-green-600"
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Mark Sold
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => confirmDelete(product.id)}
                          className="flex items-center text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete the product listing?</AlertDialogTitle>
            <AlertDialogDescription>
              The product will be removed from the catalog, this cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Processing..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark as Sold Confirmation Dialog */}
      <AlertDialog open={isSoldDialogOpen} onOpenChange={setIsSoldDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark this rim as sold?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the product listing and save key information for sales analytics. The product will be
              removed from the catalog, but sales data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelMarkSold}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkSold}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isMarkingSold}
            >
              {isMarkingSold ? "Processing..." : "Mark as Sold"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Processing Dialog */}
      <AlertDialog open={isProcessingDialogOpen} onOpenChange={() => {}}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{processingComplete ? "Process Complete" : "Processing Sale"}</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {processingComplete ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Product has been marked as sold and all data has been processed successfully.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-center font-medium">{processingStep}</p>
                <p className="text-center text-sm text-muted-foreground">
                  Please wait while we process this sale and update analytics.
                </p>
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Processing Dialog */}
      <AlertDialog open={isDeleteProcessingDialogOpen} onOpenChange={() => {}}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteProcessingComplete ? "Process Complete" : "Processing Deletion"}</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {deleteProcessingComplete ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Product has been deleted successfully and all data has been processed.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-center font-medium">{deleteProcessingStep}</p>
                <p className="text-center text-sm text-muted-foreground">Please wait while we process this deletion.</p>
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Processing Dialog */}
      <AlertDialog open={isDuplicateProcessingDialogOpen} onOpenChange={() => {}}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {duplicateProcessingComplete ? "Process Complete" : "Processing Duplication"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {duplicateProcessingComplete ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Product has been duplicated successfully with all images and data.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-center font-medium">{duplicateProcessingStep}</p>
                <p className="text-center text-sm text-muted-foreground">
                  Please wait while we create a duplicate of this product.
                </p>
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Processing Dialog */}
      <AlertDialog open={isBulkProcessingDialogOpen} onOpenChange={() => {}}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkProcessingComplete ? "Process Complete" : getBulkActionLabel(bulkAction)}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {bulkProcessingComplete ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-center font-medium">{bulkProcessingStep}</p>
                <p className="text-center text-sm text-muted-foreground">Bulk operation completed successfully.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-center font-medium">{bulkProcessingStep}</p>
                <p className="text-center text-sm text-muted-foreground">
                  Please wait while we process the selected products.
                </p>
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
