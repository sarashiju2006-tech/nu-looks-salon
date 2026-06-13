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
  allStaff?: Staff[],
  breaks?: any[]
) {
  const slotInterval = 30
  const slots: string[] = []

  if (staffId) {
    // Specific stylist — use their hours
    const staffMember = allStaff?.find(s => s.id === staffId)
    const startTime = (staffMember as any)?.today_start || staffMember?.default_start_time || '10:00'
    const endTime = (staffMember as any)?.today_end || staffMember?.default_end_time || '19:00'
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const endOfBusinessIST = new Date(`${date}T${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00+05:30`)

    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += slotInterval) {
        if (h === startHour && m < startMin) continue
        const slotTimeIST = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+05:30`)
        // Only apply the 1-hour minimum notice check for today
        const todayString = new Date().toISOString().split('T')[0]
        if (date === todayString) {
          const oneHourFromNow = new Date(new Date().getTime() + 60 * 60000)
          if (slotTimeIST < oneHourFromNow) continue
        }
        const slotEndIST = new Date(slotTimeIST.getTime() + serviceDuration * 60000)
        if (slotEndIST > endOfBusinessIST) continue

        const hasConflict = bookedSlots.some((booked: any) => {
          const bookedStart = new Date(booked.booking_datetime)
          const bookedDuration = booked.services?.duration_minutes || 60
          const bookedEnd = new Date(bookedStart.getTime() + bookedDuration * 60000)
          return slotTimeIST < bookedEnd && slotEndIST > bookedStart
        })
        const duringBreak = (breaks || []).some(b => {
  const breakStart = new Date(`${date}T${b.start_time}+05:30`)
  const breakEnd = new Date(`${date}T${b.end_time}+05:30`)
  return slotTimeIST < breakEnd && slotEndIST > breakStart
})
if (!hasConflict && !duringBreak) slots.push(slotTimeIST.toISOString())
      }
    }
  } else if (allStaff && allStaff.length > 0) {
    // No preference — find slots where at least one stylist is free
    // Use the widest possible window across all staff
    const earliestStart = allStaff.reduce((earliest, s) => {
      const t = (s as any).today_start || s.default_start_time || '10:00'
      return t < earliest ? t : earliest
    }, '19:00')
    const latestEnd = allStaff.reduce((latest, s) => {
      const t = (s as any).today_end || s.default_end_time || '19:00'
      return t > latest ? t : latest
    }, '10:00')

    const [startHour, startMin] = earliestStart.split(':').map(Number)
    const [endHour, endMin] = latestEnd.split(':').map(Number)
    const endOfBusinessIST = new Date(`${date}T${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00+05:30`)

    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += slotInterval) {
        if (h === startHour && m < startMin) continue
        const slotTimeIST = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+05:30`)
        // Only apply the 1-hour minimum notice check for today
        const todayString = new Date().toISOString().split('T')[0]
        if (date === todayString) {
          const oneHourFromNow = new Date(new Date().getTime() + 60 * 60000)
          if (slotTimeIST < oneHourFromNow) continue
        }
        const slotEndIST = new Date(slotTimeIST.getTime() + serviceDuration * 60000)
        if (slotEndIST > endOfBusinessIST) continue

        const anyFree = allStaff.some(s => {
          const sStart = (s as any).today_start || s.default_start_time || '10:00'
          const sEnd = (s as any).today_end || s.default_end_time || '19:00'
          const staffStart = new Date(`${date}T${sStart}:00+05:30`)
          const staffEnd = new Date(`${date}T${sEnd}:00+05:30`)
          if (slotTimeIST < staffStart || slotEndIST > staffEnd) return false
          return isStaffFreeForSlot(s.id, slotTimeIST, slotEndIST, bookedSlots)
        })
        const duringBreak = (breaks || []).some(b => {
  const breakStart = new Date(`${date}T${b.start_time}+05:30`)
  const breakEnd = new Date(`${date}T${b.end_time}+05:30`)
  return slotTimeIST < breakEnd && slotEndIST > breakStart
})
if (anyFree && !duringBreak) slots.push(slotTimeIST.toISOString())
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

export async function createBooking(booking: Booking, serviceIds?: string[]) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const response = await fetch(`${supabaseUrl}/functions/v1/create-booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify({ ...booking, service_ids: serviceIds || [] })
  })

  if (response.status === 429) {
    const err = await response.json()
    throw new Error(err.error)
  }

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to create booking')
  }

  return await response.json()
}

export async function triggerConfirmationEmail(bookingData: {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  booking_datetime: string
  old_google_event_id?: string
  duration_minutes: number
  service_name: string
  staff_name?: string
  stylist_email?: string
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
export async function getStaffAvailability(businessId: string, date: string) {
  // Get all staff
  const { data: allStaff } = await supabase
    .from('staff')
    .select('*')
    .eq('business_id', businessId)

  if (!allStaff) return []

  // Get any availability overrides for this date
  const { data: availability } = await supabase
    .from('staff_availability')
    .select('*')
    .in('staff_id', allStaff.map(s => s.id))
    .eq('date', date)

  // Merge — if no override exists, staff is available by default
  return allStaff.map(s => {
    const override = availability?.find(a => a.staff_id === s.id)
    const defaultStart = s.default_start_time || '10:00'
    const defaultEnd = s.default_end_time || '19:00'
    return {
      ...s,
      is_available: override ? override.is_available : true,
      today_start: override?.start_time || defaultStart,
      today_end: override?.end_time || defaultEnd,
      default_start_time: defaultStart,
      default_end_time: defaultEnd,
    }
  })
}

export async function setStaffAvailability(
  staffId: string,
  date: string,
  isAvailable: boolean
) {
  const { error } = await supabase
    .from('staff_availability')
    .upsert({
      staff_id: staffId,
      date,
      is_available: isAvailable,
    }, { onConflict: 'staff_id,date' })

  if (error) throw error
}
export async function updateStaffDefaultHours(
  staffId: string,
  startTime: string,
  endTime: string
) {
  console.log('updateStaffDefaultHours called:', staffId, startTime, endTime)
  const { error, data } = await supabase
    .from('staff')
    .update({ default_start_time: startTime, default_end_time: endTime })
    .eq('id', staffId)
    .select()
  if (error) throw error
}
export async function setStaffDailyHours(
  staffId: string,
  date: string,
  startTime: string,
  endTime: string
) {
  const { error } = await supabase
    .from('staff_availability')
    .upsert({
      staff_id: staffId,
      date,
      is_available: true,
      start_time: startTime,
      end_time: endTime,
    }, { onConflict: 'staff_id,date' })
  if (error) throw error
}export async function getBreaks(businessId: string) {
  const { data, error } = await supabase
    .from('breaks')
    .select('*')
    .eq('business_id', businessId)
    .order('start_time')
  if (error) throw error
  return data
}

export async function addBreak(businessId: string, name: string, startTime: string, endTime: string) {
  const { error } = await supabase
    .from('breaks')
    .insert({ business_id: businessId, name, start_time: startTime, end_time: endTime })
  if (error) throw error
}

export async function updateBreak(breakId: string, name: string, startTime: string, endTime: string) {
  const { error } = await supabase
    .from('breaks')
    .update({ name, start_time: startTime, end_time: endTime })
    .eq('id', breakId)
  if (error) throw error
}

export async function deleteBreak(breakId: string) {
  const { error } = await supabase
    .from('breaks')
    .delete()
    .eq('id', breakId)
  if (error) throw error
}