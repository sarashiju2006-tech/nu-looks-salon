export interface Business {
  id: string
  name: string
  type: string
  email: string
  phone: string
  address: string
  whatsapp_number: string
}

export interface Staff {
  id: string
  business_id: string
  name: string
  email: string
  default_start_time?: string
  default_end_time?: string
  google_refresh_token?: string
}

export interface Service {
  id: string
  business_id: string
  name: string
  duration_minutes: number
  price: number
  description: string
}

export interface Booking {
  id?: string
  business_id: string
  service_id?: string
  staff_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  booking_datetime: string
  status?: string
  notes?: string
}

export interface BookingService {
  id?: string
  booking_id: string
  service_id: string
}