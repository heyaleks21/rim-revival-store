"use client"

import { useState } from "react"
import { SupabaseImage } from "@/components/supabase-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestImagePage() {
  const [imagePath, setImagePath] = useState("")
  const [size, setSize] = useState<"thumbnail" | "medium" | "full">("thumbnail")

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Image Loading Test</h1>

      <div className="mb-6 grid gap-4">
        <Input
          type="text"
          placeholder="Enter image path"
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
        />

        <div className="flex gap-2">
          <Button variant={size === "thumbnail" ? "default" : "outline"} onClick={() => setSize("thumbnail")}>
            Thumbnail
          </Button>
          <Button variant={size === "medium" ? "default" : "outline"} onClick={() => setSize("medium")}>
            Medium
          </Button>
          <Button variant={size === "full" ? "default" : "outline"} onClick={() => setSize("full")}>
            Full
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Image Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {imagePath ? (
              <div className={size === "thumbnail" ? "h-24 w-24" : size === "medium" ? "h-48 w-48" : "h-96 w-96"}>
                <SupabaseImage path={imagePath} alt="Test image" size={size} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="text-gray-500">Enter an image path to test</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Path:</strong> {imagePath || "None"}
              </div>
              <div>
                <strong>Size:</strong> {size}
              </div>
              <div>
                <strong>Component:</strong> SupabaseImage
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
