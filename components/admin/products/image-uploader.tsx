"use client"

import React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import type { ProductImage } from "@/lib/types"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { SupabaseImage } from "@/components/supabase-image"

interface ImageUploaderProps {
  productId?: string
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  onUploadStatusChange?: (isUploading: boolean) => void
  deferUpload?: boolean
  pendingFiles: File[]
  setPendingFiles: (files: File[]) => void
  isEditing?: boolean
}

// Helper function to compress images
async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Draw image to canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height)

        // Get file extension
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpeg"
        const mimeType = fileExt === "png" ? "image/png" : "image/jpeg"

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create blob"))
              return
            }

            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            })

            resolve(compressedFile)
          },
          mimeType,
          quality,
        )
      }
      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }
    }
    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }
  })
}

export const ImageUploader = React.forwardRef<
  {
    uploadPendingFiles: () => Promise<ProductImage[]>
    getImagesToDelete: () => string[]
  },
  ImageUploaderProps
>(
  (
    {
      productId,
      images,
      onChange,
      onUploadStatusChange,
      deferUpload = false,
      pendingFiles = [],
      setPendingFiles = () => {},
      isEditing = false,
    },
    ref,
  ) => {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const supabase = getSupabaseClient()
    const [isLoading, setIsLoading] = useState(false)
    const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null)

    // Track images marked for deletion (only used in edit mode)
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      // Check if we already have 6 images
      if (images.length >= 6) {
        toast({
          title: "Upload limit reached",
          description: "You can only upload up to 6 images per product",
          variant: "destructive",
        })
        return
      }

      // Check if the number of new files would exceed the limit
      if (images.length + files.length > 6) {
        toast({
          title: "Upload limit exceeded",
          description: `You can only upload ${6 - images.length} more images`,
          variant: "destructive",
        })
        return
      }

      // Always defer upload for both new and editing products
      // Store files for later upload
      const newPendingFiles = [...pendingFiles]
      for (let i = 0; i < files.length; i++) {
        newPendingFiles.push(files[i])
      }
      setPendingFiles(newPendingFiles)

      // Create temporary preview images
      const newImages: ProductImage[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const previewUrl = URL.createObjectURL(file)

        newImages.push({
          id: `temp-${crypto.randomUUID()}`,
          product_id: productId || "",
          image_url: previewUrl,
          position: images.length + i,
          created_at: new Date().toISOString(),
          isPending: true, // Mark as pending
          file: file, // Store the file reference
        })
      }

      onChange([...images, ...newImages])

      // Reset file input
      e.target.value = ""
    }

    const handleRemoveImage = useCallback(
      async (index: number) => {
        const imageToRemove = images[index]
        setIsLoading(true)
        setDeletingImageIndex(index)

        try {
          // If it's a pending image with a local preview URL
          if (imageToRemove.isPending) {
            // Remove from pending files array
            const newPendingFiles = [...pendingFiles]
            // Find the corresponding file in pendingFiles
            if (imageToRemove.file) {
              const fileIndex = newPendingFiles.findIndex(
                (f) => f.name === imageToRemove.file?.name && f.size === imageToRemove.file?.size,
              )
              if (fileIndex !== -1) {
                newPendingFiles.splice(fileIndex, 1)
                setPendingFiles(newPendingFiles)
              }
            }

            // Revoke the object URL to prevent memory leaks
            if (imageToRemove.image_url && imageToRemove.image_url.startsWith("blob:")) {
              URL.revokeObjectURL(imageToRemove.image_url)
            }

            // Remove from images array
            const newImages = [...images]
            newImages.splice(index, 1)

            // Update positions
            const updatedImages = newImages.map((img, idx) => ({
              ...img,
              position: idx,
            }))

            onChange(updatedImages)

            toast({
              title: "Image removed",
              description: "The pending image has been removed",
            })

            return
          }

          // For existing images in edit mode, mark for deletion but don't delete from storage yet
          if (isEditing && imageToRemove.id && !imageToRemove.isPending) {
            // Add to the list of images to delete when the form is submitted
            if (imageToRemove.image_url) {
              setImagesToDelete((prev) => [...prev, imageToRemove.image_url])
            }

            // Remove from the visible array
            const newImages = [...images]
            newImages.splice(index, 1)

            // Update positions
            const updatedImages = newImages.map((img, idx) => ({
              ...img,
              position: idx,
            }))

            onChange(updatedImages)

            toast({
              title: "Image marked for removal",
              description: "The image will be removed when you save the product",
            })
            return
          }

          // For new products or non-edit mode, delete immediately
          setIsUploading(true)
          if (onUploadStatusChange) onUploadStatusChange(true)

          console.log("Attempting to remove image:", imageToRemove)

          // If the image has a URL/path, delete it from storage
          if (imageToRemove.image_url) {
            console.log("Deleting image from storage:", imageToRemove.image_url)

            // Use the server-side API to delete the image
            const response = await fetch("/api/admin/delete-image", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                path: imageToRemove.image_url,
                fullUrl: typeof imageToRemove.image_url === "string" && imageToRemove.image_url.includes("http"),
              }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              console.error("Server returned error when deleting image:", errorData)
              throw new Error(errorData.error || "Failed to delete image from storage")
            }

            console.log("Image successfully deleted from storage")
          }

          // After successful deletion, update the state
          const newImages = [...images]
          newImages.splice(index, 1)

          // Update positions
          const updatedImages = newImages.map((img, idx) => ({
            ...img,
            position: idx,
          }))

          onChange(updatedImages)

          toast({
            title: "Image removed",
            description: "The image has been removed from the product and storage",
          })
        } catch (error) {
          console.error("Error removing image:", error)
          toast({
            title: "Error",
            description: "Failed to remove image. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
          setDeletingImageIndex(null)
          setIsUploading(false)
          if (onUploadStatusChange) onUploadStatusChange(false)
        }
      },
      [images, pendingFiles, setPendingFiles, onChange, isEditing, onUploadStatusChange],
    )

    const moveImage = (index: number, direction: "up" | "down") => {
      if ((direction === "up" && index === 0) || (direction === "down" && index === images.length - 1)) {
        return
      }

      const newImages = [...images]
      const newIndex = direction === "up" ? index - 1 : index + 1

      // Swap images
      ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]

      // Update positions
      const updatedImages = newImages.map((img, idx) => ({
        ...img,
        position: idx,
      }))

      onChange(updatedImages)
    }

    // Add a new function to upload pending files
    const uploadPendingFiles = async (): Promise<ProductImage[]> => {
      if (pendingFiles.length === 0) return []

      setIsUploading(true)
      if (onUploadStatusChange) onUploadStatusChange(true)

      try {
        const uploadedImages: ProductImage[] = []
        const totalFiles = pendingFiles.length
        let processedFiles = 0

        for (let i = 0; i < pendingFiles.length; i++) {
          const file = pendingFiles[i]

          // Update progress for compression step
          setUploadProgress((processedFiles / (totalFiles * 2)) * 100)

          // Compress the image before uploading
          const compressedFile = await compressImage(file)
          processedFiles++

          // Update progress after compression
          setUploadProgress((processedFiles / (totalFiles * 2)) * 100)

          const fileExt = file.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

          // Always store in staging folder regardless of whether we have a productId
          const filePath = `staging/${fileName}`

          // Create form data for the file upload
          const formData = new FormData()
          formData.append("file", compressedFile)
          formData.append("path", filePath)

          // Upload using our server-side API
          const response = await fetch("/api/admin/upload-to-storage", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to upload file")
          }

          const data = await response.json()

          // Store the path directly for new uploads
          uploadedImages.push({
            id: crypto.randomUUID(),
            product_id: productId || "",
            image_url: filePath,
            position: i,
            created_at: new Date().toISOString(),
          })

          // Update progress for upload step
          processedFiles++
          setUploadProgress((processedFiles / (totalFiles * 2)) * 100)
        }

        return uploadedImages
      } catch (error) {
        console.error("Error uploading pending images:", error)
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload images",
          variant: "destructive",
        })
        throw error
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
        if (onUploadStatusChange) onUploadStatusChange(false)
      }
    }

    // Function to get the list of images to delete
    const getImagesToDelete = useCallback(() => {
      return imagesToDelete
    }, [imagesToDelete])

    // Expose the uploadPendingFiles function and getImagesToDelete
    React.useImperativeHandle(
      ref,
      () => ({
        uploadPendingFiles,
        getImagesToDelete,
      }),
      [pendingFiles, productId, getImagesToDelete],
    )

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {images.map((image, index) => (
            <div key={image.id || index} className="group relative aspect-square overflow-hidden rounded-md border">
              <div className="relative h-full w-full">
                {image.isPending ? (
                  // Show local preview for pending images
                  <img
                    src={image.image_url || "/placeholder.svg"}
                    alt={`Product image ${index + 1} (pending upload)`}
                    className={`w-full h-full object-cover ${deletingImageIndex === index ? "opacity-50" : ""}`}
                  />
                ) : (
                  // Show Supabase image for uploaded images
                  <SupabaseImage
                    path={image.image_url}
                    alt={`Product image ${index + 1}`}
                    className={`w-full h-full object-cover ${deletingImageIndex === index ? "opacity-50" : ""}`}
                  />
                )}
                {deletingImageIndex === index && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
                {image.isPending && <div className="absolute inset-0 bg-black/5"></div>}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isLoading || deletingImageIndex !== null}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveImage(index, "up")}
                    disabled={index === 0 || isLoading || deletingImageIndex !== null}
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span className="sr-only">Move up</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveImage(index, "down")}
                    disabled={index === images.length - 1 || isLoading || deletingImageIndex !== null}
                  >
                    <ArrowDown className="h-4 w-4" />
                    <span className="sr-only">Move down</span>
                  </Button>
                </div>
              </div>
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary/80 py-1 text-center text-xs text-white">
                  Main Image
                </div>
              )}
            </div>
          ))}

          {images.length < 6 && (
            <div className="relative aspect-square rounded-md border border-dashed">
              <label
                htmlFor="image-upload"
                className={cn(
                  "flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-muted-foreground",
                  isUploading && "pointer-events-none opacity-50",
                )}
              >
                {isUploading ? (
                  <>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 rounded-md">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round(uploadProgress)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-2 font-medium">{Math.round(uploadProgress)}%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6" />
                    <span className="text-xs">Add Image</span>
                  </>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    )
  },
)

ImageUploader.displayName = "ImageUploader"
