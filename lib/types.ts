export type Role = "tech" | "admin"
export type JobStatus = "draft" | "pending" | "paid" | "cancelled"
export type PaymentType = "onsite" | "remote"

export interface Profile {
  id: string
  role: Role
  full_name: string
  created_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  service_address: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

export interface Job {
  id: string
  customer_id: string
  created_by: string
  title: string
  line_items: LineItem[]
  subtotal: number
  discount_pct: number
  discount_amount: number
  total: number
  payment_type: PaymentType
  status: JobStatus
  payment_token: string
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  sent_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface JobWithCustomer extends Job {
  customers: Pick<Customer, "name" | "email" | "phone" | "service_address">
  profiles: Pick<Profile, "full_name">
}

// Supabase database type stub — replace with generated types from supabase gen types
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, "created_at">; Update: Partial<Profile> }
      customers: { Row: Customer; Insert: Omit<Customer, "id" | "created_at" | "updated_at">; Update: Partial<Customer> }
      jobs: { Row: Job; Insert: Omit<Job, "id" | "payment_token" | "created_at" | "updated_at">; Update: Partial<Job> }
      settings: { Row: { key: string; value: string }; Insert: { key: string; value: string }; Update: { value: string } }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
