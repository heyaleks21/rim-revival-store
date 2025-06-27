export type ProductCategory = "rim" | "tyre"

export interface Product {
  id: string
  title: string
  description: string
  price: number
  category: ProductCategory
  in_stock: boolean
  featured: boolean
  created_at: string
  updated_at: string
  images?: ProductImage[]
  // New fields for vehicle details
  vehicle_year?: string
  vehicle_brand?: string
  vehicle_model?: string
  rim_size?: string
  tyre_size?: string
  front_tyre_size?: string // Add this for front tyre size in staggered sets
  rear_tyre_size?: string // Add this for rear tyre size in staggered sets
  tyre_condition?: string
  paint_condition?: string
  rim_quantity?: string
  custom_brand?: string
  stud_pattern?: string
  center_bore?: string
  custom_center_bore?: string
  rim_width?: string
  is_staggered?: boolean
  front_rim_width?: string
  offset?: string // New field for rim offset
  front_offset?: string // New field for front rim offset in staggered sets
  rear_offset?: string // New field for rear rim offset in staggered sets
  custom_title?: string
  custom_description?: string
  has_staggered_tyres?: boolean
  is_staggered_tyres?: boolean
  product_images?: ProductImage[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  position: number
  created_at: string
}

export interface AdminUser {
  id: string
  username: string
  created_at: string
}

export interface AdminSession {
  id: string
  username: string
  created_at: string
  expires_at: string
}
