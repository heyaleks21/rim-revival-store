"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { ImageUploader } from "@/components/admin/products/image-uploader"
import type { Product, ProductImage } from "@/lib/types"
import { Loader2, Edit, Check, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Vehicle data for Australia
const vehicleBrands = [
  "Audi",
  "BMW",
  "Ford",
  "Holden",
  "Honda",
  "Hyundai",
  "Isuzu",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Mazda",
  "Mercedes-Benz",
  "Mitsubishi",
  "Nissan",
  "Subaru",
  "Suzuki",
  "Toyota",
  "Volkswagen",
  "Volvo",
  "Other",
].sort()

// Common models by brand (sorted alphabetically)
const vehicleModelsByBrand: Record<string, string[]> = {
  Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7", "Other"].sort(),
  BMW: ["1 Series", "2 Series", "3 Series", "5 Series", "X1", "X2", "X3", "X4", "X5", "Other"].sort(),
  Ford: ["EcoSport", "Endura", "Escape", "Everest", "Focus", "Mustang", "Puma", "Ranger", "Transit", "Other"].sort(),
  Holden: ["Acadia", "Astra", "Barina", "Colorado", "Commodore", "Equinox", "Trailblazer", "Trax", "Other"].sort(),
  Honda: ["Accord", "City", "Civic", "CR-V", "HR-V", "Jazz", "Odyssey", "Other"].sort(),
  Hyundai: ["Accent", "Elantra", "i30", "iLoad", "Kona", "Palisade", "Santa Fe", "Tucson", "Venue", "Other"].sort(),
  Isuzu: ["D-Max", "MU-X", "Other"].sort(),
  Jeep: ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Renegade", "Wrangler", "Other"].sort(),
  Kia: ["Carnival", "Cerato", "Picanto", "Rio", "Seltos", "Sorento", "Sportage", "Stinger", "Other"].sort(),
  "Land Rover": [
    "Defender",
    "Discovery",
    "Discovery Sport",
    "Range Rover",
    "Range Rover Evoque",
    "Range Rover Sport",
    "Range Rover Velar",
    "Other",
  ].sort(),
  Lexus: ["CT", "ES", "IS", "LC", "LS", "LX", "NX", "RC", "RX", "UX", "Other"].sort(),
  Mazda: ["BT-50", "CX-3", "CX-30", "CX-5", "CX-9", "Mazda2", "Mazda3", "Mazda6", "MX-5", "Other"].sort(),
  "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "CLA", "E-Class", "GLA", "GLC", "GLE", "S-Class", "Other"].sort(),
  Mitsubishi: ["ASX", "Eclipse Cross", "Mirage", "Outlander", "Pajero", "Pajero Sport", "Triton", "Other"].sort(),
  Nissan: ["370Z", "Juke", "Leaf", "Navara", "Pathfinder", "Patrol", "Qashqai", "X-Trail", "Other"].sort(),
  Subaru: ["BRZ", "Forester", "Impreza", "Levorg", "Liberty", "Outback", "WRX", "XV", "Other"].sort(),
  Suzuki: ["Baleno", "Ignis", "Jimny", "S-Cross", "Swift", "Vitara", "Other"].sort(),
  Toyota: ["Camry", "C-HR", "Corolla", "HiLux", "Kluger", "LandCruiser", "Prado", "RAV4", "Yaris", "Other"].sort(),
  Volkswagen: ["Amarok", "Caddy", "Golf", "Passat", "Polo", "T-Cross", "T-Roc", "Tiguan", "Touareg", "Other"].sort(),
  Volvo: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "Other"].sort(),
  Other: ["Custom"],
}

// Common stud patterns with most common ones at the top
const commonStudPatterns = [
  { value: "5x114.3", label: "5x114.3 (Most Common)", group: "Most Common" },
  { value: "5x120", label: "5x120 (Most Common)", group: "Most Common" },
  { value: "4x100", label: "4x100", group: "Standard" },
  { value: "4x108", label: "4x108", group: "Standard" },
  { value: "4x114.3", label: "4x114.3", group: "Standard" },
  { value: "5x100", label: "5x100", group: "Standard" },
  { value: "5x108", label: "5x108", group: "Standard" },
  { value: "5x112", label: "5x112", group: "Standard" },
  { value: "5x127", label: "5x127", group: "Standard" },
  { value: "5x130", label: "5x130", group: "Standard" },
  { value: "6x114.3", label: "6x114.3", group: "Standard" },
  { value: "6x139.7", label: "6x139.7", group: "Standard" },
  { value: "Other", label: "Other", group: "Standard" },
]

// Rim widths in inches (removed "Other" option)
const rimWidths = ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"].map(
  (w) => `${w}"`,
)

// Center bore sizes in mm
const centerBoreSizes = [
  "None",
  "54.1",
  "56.1",
  "57.1",
  "60.1",
  "63.4",
  "66.1",
  "67.1",
  "70.3",
  "71.5",
  "72.6",
  "73.1",
  "74.1",
  "Other",
]

// Generate years from 1990 to current year
const currentYear = new Date().getFullYear()
const vehicleYears = Array.from({ length: currentYear - 1989 }, (_, i) => (currentYear - i).toString()).sort()

// Rim sizes
const rimSizes = ["14", "15", "16", "17", "18", "19", "20", "21", "22"].sort()

