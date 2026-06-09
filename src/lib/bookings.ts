import { supabase } from './supabase'
import { Booking, Service, Staff } from './types'

export async function getServices(businessId: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
  
  if (error) throw error
  return data as Service[]
}

export async function getStaff(businessId: string) {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('business_id', businessId)
  
  if (error) throw error
  return data as Staff[]
}

export async function getBookedSlots(
  businessId: string,
  staffId: string | null,
  date: string
) {
  const startOfDayIST = `${date}T00:00:00+05:30`
  const endOfDayIST = `${date}T23:59:59+05:30`

  let query = supabase
    .from('bookings')
    .select('booking_datetime, service_id, staff_id, services(duration_minutes)')
    .eq('business_id', businessId)
    .gte('booking_datetime', startOfDayIST)
    .lte('booking_datetime', endOfDayIST)
    .eq('status', 'confirmed')

  if (staffId) {
    query = query.eq('staff_id', staffId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

function isStaffFreeForSlot(
  staffId: string,
  slotStart: Date,
  slotEnd: Date,
  bookedSlots: any[]
) {
  return !bookedSlots.some((booked: any) => {
    if (booked.staff_id !== staffId) return false
    const bookedStart = new Date(booked.booking_datetime)
    const bookedDuration = booked.services?.duration_minutes || 60
    const bookedEnd = new Date(bookedStart.getTime() + bookedDuration * 60000)
    return slotStart < bookedEnd && slotEnd > bookedStart
  })
}

export function generateAvailableSlots(
  bookedSlots: any[],
  serviceDuration: number,
  date: string,
  staffId?: string | null,
  allStaff?: Staff[]
) {
  const startHour = 10
  const endHour = 19
  const slotInterval = 30
  const slots: string[] = []
  const endOfBusinessIST = new Date(`${date}T${String(endHour).padStart(2, '0')}:00:00+05:30`)

  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += slotInterval) {
      const slotTimeIST = new Date(`${date}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00+05:30`)
      const slotEndIST = new Date(slotTimeIST.getTime() + serviceDuration * 60000)

      if (slotEndIST > endOfBusinessIST) continue

      if (staffId) {
        // Specific stylist selected — check only their availability
        const hasConflict = bookedSlots.some((booked: any) => {
          const bookedStart = new Date(booked.booking_datetime)
          const bookedDuration = booked.services?.duration_minutes || 60
          const bookedEnd = new Date(bookedStart.getTime() + bookedDuration * 60000)
          return slotTimeIST < bookedEnd && slotEndIST > bookedStart
        })
        if (!hasConflict) slots.push(slotTimeIST.toISOString())
      } else if (allStaff && allStaff.length > 0) {
        // No preference — check if at least one stylist is free
        const anyFree = allStaff.some(s =>
          isStaffFreeForSlot(s.id, slotTimeIST, slotEndIST, bookedSlots)
        )
        if (anyFree) slots.push(slotTimeIST.toISOString())
      }
    }
  }

  return slots
}

export function autoAssignStaff(
  slotStart: Date,
  serviceDuration: number,
  bookedSlots: any[],
  allStaff: Staff[]
): Staff | null {
  const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)

  // Filter to only free staff for this slot
  const freeStaff = allStaff.filter(s =>
    isStaffFreeForSlot(s.id, slotStart, slotEnd, bookedSlots)
  )

  if (freeStaff.length === 0) return null

  // Pick the one with fewest bookings today
  const bookingCounts = freeStaff.map(s => ({
    staff: s,
    count: bookedSlots.filter(b => b.staff_id === s.id).length
  }))

  bookingCounts.sort((a, b) => a.count - b.count)
  return bookingCounts[0].staff
}

export async function createBooking(booking: Booking) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function triggerConfirmationEmail(bookingData: {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  booking_datetime: string
  duration_minutes: number
  service_name: string
  staff_name?: string
  staff_refresh_token?: string
  business_name: string
  business_address: string
  business_phone: string
}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const response = await fetch(`${supabaseUrl}/functions/v1/confirm-booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify(bookingData)
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Edge function error: ${err}`)
  }

  return await response.json()
}