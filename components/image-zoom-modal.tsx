"use client"

import { useState, useEffect, useRef, type MouseEvent, type WheelEvent } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ImageZoomModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  currentIndex: number
  onIndexChange: (index: number) => void
  alt: string
  preloadedUrls?: string[] // Accept preloaded URLs from parent
}

export function ImageZoomModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  alt,
  preloadedUrls = [],
}: ImageZoomModalProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  // Reset zoom and position when changing images or opening/closing modal
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex, isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "ArrowLeft") {
        handlePrevImage()
      } else if (e.key === "ArrowRight") {
        handleNextImage()
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, images.length, onClose])

  const handlePrevImage = () => {
    if (images.length <= 1) return
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    onIndexChange(newIndex)
  }

  const handleNextImage = () => {
    if (images.length <= 1) return
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    onIndexChange(newIndex)
  }

  // Mouse wheel zoom
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.01
    const newScale = Math.min(Math.max(scale + delta, 1), 5) // Limit scale between 1x and 5x
    setScale(newScale)
  }

  // Mouse drag to pan when zoomed in
  const handleMouseDown = (e: MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Double click to toggle zoom
  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(2)
    }
  }

  // Zoom in/out buttons
  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.5, 5))
  }

  const handleZoomOut = () => {
    if (scale > 1) {
      const newScale = Math.max(scale - 0.5, 1)
      setScale(newScale)
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 })
      }
    }
  }

  // Get current image URL - use preloaded URL if available
  const currentImageUrl = preloadedUrls[currentIndex] || null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/95">
        <DialogDescription className="sr-only">
          Image zoom view for {alt}. Use arrow keys to navigate between images.
        </DialogDescription>

        <div className="relative flex items-center justify-center w-full h-full">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-white hover:bg-black/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-black/20"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-8 w-8" />
                <span className="sr-only">Previous image</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-black/20"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-8 w-8" />
                <span className="sr-only">Next image</span>
              </Button>
            </>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-black/20"
              onClick={handleZoomOut}
              disabled={scale <= 1}
            >
              <ZoomOut className="h-5 w-5" />
              <span className="sr-only">Zoom out</span>
            </Button>
            <span className="text-white text-sm">{Math.round(scale * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-black/20"
              onClick={handleZoomIn}
              disabled={scale >= 5}
            >
              <ZoomIn className="h-5 w-5" />
              <span className="sr-only">Zoom in</span>
            </Button>
          </div>

          {/* Image container */}
          <div
            className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onDoubleClick={handleDoubleClick}
            style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
          >
            <div
              ref={imageRef}
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: isDragging ? "none" : "transform 0.2s",
              }}
            >
              {currentImageUrl && (
                <img
                  src={currentImageUrl || "/placeholder.svg"}
                  alt={alt}
                  className="max-h-[80vh] w-auto object-contain"
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
