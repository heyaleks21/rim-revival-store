"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiry: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Update the useEffect hook to create a more concise, professional message
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for product inquiry data in sessionStorage
      const storedProductData = sessionStorage.getItem("inquiryProduct")

      if (storedProductData) {
        try {
          const productData = JSON.parse(storedProductData)

          // Create a concise, professional message
          const formattedPrice = new Intl.NumberFormat("en-AU", {
            style: "currency",
            currency: "AUD",
          }).format(productData.price)

          // Create a professional inquiry message
          const productMessage =
            `I'm interested in the ${productData.title} (${formattedPrice}) and would like to inquire about its availability. ` +
            `Please contact me at your earliest convenience to discuss purchase options and delivery details.`

          setFormData((prev) => ({
            ...prev,
            inquiry: "stock",
            message: productMessage,
          }))

          // Clear the stored data to prevent it from being used again
          sessionStorage.removeItem("inquiryProduct")

          // Scroll to the contact form
          setTimeout(() => {
            const contactForm = document.getElementById("contact-form")
            if (contactForm) {
              contactForm.scrollIntoView({ behavior: "smooth" })
            }
          }, 100)
        } catch (error) {
          console.error("Error parsing product data:", error)
        }
      }

      // Keep the existing URL parameter handling
      const urlParams = new URLSearchParams(window.location.search)
      const productInfo = urlParams.get("product")

      if (productInfo) {
        setFormData((prev) => ({
          ...prev,
          inquiry: "stock",
          message: productInfo,
        }))
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, inquiry: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form")
      }

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      })
      setFormData({
        name: "",
        email: "",
        phone: "",
        inquiry: "",
        message: "",
      })
    } catch (error) {
      console.error("Contact form submission error:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id="contact-form" onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Your Name
          </label>
          <Input
            id="name"
            name="name"
            placeholder="John Smith"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Phone Number
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(+61) 0400 000 000"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="inquiry"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Inquiry Type
          </label>
          <Select onValueChange={handleSelectChange} value={formData.inquiry}>
            <SelectTrigger id="inquiry">
              <SelectValue placeholder="Select inquiry type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stock">Stock Availability</SelectItem>
              <SelectItem value="pricing">Pricing Inquiry</SelectItem>
              <SelectItem value="fitment">Fitment Compatibility</SelectItem>
              <SelectItem value="services">Restoration Services</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="message"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Your Message
        </label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us about your inquiry or what you're looking for..."
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="resize-none"
        />
      </div>

      <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled={isLoading}>
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  )
}
