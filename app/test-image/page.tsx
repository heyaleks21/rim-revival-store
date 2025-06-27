"use client"

import { useState } from "react"
import { SupabaseImage } from "@/components/supabase-image"

export default function TestImagePage() {
  const [imagePath, setImagePath] = useState("staging/1745992784089-k0m62r376.JPEG")

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Image Loading Test</h1>

      <div className="mb-6">
        <label className="block mb-2">Image Path:</label>
        <input
          type="text"
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">SupabaseImage Component</h2>
          <div className="border p-4 rounded-lg">
            <SupabaseImage path={imagePath} alt="Test image" className="w-full h-auto rounded" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Direct Image Tag</h2>
          <div className="border p-4 rounded-lg">
            <img
              src={`/api/image-proxy?path=${encodeURIComponent(imagePath)}`}
              alt="Test image"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
