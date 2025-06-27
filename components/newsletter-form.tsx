"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle } from "lucide-react"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error response:", errorText)

        let errorMessage = "Failed to subscribe. Please try again later."
        try {
          // Try to parse the error as JSON
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (parseError) {
          // If parsing fails, use the raw text with a fallback
          errorMessage = errorText || "Unknown error occurred"
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      })
      setEmail("")
      setIsSubscribed(true)
    } catch (error: any) {
      console.error("Newsletter subscription error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-secondary/10 p-6 text-center">
        <CheckCircle className="mx-auto mb-2 h-12 w-12 text-secondary" />
        <h3 className="mb-2 text-xl font-semibold">Thank you for subscribing!</h3>
        <p className="text-white/80">
          You'll now receive our latest updates, promotions, and wheel care tips directly to your inbox.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 text-gray-800"
      />
      <Button type="submit" disabled={isLoading} className="bg-secondary hover:bg-secondary/90 text-white">
        {isLoading ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  )
}