// Tyre sizes by rim size
const tyreSizesByRimSize: Record<string, string[]> = {
  "14": ["175/65R14", "185/60R14", "185/65R14", "185/70R14", "195/60R14", "195/70R14", "205/70R14"].sort(),
  "15": [
    "175/65R15",
    "185/55R15",
    "185/60R15",
    "185/65R15",
    "195/50R15",
    "195/55R15",
    "195/60R15",
    "195/65R15",
    "205/60R15",
    "205/65R15",
    "205/70R15",
    "215/60R15",
    "215/65R15",
    "215/70R15",
    "225/70R15",
    "235/75R15",
  ].sort(),
  "16": [
    "195/50R16",
    "195/55R16",
    "205/45R16",
    "205/50R16",
    "205/55R16",
    "205/60R16",
    "205/65R16",
    "215/55R16",
    "215/60R16",
    "215/65R16",
    "225/50R16",
    "225/55R16",
    "225/60R16",
    "225/65R16",
    "225/70R16",
    "235/60R16",
    "235/70R16",
    "245/70R16",
    "255/70R16",
    "265/70R16",
    "265/75R16",
  ].sort(),
  "17": [
    "205/45R17",
    "205/50R17",
    "215/40R17",
    "215/45R17",
    "215/50R17",
    "215/55R17",
    "215/60R17",
    "225/45R17",
    "225/50R17",
    "225/55R17",
    "225/60R17",
    "225/65R17",
    "235/45R17",
    "235/50R17",
    "235/55R17",
    "235/60R17",
    "235/65R17",
    "245/40R17",
    "245/45R17",
    "245/65R17",
    "245/70R17",
    "255/65R17",
    "265/65R17",
    "265/70R17",
  ].sort(),
  "18": [
    "215/35R18",
    "215/40R18",
    "225/40R18",
    "225/45R18",
    "225/50R18",
    "235/40R18",
    "235/45R18",
    "235/50R18",
    "235/55R18",
    "235/60R18",
    "245/35R18",
    "245/40R18",
    "245/45R18",
    "245/50R18",
    "245/60R18",
    "255/35R18",
    "255/40R18",
    "255/45R18",
    "255/55R18",
    "255/60R18",
    "265/35R18",
    "265/40R18",
    "265/60R18",
    "275/35R18",
    "275/40R18",
    "275/45R18",
    "285/60R18",
  ].sort(),
  "19": [
    "225/35R19",
    "225/40R19",
    "225/45R19",
    "235/35R19",
    "235/40R19",
    "235/45R19",
    "235/50R19",
    "235/55R19",
    "245/35R19",
    "245/40R19",
    "245/45R19",
    "245/50R19",
    "245/55R19",
    "255/30R19",
    "255/35R19",
    "255/40R19",
    "255/45R19",
    "255/50R19",
    "255/55R19",
    "265/30R19",
    "265/35R19",
    "265/50R19",
    "275/30R19",
    "275/35R19",
    "275/40R19",
    "275/45R19",
    "285/30R19",
    "285/35R19",
    "295/30R19",
    "305/30R19",
  ].sort(),
  "20": [
    "225/30R20",
    "235/30R20",
    "235/35R20",
    "235/45R20",
    "235/55R20",
    "245/30R20",
    "245/35R20",
    "245/40R20",
    "245/45R20",
    "245/50R20",
    "255/30R20",
    "255/35R20",
    "255/40R20",
    "255/45R20",
    "255/50R20",
    "255/55R20",
    "265/30R20",
    "265/35R20",
    "265/40R20",
    "265/45R20",
    "265/50R20",
    "275/30R20",
    "275/35R20",
    "275/40R20",
    "275/45R20",
    "275/50R20",
    "275/55R20",
    "285/30R20",
    "285/35R20",
    "285/40R20",
    "285/45R20",
    "285/50R20",
    "295/30R20",
    "295/35R20",
    "295/40R20",
    "305/30R20",
    "305/35R20",
    "305/40R20",
    "315/35R20",
  ].sort(),
  "21": [
    "235/35R21",
    "245/35R21",
    "255/30R21",
    "255/35R21",
    "255/40R21",
    "265/35R21",
    "265/40R21",
    "265/45R21",
    "275/30R21",
    "275/35R21",
    "275/40R21",
    "275/45R21",
    "285/30R21",
    "285/35R21",
    "285/40R21",
    "295/25R21",
    "295/30R21",
    "295/35R21",
    "305/25R21",
    "305/30R21",
    "315/30R21",
    "325/25R21",
  ].sort(),
  "22": [
    "235/30R22",
    "245/30R22",
    "255/25R22",
    "255/30R22",
    "255/35R22",
    "265/30R22",
    "265/35R22",
    "265/40R22",
    "275/30R22",
    "275/35R22",
    "275/40R22",
    "275/45R22",
    "285/25R22",
    "285/30R22",
    "285/35R22",
    "285/40R22",
    "285/45R22",
    "295/25R22",
    "295/30R22",
    "305/25R22",
    "305/30R22",
    "305/35R22",
    "305/40R22",
    "315/30R22",
    "325/30R22",
    "335/25R22",
  ].sort(),
}

// Tyre conditions
const tyreConditions = [
  "New",
  "Excellent (90%+)",
  "Very Good (70-90%)",
  "Good (50-70%)",
  "Fair (30-50%)",
  "Poor (<30%)",
  "No tyres",
]

// Paint conditions
const paintConditions = ["Perfect", "Excellent", "Very Good", "Good", "Fair", "Poor", "Needs Refinishing"]

// Rim set quantities
const rimQuantities = ["1", "2", "3", "4", "5", "6", "7", "8"]

// Tyre quantities
const tyreQuantities = ["1", "2", "3", "4", "5", "6", "7", "8"]

