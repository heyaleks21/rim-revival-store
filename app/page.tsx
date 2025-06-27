"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Star,
  PenToolIcon as Tool,
  Shield,
  Truck,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { getSupabaseClient } from "@/lib/supabase/client"
import { FaqSection } from "@/components/faq-section"
import { ContactForm } from "@/components/contact-form"
import { NewsletterForm } from "@/components/newsletter-form"
import type { Product } from "@/lib/types"
import { BeforeAfterSlider } from "@/components/before-after-slider"

type ActiveSection = "home" | "featured" | "services" | "faq" | "contact" | null

export default function Home() {
  // No category filtering needed
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<ActiveSection>("home") // Default to home

  const contactRef = useRef<HTMLDivElement>(null)
  const featuredRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const homeRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const pageContainerRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const supabase = getSupabaseClient()

  // Smooth scroll function that doesn't change URL
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
      // Close mobile menu after navigation
      setMobileMenuOpen(false)
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true)
      try {
        // Fetch featured products with their images
        const { data, error } = await supabase
          .from("products")
          .select("*, product_images(*)")
          .eq("featured", true)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching products:", error)
          return
        }

        setProducts(data || [])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [supabase])

  // Scroll to contact section if hash is present or sessionStorage flag is set
  useEffect(() => {
    // Check if we have a hash in the URL
    if (window.location.hash === "#contact") {
      // Slight delay to ensure the page is fully loaded
      setTimeout(() => {
        contactRef.current?.scrollIntoView({ behavior: "smooth" })
        // Safely remove the hash from URL without refreshing the page
        if (window.history && window.history.pushState) {
          const newUrl = window.location.pathname + window.location.search
          window.history.pushState({ path: newUrl }, "", newUrl)
        }
      }, 100)
    }

    // Check for sessionStorage flag
    const shouldScrollToContact = sessionStorage.getItem("scrollToContact")
    if (shouldScrollToContact === "true") {
      // Slight delay to ensure the page is fully loaded
      setTimeout(() => {
        contactRef.current?.scrollIntoView({ behavior: "smooth" })
        // Remove the flag from sessionStorage
        sessionStorage.removeItem("scrollToContact")
      }, 100)
    }

    // Check for featured section flag
    const shouldScrollToFeatured = sessionStorage.getItem("scrollToFeatured")
    if (shouldScrollToFeatured === "true") {
      // Slight delay to ensure the page is fully loaded
      setTimeout(() => {
        featuredRef.current?.scrollIntoView({ behavior: "smooth" })
        // Remove the flag from sessionStorage
        sessionStorage.removeItem("scrollToFeatured")
      }, 100)
    }
  }, [])

  // Also check for product parameter to ensure we scroll to contact when coming from product page
  useEffect(() => {
    const productParam = searchParams.get("product")
    if (productParam) {
      // Slight delay to ensure the page is fully loaded
      setTimeout(() => {
        contactRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [searchParams])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (mobileMenuOpen && !target.closest(".mobile-menu") && !target.closest(".mobile-menu-button")) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [mobileMenuOpen])

  // Set up intersection observers for each section
  useEffect(() => {
    const options = {
      root: null, // viewport
      rootMargin: "-100px 0px -300px 0px", // top, right, bottom, left
      threshold: 0.1, // 10% of the element must be visible
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id
          if (id === "hero") setActiveSection("home")
          else if (id === "featured") setActiveSection("featured")
          else if (id === "services") setActiveSection("services")
          else if (id === "faq") setActiveSection("faq")
          else if (id === "contact") setActiveSection("contact")
        }
      })
    }, options)

    // Observe each section
    if (heroRef.current) sectionObserver.observe(heroRef.current)
    if (featuredRef.current) sectionObserver.observe(featuredRef.current)
    if (servicesRef.current) sectionObserver.observe(servicesRef.current)
    if (faqRef.current) sectionObserver.observe(faqRef.current)
    if (contactRef.current) sectionObserver.observe(contactRef.current)

    // Clean up
    return () => {
      sectionObserver.disconnect()
    }
  }, [])

  // Just show the first 3 products
  const featuredProducts = products.slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col" ref={pageContainerRef}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Rim Revival Store" width={40} height={40} />
            <span className="hidden font-bold sm:inline-block">Rim Revival Store</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection(homeRef)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === "home" ? "text-primary font-semibold" : ""
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection(featuredRef)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === "featured" ? "text-primary font-semibold" : ""
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => scrollToSection(servicesRef)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === "services" ? "text-primary font-semibold" : ""
              }`}
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection(faqRef)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === "faq" ? "text-primary font-semibold" : ""
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection(contactRef)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === "contact" ? "text-primary font-semibold" : ""
              }`}
            >
              Contact
            </button>
            <Link href="/catalog" className="text-sm font-medium transition-colors hover:text-primary">
              Catalog
            </Link>
          </nav>
          <Button
            onClick={() => scrollToSection(contactRef)}
            className="hidden sm:flex bg-secondary hover:bg-secondary/90"
          >
            Contact Us
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mobile-menu">
            <div className="container py-4 bg-background border-t flex flex-col space-y-3">
              <button
                onClick={() => scrollToSection(homeRef)}
                className={`px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors flex justify-center ${
                  activeSection === "home" ? "text-primary font-semibold" : ""
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection(featuredRef)}
                className={`px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors flex justify-center ${
                  activeSection === "featured" ? "text-primary font-semibold" : ""
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => scrollToSection(servicesRef)}
                className={`px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors flex justify-center ${
                  activeSection === "services" ? "text-primary font-semibold" : ""
                }`}
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection(faqRef)}
                className={`px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors flex justify-center ${
                  activeSection === "faq" ? "text-primary font-semibold" : ""
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => scrollToSection(contactRef)}
                className={`px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors flex justify-center ${
                  activeSection === "contact" ? "text-primary font-semibold" : ""
                }`}
              >
                Contact
              </button>
              <Link
                href="/catalog"
                className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors flex justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catalog
              </Link>
              <Button onClick={() => scrollToSection(contactRef)} className="mt-2 bg-secondary hover:bg-secondary/90">
                Contact Us
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative" ref={heroRef} id="hero">
          <div className="relative min-h-[70vh] flex items-center justify-center" ref={homeRef}>
            <div className="absolute inset-0 z-0">
              <img
                src="/hero-background.png"
                alt="Premium wheels and rims display"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-600 opacity-70" />
            </div>
            <div className="container relative z-10 px-4 py-24 text-center text-white">
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Premium Used Rims & Tyres
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg sm:text-xl">
                Quality wheels at affordable prices. Revive your ride with our extensive collection of used rims and
                tyres.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90"
                  onClick={() => scrollToSection(featuredRef)}
                >
                  View Featured Items
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={() => scrollToSection(contactRef)}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section id="featured" ref={featuredRef} className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"></div>

          <div className="container relative px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Featured Stock</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Browse our selection of quality used rims and tyres. All items are thoroughly inspected and ready for
                installation.
              </p>
            </div>

            {/* Products grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-lg bg-white shadow-lg dark:bg-gray-800/60 animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-4"></div>
                    </div>
                  </div>
                ))
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    description={product.description}
                    price={product.price}
                    category={product.category}
                    product={product}
                  />
                ))
              ) : (
                <div className="col-span-3 py-12 text-center">
                  <p className="text-lg text-muted-foreground">No featured products found.</p>
                </div>
              )}
            </div>

            {/* View more button */}
            <div className="mt-12 text-center">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90" asChild>
                <Link href="/catalog" className="flex items-center gap-2">
                  View Full Catalog <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
          <div className="container px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Us</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                We pride ourselves on providing quality products, expert advice, and exceptional service to all our
                customers.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Star className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Quality Guaranteed</h3>
                <p className="text-muted-foreground">
                  All our products undergo rigorous quality checks to ensure they meet our high standards.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Tool className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Expert Advice</h3>
                <p className="text-muted-foreground">
                  Our team of specialists can help you find the perfect wheels and tyres for your vehicle.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Shield className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Warranty Included</h3>
                <p className="text-muted-foreground">
                  All products come with a warranty for your peace of mind and satisfaction.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Truck className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Quick delivery options available to get your wheels and tyres to you as soon as possible.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section
          id="services"
          ref={servicesRef}
          className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
        >
          <div className="container px-4 max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Our Services</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                We offer a comprehensive range of wheel and tyre services to keep your vehicle running smoothly and
                looking great.
              </p>
            </div>

            {/* Main Services Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Service 1 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-md transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src="/sleek-black-alloy-rim.png"
                    alt="Quality used rims"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-3">
                    Popular Choice
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    Quality Used Rims
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Extensive selection of quality checked used rims for all vehicle makes and models. All our rims are
                    thoroughly inspected for structural integrity.
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Alloy and steel options</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Various sizes and styles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Fitment guarantee</span>
                    </li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                    asChild
                  >
                    <Link href="/catalog?category=rim" className="flex items-center justify-center gap-1">
                      Browse Rims <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Service 2 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-md transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src="/continental-road.png"
                    alt="Premium used tyres"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-3">
                    Best Value
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    Premium Used Tyres
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    High-quality used tyres with plenty of tread life remaining. We stock major brands at a fraction of
                    the new price.
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Minimum 50% tread remaining</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>All major brands available</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>30-day warranty</span>
                    </li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                    asChild
                  >
                    <Link href="/catalog?category=tyre" className="flex items-center justify-center gap-1">
                      Browse Tyres <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Service 3 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-md transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src="/performance-wheel-tyre-set.png"
                    alt="Wheel and tyre packages"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-3">
                    Complete Solution
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    Wheel & Tyre Packages
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Complete wheel and tyre packages, mounted and balanced, ready for installation. Save time and money
                    with our package deals.
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Professionally mounted & balanced</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Package discounts available</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Ready for immediate installation</span>
                    </li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                    asChild
                  >
                    <Link href="/catalog?category=package" className="flex items-center justify-center gap-1">
                      View Packages <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Partner Service Showcase */}
            <div className="mt-20">
              <div className="text-center mb-10">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-secondary/20 text-secondary mb-3">
                  Partner Service
                </div>
                <h3 className="text-2xl font-bold">Professional Rim Restoration</h3>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                  Our partner specializes in bringing damaged and worn rims back to their original glory
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl transform transition-all hover:shadow-2xl">
                <div className="grid md:grid-cols-5">
                  {/* Left Content */}
                  <div className="p-8 md:col-span-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-6">
                      <img src="/logo.svg" alt="Rim Revivals Logo" className="h-10 w-10" />
                      <h3 className="text-2xl font-bold">Rim Revivals</h3>
                    </div>

                    <p className="mb-6 text-muted-foreground">
                      Our sister store, Rim Revivals, specializes in professional rim repair and restoration services.
                      From minor cosmetic fixes to major structural repairs, their team can bring your damaged wheels
                      back to life with industry-leading techniques and quality.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Cosmetic Repairs</h4>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">Curb damage repair</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">Custom finishes & colors</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Structural Repairs</h4>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">Crack & bend repair</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">Wheel straightening</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button className="bg-secondary hover:bg-secondary/90" asChild>
                        <a
                          href="https://www.rimrevivals.com.au"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          Visit Rim Revivals <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => scrollToSection(contactRef)}
                        className="flex items-center gap-1"
                      >
                        Contact Us <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Right Image - Before/After Slider */}
                  <div className="relative md:col-span-2">
                    <BeforeAfterSlider
                      beforeImage="https://rcuitxlzolonzxfyfjlo.supabase.co/storage/v1/object/public/beforeafter//after.JPEG"
                      afterImage="https://rcuitxlzolonzxfyfjlo.supabase.co/storage/v1/object/public/beforeafter//before.JPEG"
                      beforeLabel="Before"
                      afterLabel="After"
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" ref={faqRef} className="py-16 md:py-24 bg-white dark:bg-gray-900">
          <div className="container px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Find answers to common questions about our products and services. If you can't find what you're looking
                for, please contact us.
              </p>
            </div>

            <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg">
              <FaqSection />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" ref={contactRef} className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
          <div className="container px-4 max-w-5xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Have questions or need assistance? Reach out to our team and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1 max-w-4xl mx-auto">
              {/* Contact Form - Full Width */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-lg">
                <ContactForm />
              </div>

              {/* Map and Contact Info - Two Columns */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                {/* Left Column - Map */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Find Us</h3>
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13084.025370549598!2d138.5872423!3d-34.8651441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ab0c7c1a5e2f8f9%3A0x5033654628eb6c0!2sBlair%20Athol%20SA%205084%2C%20Australia!5e0!3m2!1sen!2sus!4v1682458765954!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Store Location"
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    We're conveniently located in Blair Athol, South Australia. Visit us today to see our extensive
                    collection of quality rims and tyres.
                  </p>

                  {/* Contact Information */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">(+61) 0498 256 447</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">oceboosting@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">Blair Athol, SA 5084, Australia</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Business Hours</p>
                        <p className="text-muted-foreground">Monday - Sunday: 9:00 AM - 9:00 PM</p>
                        <p className="text-muted-foreground">Open 7 days a week</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Sister Store */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Sister Store</h3>
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src="/rim-revivals-screenshot.png"
                      alt="Rim Revivals Website"
                      className="w-full h-auto rounded-lg transition-transform hover:scale-105"
                    />
                  </div>
                  <p className="mb-4 text-muted-foreground">
                    Visit our sister store, Rim Revivals, for professional rim repair and restoration services.
                  </p>

                  {/* Added services list */}
                  <h4 className="font-medium text-base mb-2">Specialized Services:</h4>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Complete wheel restoration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Curb damage repair</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Custom paint finishes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Pick up and delivery available</span>
                    </li>
                  </ul>

                  {/* Added contact info */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Phone:</span> (+61) 0498 256 447
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Email:</span> oceboosting@gmail.com
                    </p>
                  </div>

                  <Button className="w-full bg-secondary hover:bg-secondary/90" asChild>
                    <a
                      href="https://www.rimrevivals.com.au"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1"
                    >
                      Visit Rim Revivals <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 md:py-16 bg-primary text-white">
          <div className="container px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Subscribe to Our Newsletter</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Stay updated with our latest stock arrivals, special offers, and wheel care tips.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Rim Revival Store</h3>
              <p className="mb-4">
                Quality used rims and tyres at affordable prices. Revive your ride with our extensive collection.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection(homeRef)} className="hover:text-white transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection(featuredRef)} className="hover:text-white transition-colors">
                    Featured
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection(servicesRef)} className="hover:text-white transition-colors">
                    Services
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection(faqRef)} className="hover:text-white transition-colors">
                    FAQ
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection(contactRef)} className="hover:text-white transition-colors">
                    Contact
                  </button>
                </li>
                <li>
                  <Link href="/catalog" className="hover:text-white transition-colors">
                    Catalog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-bold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection(servicesRef)} className="hover:text-white transition-colors">
                    Used Rims
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection(servicesRef)} className="hover:text-white transition-colors">
                    Used Tyres
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection(servicesRef)} className="hover:text-white transition-colors">
                    Wheel & Tyre Packages
                  </button>
                </li>
                <li>
                  <a
                    href="https://www.rimrevivals.com.au"
                    className="hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Rim Restoration
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-bold mb-4">Contact</h3>
              <address className="not-italic space-y-2">
                <p>Blair Athol, SA 5084</p>
                <p>Australia</p>
                <p className="mt-4">
                  <a href="tel:+61498256447" className="hover:text-white transition-colors">
                    (+61) 0498 256 447
                  </a>
                </p>
                <p>
                  <a href="mailto:oceboosting@gmail.com" className="hover:text-white transition-colors">
                    oceboosting@gmail.com
                  </a>
                </p>
              </address>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Rim Revival Store. All rights reserved.</p>
            <p className="mt-2 text-gray-500">
              <Link href="#" className="hover:text-gray-400 transition-colors">
                Privacy Policy
              </Link>{" "}
              •{" "}
              <Link href="#" className="hover:text-gray-400 transition-colors">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
