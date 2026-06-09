import { useState, useEffect } from 'react'
import { getServices, getStaff, getBookedSlots, generateAvailableSlots, autoAssignStaff, createBooking, triggerConfirmationEmail } from '../lib/bookings'
import { Service, Staff } from '../lib/types'
import { supabase } from '../lib/supabase'

const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID

export default function BookingWidget() {
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<any[]>([])

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getServices(BUSINESS_ID).then(setServices)
    getStaff(BUSINESS_ID).then(setStaff)
  }, [])

  useEffect(() => {
    if (selectedService && selectedDate) {
      setLoading(true)
      // When no preference, fetch ALL bookings (no staff filter) so we can check all stylists
      getBookedSlots(BUSINESS_ID, selectedStaff?.id || null, selectedDate)
        .then(booked => {
          setBookedSlots(booked)
          const slots = generateAvailableSlots(
            booked,
            selectedService.duration_minutes,
            selectedDate,
            selectedStaff?.id || null,
            selectedStaff ? undefined : staff
          )
          setAvailableSlots(slots)
        })
        .finally(() => setLoading(false))
    }
  }, [selectedService, selectedStaff, selectedDate, staff])

  async function handleConfirm() {
    if (!selectedService || !selectedSlot || !customerName || !customerEmail || !customerPhone) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Auto-assign stylist if no preference selected
      let assignedStaff = selectedStaff
      if (!assignedStaff) {
        assignedStaff = autoAssignStaff(
          new Date(selectedSlot),
          selectedService.duration_minutes,
          bookedSlots,
          staff
        )
      }

      const booking = await createBooking({
        business_id: BUSINESS_ID,
        service_id: selectedService.id,
        staff_id: assignedStaff?.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        booking_datetime: selectedSlot,
      })

      // Get assigned staff's refresh token
      let staffRefreshToken = null
      if (assignedStaff?.id) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('google_refresh_token')
          .eq('id', assignedStaff.id)
          .single()
        staffRefreshToken = staffData?.google_refresh_token
      }

      await triggerConfirmationEmail({
        id: booking.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        booking_datetime: selectedSlot,
        duration_minutes: selectedService.duration_minutes,
        service_name: selectedService.name,
        staff_name: assignedStaff?.name,
        staff_refresh_token: staffRefreshToken,
        business_name: 'Luxe Studio',
        business_address: 'Indiranagar, Bengaluru',
        business_phone: '+91 98765 43210',
      })

      setConfirmed(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function formatSlot(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    })
  }

  function getTodayString() {
    return new Date().toISOString().split('T')[0]
  }

  if (confirmed) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-2xl font-semibold mb-2">Booking Confirmed!</h3>
        <p className="text-gray-500">See you soon, {customerName}!</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Book an Appointment</h2>

      {/* Service */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Service</label>
        <select
          className="w-full border rounded-lg p-3"
          value={selectedService?.id || ''}
          onChange={e => {
            const s = services.find(s => s.id === e.target.value) || null
            setSelectedService(s)
            setSelectedSlot('')
          }}
        >
          <option value="">Choose a service...</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.duration_minutes} mins — ₹{s.price}
            </option>
          ))}
        </select>
      </div>

      {/* Stylist */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Preferred Stylist <span className="text-gray-400">(optional)</span></label>
        <select
          className="w-full border rounded-lg p-3"
          value={selectedStaff?.id || ''}
          onChange={e => {
            const s = staff.find(s => s.id === e.target.value) || null
            setSelectedStaff(s)
            setSelectedSlot('')
          }}
        >
          <option value="">No preference</option>
          {staff.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Date</label>
        <input
          type="date"
          className="w-full border rounded-lg p-3"
          min={getTodayString()}
          value={selectedDate}
          onChange={e => {
            setSelectedDate(e.target.value)
            setSelectedSlot('')
          }}
        />
      </div>

      {/* Time slots */}
      {selectedService && selectedDate && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Time</label>
          {loading ? (
            <p className="text-gray-400">Loading slots...</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-gray-400">No slots available for this date</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2 rounded-lg border text-sm ${
                    selectedSlot === slot
                      ? 'bg-black text-white border-black'
                      : 'hover:border-black'
                  }`}
                >
                  {formatSlot(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer details */}
      {selectedSlot && (
        <div className="mb-6 space-y-3">
          <label className="block text-sm font-medium">Your Details</label>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-lg p-3"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-lg p-3"
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full border rounded-lg p-3"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {selectedSlot && (
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Confirming...' : 'Confirm Booking'}
        </button>
      )}
    </div>
  )
}