// Updated schema with required fields
const productSchema = z
  .object({
    // Make price required with a custom error message
    price: z.coerce
      .number({ required_error: "Price is required" })
      .positive("Price must be positive")
      .min(1, "Price must be at least $1"),

    // Make category required
    category: z.enum(["rim", "tyre"], {
      required_error: "Product type is required",
    }),

    in_stock: z.boolean().default(true),
    featured: z.boolean().default(false),

    // Make vehicle_brand required when category is "rim"
    vehicle_year: z.string().optional(),
    vehicle_brand: z.string().optional(),
    vehicle_model: z.string().optional(),
    rim_size: z.string().optional(),
    tyre_size: z.string().optional(),
    front_tyre_size: z.string().optional(),
    rear_tyre_size: z.string().optional(),
    tyre_condition: z.string().optional(),
    paint_condition: z.string().optional(),
    rim_quantity: z.string().optional(),
    tyre_quantity: z.string().optional(),
    custom_brand: z.string().optional(),
    stud_pattern: z.string().optional(),
    center_bore: z.string().optional(),
    custom_center_bore: z.string().optional(),
    rim_width: z.string().optional(),
    is_staggered: z.boolean().default(false),
    has_staggered_tyres: z.boolean().default(false),
    front_rim_width: z.string().optional(),
    custom_title: z.string().optional(),
    custom_description: z.string().optional(),
    is_staggered_tyres: z.boolean().default(false),
    front_offset: z.string().optional(),
    rear_offset: z.string().optional(),
  })
  .refine(
    (data) => {
      // If category is "rim", vehicle_brand is required
      if (data.category === "rim") {
        return !!data.vehicle_brand && data.vehicle_brand !== "not_specified"
      }
      return true
    },
    {
      message: "Vehicle brand is required for rim products",
      path: ["vehicle_brand"],
    },
  )
  .refine(
    (data) => {
      // If vehicle_brand is "Other", custom_brand is required
      if (data.vehicle_brand === "Other") {
        return !!data.custom_brand
      }
      return true
    },
    {
      message: "Custom brand name is required when 'Other' is selected",
      path: ["custom_brand"],
    },
  )
  .refine(
    (data) => {
      // If category is "rim", rim_size is required
      if (data.category === "rim") {
        return !!data.rim_size && data.rim_size !== "not_specified"
      }
      return true
    },
    {
      message: "Rim size is required for rim products",
      path: ["rim_size"],
    },
  )

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product: Product | null
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<ProductImage[]>(product?.product_images || [])
  const supabase = getSupabaseClient()

  // Add a new state variable to track successful product creation
  const [productCreated, setProductCreated] = useState(false)

  // Add a new state for tracking form submission
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)

  // Add a new state variable to track image upload status
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  // Track form validation errors
  const [formErrors, setFormErrors] = useState<string[]>([])

  // State for conditional fields
  const [selectedBrand, setSelectedBrand] = useState<string>(product?.vehicle_brand || "")
  const [selectedRimSize, setSelectedRimSize] = useState<string>(product?.rim_size || "")
  const [showTyreFields, setShowTyreFields] = useState<boolean>(
    product?.tyre_condition !== "No tyres" && product?.tyre_condition !== undefined,
  )
  const [showCustomBrand, setShowCustomBrand] = useState<boolean>(selectedBrand === "Other")
  const [showCustomCenterBore, setShowCustomCenterBore] = useState<boolean>(product?.center_bore === "Other")
  const [isStaggered, setIsStaggered] = useState<boolean>(product?.is_staggered || false)
  const [hasStaggeredTyres, setHasStaggeredTyres] = useState<boolean>(false)
  const [selectedCategory, setSelectedCategory] = useState<string>(product?.category || "rim")

  // Generated title and description
  const [generatedTitle, setGeneratedTitle] = useState<string>("")
  const [generatedDescription, setGeneratedDescription] = useState<string>("")

  // State for custom title and description
  const [editingTitle, setEditingTitle] = useState<boolean>(!!product?.title)
  const [editingDescription, setEditingDescription] = useState<boolean>(!!product?.description)
  const [customTitle, setCustomTitle] = useState<string>(product?.title || "")
  const [customDescription, setCustomDescription] = useState<string>(product?.description || "")

  // Add a ref for the image uploader
  const imageUploaderRef = useRef<{
    uploadPendingFiles: () => Promise<ProductImage[]>
    getImagesToDelete: () => string[]
  }>(null)
  // Add state for pending files
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  // Add state for processing status
  const [isProcessing, setIsProcessing] = useState(false)

  // Clean up temporary images when component unmounts
  useEffect(() => {
    return () => {
      // Only run cleanup if this is a new product (no product ID)
      if (!product) {
        cleanupTemporaryImages()
      }
    }
  }, [product])

  // Function to clean up temporary images
  const cleanupTemporaryImages = async () => {
    // For new products, all images are in the staging folder
    if (!product && images.length > 0) {
      try {
        console.log("Cleaning up temporary images:", images.length)

        // Extract image URLs
        const imageUrls = images.map((img) => img.image_url).filter(Boolean)

        if (imageUrls.length === 0) return

        // Use the new API endpoint to clean up images
        const response = await fetch("/api/admin/cleanup-temp-images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrls }),
        })

        const result = await response.json()
        console.log("Cleanup result:", result)

        // Clear the images array
        setImages([])
      } catch (error) {
        console.error("Failed to clean up images:", error)
      }
    }
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          price: product.price,
          category: product.category,
          in_stock: product.in_stock,
          featured: product.featured,
          vehicle_year: product.vehicle_year || "",
          vehicle_brand: product.vehicle_brand || "",
          vehicle_model: product.vehicle_model || "",
          rim_size: product.rim_size || "",
          tyre_size: product.tyre_size || "",
          front_tyre_size: product.front_tyre_size || "",
          rear_tyre_size: product.rear_tyre_size || "",
          tyre_condition: product.tyre_condition || "",
          paint_condition: product.paint_condition || "",
          rim_quantity: product.rim_quantity || "4",
          tyre_quantity: "4", // Default value
          custom_brand: product.custom_brand || "",
          stud_pattern: product.stud_pattern || "",
          center_bore: product.center_bore || "",
          custom_center_bore: product.custom_center_bore || "",
          rim_width: product.rim_width || "",
          is_staggered: product.is_staggered || false,
          has_staggered_tyres: product.has_staggered_tyres || false,
          front_rim_width: product.front_rim_width || "",
          custom_title: product.title || "",
          custom_description: product.description || "",
          is_staggered_tyres: product.is_staggered_tyres || false,
          front_offset: product.front_offset || "",
          rear_offset: product.rear_offset || "",
        }
      : {
          price: 0,
          category: "rim",
          in_stock: true,
          featured: false,
          vehicle_year: "",
          vehicle_brand: "",
          vehicle_model: "",
          rim_size: "",
          tyre_size: "",
          front_tyre_size: "",
          rear_tyre_size: "",
          tyre_condition: "No tyres",
          paint_condition: "",
          rim_quantity: "4",
          tyre_quantity: "4",
          custom_brand: "",
          stud_pattern: "",
          center_bore: "",
          custom_center_bore: "",
          rim_width: "",
          is_staggered: false,
          has_staggered_tyres: false,
          front_rim_width: "",
          custom_title: "",
          custom_description: "",
          is_staggered_tyres: false,
          front_offset: "",
          rear_offset: "",
        },
    mode: "onChange", // Validate on each change
  })

  // Watch form values for conditional logic
  const watchBrand = form.watch("vehicle_brand")
  const watchRimSize = form.watch("rim_size")
  const watchTyreCondition = form.watch("tyre_condition")
  const watchCategory = form.watch("category")
  const watchCenterBore = form.watch("center_bore")
  const watchIsStaggered = form.watch("is_staggered")
  const watchHasStaggeredTyres = form.watch("has_staggered_tyres")
  const watchAllFields = form.watch()

  // Update state when category changes
  useEffect(() => {
    setSelectedCategory(watchCategory)

    // Reset fields when category changes to tyre
    if (watchCategory === "tyre" && selectedCategory !== "tyre") {
      form.setValue("vehicle_year", "")
      form.setValue("vehicle_brand", "")
      form.setValue("vehicle_model", "")
      form.setValue("rim_size", "")
      form.setValue("stud_pattern", "")
      form.setValue("center_bore", "")
      form.setValue("custom_center_bore", "")
      form.setValue("rim_width", "")
      form.setValue("front_rim_width", "")
      form.setValue("paint_condition", "")
      form.setValue("rim_quantity", "")
      form.setValue("is_staggered", false)
      form.setValue("front_offset", "")
      form.setValue("rear_offset", "")

      // Set default tyre condition if not already set
      if (!form.getValues("tyre_condition")) {
        form.setValue("tyre_condition", "New")
      }

      // Set default tyre quantity if not already set
      if (!form.getValues("tyre_quantity")) {
        form.setValue("tyre_quantity", "4")
      }
    }

    // Reset tyre quantity when changing from tyre to another category
    if (watchCategory !== "tyre" && selectedCategory === "tyre") {
      form.setValue("tyre_quantity", "")
    }
  }, [watchCategory, form, selectedCategory])

  // Update state when brand changes
  useEffect(() => {
    setSelectedBrand(watchBrand || "")
    setShowCustomBrand(watchBrand === "Other")

    // Reset vehicle model when brand changes
    if (watchBrand !== selectedBrand) {
      form.setValue("vehicle_model", "")
    }
  }, [watchBrand, form, selectedBrand])

  // Update state when rim size changes
  useEffect(() => {
    setSelectedRimSize(watchRimSize || "")

    // Reset tyre size when rim size changes
    if (watchRimSize !== selectedRimSize) {
      form.setValue("tyre_size", "")
      form.setValue("front_tyre_size", "")
      form.setValue("rear_tyre_size", "")
    }
  }, [watchRimSize, form, selectedRimSize])

  // Update tyre fields visibility
  useEffect(() => {
    setShowTyreFields(watchTyreCondition !== "No tyres" && watchTyreCondition !== undefined)
  }, [watchTyreCondition])

  // Update center bore custom field visibility
  useEffect(() => {
    setShowCustomCenterBore(watchCenterBore === "Other")
  }, [watchCenterBore])

  // Update staggered state
  useEffect(() => {
    setIsStaggered(watchIsStaggered)
  }, [watchIsStaggered])

  // Update staggered tyres state
  useEffect(() => {
    setHasStaggeredTyres(watchHasStaggeredTyres)
  }, [watchHasStaggeredTyres])

  // Generate title and description when form values change
  useEffect(() => {
    const title = generateTitle(watchAllFields)
    const description = generateDescription(watchAllFields)

    setGeneratedTitle(title)
    setGeneratedDescription(description)

    // Update custom title and description if not being edited
    if (!editingTitle) {
      setCustomTitle(title)
    }
    if (!editingDescription) {
      setCustomDescription(description)
    }
  }, [watchAllFields, editingTitle, editingDescription])

  // Function to capitalize first letter of each sentence
  const capitalizeFirstLetter = (text: string): string => {
    return text.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
  }

  // Function to generate title based on form values
  const generateTitle = (values: ProductFormValues): string => {
    const brand = values.vehicle_brand === "Other" && values.custom_brand ? values.custom_brand : values.vehicle_brand
    const brandText = brand && brand !== "not_specified" ? brand : ""
    const modelText = values.vehicle_model && values.vehicle_model !== "not_specified" ? values.vehicle_model : ""
    const hasTyres =
      values.tyre_condition && values.tyre_condition !== "No tyres" && values.tyre_condition !== "not_specified"
    const studPattern = values.stud_pattern && values.stud_pattern !== "not_specified" ? values.stud_pattern : ""
    const isStaggered = values.is_staggered

    let title = ""

    // For tyre category
    if (values.category === "tyre") {
      title = `${values.tyre_quantity || "4"}x ${values.tyre_size || ""} Tyres`
      if (values.tyre_condition && values.tyre_condition !== "not_specified") {
        title += ` - ${values.tyre_condition} Condition`
      }
      return title
    }

    // For rim and package categories
    if (values.rim_size && values.rim_size !== "not_specified") {
      title = `${values.rim_quantity || "4"}x ${values.rim_size}" `

      // Add stud pattern if available
      if (studPattern) {
        title += `${studPattern} `
      }

      if (brandText) {
        title += brandText
        if (modelText) {
          title += ` ${modelText} `
        } else {
          title += " "
        }
      }

      // Add "Staggered Rims" if applicable
      if (isStaggered) {
        title += "Staggered Rims"
      } else {
        title += "Rims"
      }

      // Add "and Tyres" if they have tyres
      if (hasTyres) {
        title += " and Tyres"
      }
    }

    return title
  }

  // Function to generate description based on form values
  const generateDescription = (values: ProductFormValues): string => {
    // For tyre category
    if (values.category === "tyre") {
      let description = `${values.tyre_quantity || "4"}x ${values.tyre_size || ""} Tyres in ${values.tyre_condition || "good"} condition. `
      description += "Please contact us for more details or to check fitment for your vehicle."
      return capitalizeFirstLetter(description)
    }

    const brand = values.vehicle_brand === "Other" && values.custom_brand ? values.custom_brand : values.vehicle_brand
    const brandText = brand && brand !== "not_specified" ? brand : ""
    const modelText = values.vehicle_model && values.vehicle_model !== "not_specified" ? values.vehicle_model : ""
    const hasTyres =
      values.tyre_condition && values.tyre_condition !== "No tyres" && values.tyre_condition !== "not_specified"
    const studPattern = values.stud_pattern && values.stud_pattern !== "not_specified" ? values.stud_pattern : ""
    const hasStaggeredTyres = values.has_staggered_tyres

    // Handle center bore (custom or selected)
    let centerBore = ""
    if (values.center_bore === "Other" && values.custom_center_bore) {
      centerBore = values.custom_center_bore
    } else if (values.center_bore && values.center_bore !== "not_specified" && values.center_bore !== "None") {
      centerBore = values.center_bore
    }

    // Handle rim width (staggered or standard)
    const isStaggered = values.is_staggered
    const rearRimWidth = values.rim_width && values.rim_width !== "not_specified" ? values.rim_width : ""
    const frontRimWidth =
      values.front_rim_width && values.front_rim_width !== "not_specified" ? values.front_rim_width : ""

    // Handle offset values
    const frontOffset = values.front_offset ? values.front_offset : ""
    const rearOffset = values.rear_offset ? values.rear_offset : ""

    // Handle tyre sizes for staggered setup
    const rearTyreSize = values.rear_tyre_size || values.tyre_size || ""
    const frontTyreSize = values.front_tyre_size || values.tyre_size || ""

    let description = ""

    // Start with basic information
    if (values.category === "rim") {
      description += `${values.rim_quantity || "4"}x ${values.rim_size}"`

      // Add stud pattern if available
      if (studPattern) {
        description += ` ${studPattern}`
      }

      // Add "staggered" if applicable
      if (isStaggered) {
        description += " staggered"
      }

      description += " rims"

      if (brandText && modelText) {
        description += ` for ${values.vehicle_year || ""} ${brandText} ${modelText}. `
      } else if (brandText) {
        description += ` for ${brandText}. `
      } else {
        description += `. `
      }

      // Add rim width, offset, and tyre details for staggered setup
      if (isStaggered) {
        if (rearRimWidth && frontRimWidth) {
          description += `This is a staggered set with ${rearRimWidth} width rear rims`

          // Add rear offset if available
          if (rearOffset) {
            description += ` (offset: ${rearOffset}mm)`
          }

          // Add rear tyre info if available
          if (hasTyres && rearTyreSize && hasStaggeredTyres) {
            description += ` with ${rearTyreSize} tyres`
          }

          description += ` and ${frontRimWidth} width front rims`

          // Add front offset if available
          if (frontOffset) {
            description += ` (offset: ${frontOffset}mm)`
          }

          // Add front tyre info if available
          if (hasTyres && frontTyreSize && hasStaggeredTyres) {
            description += ` with ${frontTyreSize} tyres`
          }

          description += `. `
        }
      } else {
        if (rearRimWidth) {
          description += `Rim width: ${rearRimWidth}. `
        }

        // Add offset if available for non-staggered setup
        if (frontOffset) {
          description += `Front offset: ${frontOffset}mm. `
        }
        if (rearOffset) {
          description += `Rear offset: ${rearOffset}mm. `
        }
      }

      // Add center bore if available (and not "None")
      if (centerBore) {
        description += `Center bore: ${centerBore}mm. `
      }

      if (values.paint_condition && values.paint_condition !== "not_specified") {
        description += `Paint condition: ${values.paint_condition}. `
      }

      // Add tyre information for non-staggered setup
      if (hasTyres) {
        if (hasStaggeredTyres) {
          if (values.front_tyre_size && values.rear_tyre_size) {
            description += `Includes staggered tyres with ${values.front_tyre_size} (front) and ${values.rear_tyre_size} (rear) in ${values.tyre_condition} condition. `
          } else {
            description += `Includes staggered tyres setup with different sizes for front and rear in ${values.tyre_condition} condition. `
          }
        } else if (values.tyre_size && !isStaggered) {
          description += `Includes ${values.tyre_size} tyres in ${values.tyre_condition} condition. `
        }
      } else {
        description += `These rims do not include tyres. Fitting of used or new tyres available for extra, please contact us. `
      }
    } else if (values.category === "package") {
      description += `${values.rim_quantity || "4"}x ${values.rim_size}"`

      // Add stud pattern if available
      if (studPattern) {
        description += ` ${studPattern}`
      }

      // Add "staggered" if applicable
      if (isStaggered) {
        description += " staggered"
      }

      description += " rims"

      if (brandText && modelText) {
        description += ` for ${values.vehicle_year || ""} ${brandText} ${modelText}`
      } else if (brandText) {
        description += ` for ${brandText}`
      }

      if (hasTyres && !isStaggered && values.tyre_size) {
        description += ` with ${values.tyre_size} tyres in ${values.tyre_condition} condition`
      }

      description += `. `

      // Add rim width, offset, and tyre details for staggered setup
      if (isStaggered) {
        if (rearRimWidth && frontRimWidth) {
          description += `This is a staggered set with ${rearRimWidth} width rear rims`

          // Add rear offset if available
          if (rearOffset) {
            description += ` (offset: ${rearOffset}mm)`
          }

          // Add rear tyre info if available
          if (hasTyres && rearTyreSize) {
            description += ` with ${rearTyreSize} tyres`
          }

          description += ` and ${frontRimWidth} width front rims`

          // Add front offset if available
          if (frontOffset) {
            description += ` (offset: ${frontOffset}mm)`
          }

          // Add front tyre info if available
          if (hasTyres && frontTyreSize) {
            description += ` with ${frontTyreSize} tyres`
          }

          description += `. `
        }
      } else {
        if (rearRimWidth) {
          description += `Rim width: ${rearRimWidth}. `
        }

        // Add offset if available for non-staggered setup
        if (frontOffset) {
          description += `Front offset: ${frontOffset}mm. `
        }
        if (rearOffset) {
          description += `Rear offset: ${rearOffset}mm. `
        }
      }

      // Add center bore if available (and not "None")
      if (centerBore) {
        description += `Center bore: ${centerBore}mm. `
      }

      if (values.paint_condition && values.paint_condition !== "not_specified") {
        description += `Rim paint condition: ${values.paint_condition}. `
      }

      if (!hasTyres) {
        description += `This package does not include tyres. Fitting of used or new tyres available for extra, please contact us. `
      }
    }

    // Add a generic closing statement
    description += "Please contact us for more details or to check fitment for your vehicle."

    // Capitalize first letter of each sentence
    return capitalizeFirstLetter(description)
  }

  // Update the onSubmit function to validate required fields
  const onSubmit = async (values: ProductFormValues) => {
    // Reset errors
    setFormErrors([])

    // Additional validation for required fields
    const errors = []

    if (values.category === "rim" && (!values.vehicle_brand || values.vehicle_brand === "not_specified")) {
      errors.push("Vehicle brand is required for rim products")
    }

    if (values.vehicle_brand === "Other" && !values.custom_brand) {
      errors.push("Custom brand name is required when 'Other' is selected")
    }

    if (!values.price || values.price <= 0) {
      errors.push("Price must be greater than $0")
    }

    if (values.category === "rim" && (!values.rim_size || values.rim_size === "not_specified")) {
      errors.push("Rim size is required for rim products")
    }

    if (errors.length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setIsSubmittingForm(true)
    setIsProcessing(true)

    try {
      // First, upload any pending images
      let finalImages = [...images.filter((img) => !img.isPending)]

      if (pendingFiles.length > 0 && imageUploaderRef.current) {
        try {
          const uploadedImages = await imageUploaderRef.current.uploadPendingFiles()
          finalImages = [...finalImages, ...uploadedImages]
        } catch (error) {
          console.error("Failed to upload images:", error)
          toast({
            title: "Image Upload Failed",
            description: "Failed to upload one or more images. Please try again.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          setIsSubmittingForm(false)
          setIsProcessing(false)
          return
        }
      }

      // Get images marked for deletion
      const imagesToDelete = imageUploaderRef.current?.getImagesToDelete() || []

      const isNewProduct = !product
      const method = isNewProduct ? "POST" : "PUT"
      const url = isNewProduct ? "/api/admin/products" : `/api/admin/products/${product.id}`

      // Use custom title and description if they're being edited, otherwise use generated ones
      const title = editingTitle ? customTitle : generateTitle(values)
      const description = editingDescription ? customDescription : generateDescription(values)

      // Get the effective center bore value (either selected or custom)
      const effectiveCenterBore = values.center_bore === "Other" ? values.custom_center_bore : values.center_bore

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price: values.price,
          category: values.category,
          in_stock: values.in_stock,
          featured: values.featured,
          vehicle_year: values.vehicle_year,
          vehicle_brand: values.vehicle_brand,
          vehicle_model: values.vehicle_model,
          rim_size: values.rim_size,
          tyre_size: values.tyre_size,
          front_tyre_size: values.front_tyre_size,
          rear_tyre_size: values.rear_tyre_size,
          tyre_condition: values.tyre_condition,
          paint_condition: values.paint_condition,
          rim_quantity: values.rim_quantity,
          tyre_quantity: values.tyre_quantity,
          custom_brand: values.custom_brand,
          stud_pattern: values.stud_pattern,
          center_bore: values.center_bore,
          custom_center_bore: values.custom_center_bore,
          rim_width: values.rim_width,
          is_staggered: values.is_staggered,
          has_staggered_tyres: values.has_staggered_tyres,
          front_rim_width: values.front_rim_width,
          front_offset: values.front_offset,
          rear_offset: values.rear_offset,
          images: finalImages,
          imagesToDelete: imagesToDelete, // Include images to delete
          is_staggered_tyres: values.is_staggered_tyres,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save product")
      }

      toast({
        title: isNewProduct ? "Product created" : "Product updated",
        description: isNewProduct
          ? "Your product has been created successfully."
          : "Your product has been updated successfully.",
      })

      if (isNewProduct) {
        // For new products, show the confirmation box instead of redirecting
        setProductCreated(true)
      } else {
        // For updates, use Next.js router for client-side navigation
        router.push("/admin/products")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsSubmittingForm(false)
      setIsProcessing(false)
      // Clear pending files
      setPendingFiles([])
    }
  }

  // Add a function to handle creating a new product
  const handleCreateNew = () => {
    // Reset the form to default values
    form.reset({
      price: 0,
      category: "rim",
      in_stock: true,
      featured: false,
      vehicle_year: "",
      vehicle_brand: "",
      vehicle_model: "",
      rim_size: "",
      tyre_size: "",
      front_tyre_size: "",
      rear_tyre_size: "",
      tyre_condition: "No tyres",
      paint_condition: "",
      rim_quantity: "4",
      tyre_quantity: "4",
      custom_brand: "",
      stud_pattern: "",
      center_bore: "",
      custom_center_bore: "",
      rim_width: "",
      is_staggered: false,
      has_staggered_tyres: false,
      front_rim_width: "",
      custom_title: "",
      custom_description: "",
      is_staggered_tyres: false,
      front_offset: "",
      rear_offset: "",
    })

    // Clear images
    setImages([])

    // Reset the created state
    setProductCreated(false)

    // Clear any form errors
    setFormErrors([])
  }

  // Add a function to go back to products list
  const handleGoToProducts = () => {
    // Use Next.js router for client-side navigation instead of full page reload
    router.push("/admin/products")
  }

  // If product was created successfully, show the confirmation box
  if (productCreated) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold">Product Created Successfully</h2>
              <p className="mb-6 text-muted-foreground">What would you like to do next?</p>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                <Button onClick={handleCreateNew} className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Create Another Product
                </Button>
                <Button variant="outline" onClick={handleGoToProducts} className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    ></path>
                  </svg>
                  Back to Products
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Otherwise show the form
  return (
    <div className="space-y-6">
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Processing Product</p>
            <p className="text-sm text-muted-foreground mt-2">
              {pendingFiles.length > 0
                ? `Uploading ${pendingFiles.length} image${pendingFiles.length > 1 ? "s" : ""}...`
                : "Saving product information..."}
            </p>
          </div>
        </div>
      )}

      {/* Display form validation errors */}
      {formErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-medium">Required Information</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Product Type <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <Select
                        defaultValue={product?.category || ""}
                        onValueChange={(value) => {
                          form.setValue("category", value as z.infer<typeof productSchema>["category"])
                          setSelectedCategory(value as z.infer<typeof productSchema>["category"])
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rim">Rim</SelectItem>
                          <SelectItem value="tyre">Tyre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Price ($) <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Details Card - Only show for rim and package categories */}
          {watchCategory !== "tyre" && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-medium">Vehicle Details</h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="vehicle_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Year</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "not_specified"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not_specified">Not specified</SelectItem>
                            {vehicleYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle_brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Vehicle Brand <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "not_specified"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not_specified">Not specified</SelectItem>
                            {vehicleBrands.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showCustomBrand && (
                    <FormField
                      control={form.control}
                      name="custom_brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Custom Brand Name <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter brand name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="vehicle_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Model</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "not_specified"}
                          disabled={!selectedBrand || selectedBrand === "not_specified"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedBrand ? "Select model" : "Select brand first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not_specified">Not specified</SelectItem>
                            {selectedBrand &&
                              selectedBrand !== "not_specified" &&
                              (vehicleModelsByBrand[selectedBrand] || []).map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="in_stock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>In Stock</FormLabel>
                    <FormDescription>Show as available on the site</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>Show in featured section</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Rim & Tyre Details Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-medium">
                {watchCategory === "tyre" ? "Tyre Details" : "Rim & Tyre Details"}
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Show rim size only for rim and package categories */}
                {watchCategory !== "tyre" && (
                  <FormField
                    control={form.control}
                    name="rim_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Rim Size (inches) <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "not_specified"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rim size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not_specified">Not specified</SelectItem>
                            {rimSizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}"
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Show tyre size for all categories */}
                {watchCategory === "tyre" && (
                  <>
                    <FormField
                      control={form.control}
                      name="is_staggered_tyres"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Staggered Tyres</FormLabel>
                            <FormDescription>Different sizes for front and rear tyres</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {!form.watch("is_staggered_tyres") && (
                      <FormField
                        control={form.control}
                        name="tyre_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tyre Size</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 225/45R17" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch("is_staggered_tyres") && (
                      <>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="front_tyre_size"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tyre Size (Front)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 225/45R17" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="rear_tyre_size"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tyre Size (Rear)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 255/40R17" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Show tyre condition for all categories */}
                <FormField
                  control={form.control}
                  name="tyre_condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tyre Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tyre condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          {tyreConditions.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Show tyre quantity for tyre category */}
                {watchCategory === "tyre" && (
                  <FormField
                    control={form.control}
                    name="tyre_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Tyres</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "4"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quantity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tyreQuantities.map((qty) => (
                              <SelectItem key={qty} value={qty}>
                                {qty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Show staggered setup only for rim and package categories */}
                {watchCategory !== "tyre" && (
                  <>
                    <FormField
                      control={form.control}
                      name="is_staggered"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Staggered Rim Setup</FormLabel>
                            <FormDescription>Different widths for front and rear rims</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Add staggered tyres checkbox for rim category */}
                    {watchCategory === "rim" && (
                      <FormField
                        control={form.control}
                        name="has_staggered_tyres"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Staggered Tyres</FormLabel>
                              <FormDescription>Different sizes for front and rear tyres</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

                {/* Show rim quantity only for rim and package categories */}
                {watchCategory !== "tyre" && (
                  <FormField
                    control={form.control}
                    name="rim_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Rims</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "4"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quantity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rimQuantities.map((qty) => (
                              <SelectItem key={qty} value={qty}>
                                {qty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Show offset fields for rim category */}
                {watchCategory !== "tyre" && (
                  <>
                    <FormField
                      control={form.control}
                      name="front_offset"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offset Fronts (mm)</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="e.g. 35 or -10" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            The distance from the mounting surface to the wheel centerline (positive or negative)
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rear_offset"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offset Rears (mm)</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="e.g. 35 or -10" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            The distance from the mounting surface to the wheel centerline (positive or negative)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Show rim width fields */}
                {watchCategory !== "tyre" && isStaggered ? (
                  <>
                    <FormField
                      control={form.control}
                      name="front_rim_width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rim Width (Front)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "not_specified"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select front rim width" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_specified">Not specified</SelectItem>
                              {rimWidths.map((width) => (
                                <SelectItem key={width} value={width}>
                                  {width}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rim_width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rim Width (Rear)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "not_specified"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rear rim width" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_specified">Not specified</SelectItem>
                              {rimWidths.map((width) => (
                                <SelectItem key={width} value={width}>
                                  {width}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : watchCategory !== "tyre" ? (
                  <FormField
                    control={form.control}
                    name="rim_width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rim Width</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "not_specified"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rim width" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not_specified">Not specified</SelectItem>
                            {rimWidths.map((width) => (
                              <SelectItem key={width} value={width}>
                                {width}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        <FormDescription>The width of the rim from inner to outer edge</FormDescription>
                      </FormItem>
                    )}
                  />
                ) : null}

                {/* Show stud pattern and center bore only for rim and package categories */}
                {watchCategory !== "tyre" && (
                  <>
                    <FormField
                      control={form.control}
                      name="stud_pattern"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stud Pattern/PCD</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "not_specified"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stud pattern" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_specified">Not specified</SelectItem>

                              {/* Most Common Section */}
                              <SelectItem value="5x114.3" className="font-semibold">
                                5x114.3 (Most Common)
                              </SelectItem>
                              <SelectItem value="5x120" className="font-semibold">
                                5x120 (Most Common)
                              </SelectItem>

                              <Separator className="my-2" />

                              {/* Standard Patterns */}
                              {commonStudPatterns
                                .filter((pattern) => !["5x114.3", "5x120", "Other"].includes(pattern.value))
                                .map((pattern) => (
                                  <SelectItem key={pattern.value} value={pattern.value}>
                                    {pattern.value}
                                  </SelectItem>
                                ))}

                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          <FormDescription>
                            The stud pattern (PCD) is the number of wheel studs and their spacing
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="center_bore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Center Bore (mm)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "not_specified"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select center bore" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_specified">Not specified</SelectItem>
                              {centerBoreSizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size === "Other" ? "Other" : size === "None" ? "None" : `${size} mm`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          <FormDescription>The diameter of the center hole that fits over the hub</FormDescription>
                        </FormItem>
                      )}
                    />

                    {showCustomCenterBore && (
                      <FormField
                        control={form.control}
                        name="custom_center_bore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Center Bore (mm)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter center bore size"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>Enter the center bore size in millimeters</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="paint_condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paint Condition</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "not_specified"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select paint condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_specified">Not specified</SelectItem>
                              {paintConditions.map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                  {condition}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Show tyre size fields based on category and staggered setup */}
                {showTyreFields && watchCategory !== "tyre" && (
                  <>
                    {!hasStaggeredTyres ? (
                      <FormField
                        control={form.control}
                        name="tyre_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tyre Size</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 225/45R17" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              Enter the tyre size in the format: width/aspect-ratioRrim (e.g. 225/45R17)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name="front_tyre_size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tyre Size (Front)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 225/45R17" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="rear_tyre_size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tyre Size (Rear)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 255/40R17" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Auto-generated title and description preview */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-medium">Generated Content Preview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">Title:</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTitle(!editingTitle)}
                      className="flex items-center gap-1 text-xs"
                    >
                      {editingTitle ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Using custom title
                        </>
                      ) : (
                        <>
                          <Edit className="h-3.5 w-3.5" />
                          Edit title
                        </>
                      )}
                    </Button>
                  </div>
                  {editingTitle ? (
                    <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className="mb-1" />
                  ) : (
                    <div className="p-3 bg-muted rounded-md">
                      {generatedTitle || "Title will be generated based on your selections"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">Description:</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDescription(!editingDescription)}
                      className="flex items-center gap-1 text-xs"
                    >
                      {editingDescription ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Using custom description
                        </>
                      ) : (
                        <>
                          <Edit className="h-3.5 w-3.5" />
                          Edit description
                        </>
                      )}
                    </Button>
                  </div>
                  {editingDescription ? (
                    <Textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      rows={5}
                      className="mb-1"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                      {generatedDescription || "Description will be generated based on your selections"}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {editingTitle || editingDescription
                    ? "You are using custom content. Click the buttons above to return to auto-generated content."
                    : "This content will be automatically generated based on the details you provide above."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-medium">Product Images</h3>
              <ImageUploader
                ref={imageUploaderRef}
                productId={product?.id}
                images={images}
                onChange={setImages}
                onUploadStatusChange={setIsUploadingImages}
                deferUpload={true} // Always defer uploads for both new and existing products
                pendingFiles={pendingFiles}
                setPendingFiles={setPendingFiles}
                isEditing={!!product} // Pass true if editing an existing product
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Upload up to 6 images. The first image will be used as the main product image.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                // Clean up temporary images before navigating away
                if (!product) {
                  await cleanupTemporaryImages()
                }
                // Use Next.js router for client-side navigation
                router.push("/admin/products")
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product
                ? "Update Product"
                : pendingFiles.length > 0
                  ? `Create Product & Upload ${pendingFiles.length} Image${pendingFiles.length > 1 ? "s" : ""}`
                  : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
