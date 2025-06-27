"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  className = "",
}) => {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const x = clientX - rect.left
    const width = rect.width
    const position = Math.max(0, Math.min(100, (x / width) * 100))
    setSliderPosition(position)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      handleMove(e.clientX)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ touchAction: "none" }}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={sliderPosition}
      aria-label="Before and after image comparison slider"
      tabIndex={0}
      onKeyDown={(e) => {
        // Allow keyboard control with arrow keys
        if (e.key === "ArrowLeft") {
          setSliderPosition((prev) => Math.max(0, prev - 5))
        } else if (e.key === "ArrowRight") {
          setSliderPosition((prev) => Math.min(100, prev + 5))
        }
      }}
    >
      {/* Before image */}
      <img
        src={beforeImage || "/placeholder.svg?height=400&width=600"}
        alt={`${beforeLabel} state`}
        className="block w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg?height=400&width=600"
        }}
      />

      {/* After image with clip path */}
      <div
        className="absolute top-0 left-0 right-0 bottom-0"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <img
          src={afterImage || "/placeholder.svg?height=400&width=600"}
          alt={`${afterLabel} state`}
          className="block w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=400&width=600"
          }}
        />
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 text-xs rounded">{beforeLabel}</div>
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 text-xs rounded">{afterLabel}</div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={() => setIsDragging(true)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M18 8L22 12L18 16"></path>
              <path d="M6 8L2 12L6 16"></path>
              <line x1="2" y1="12" x2="22" y2="12"></line>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
