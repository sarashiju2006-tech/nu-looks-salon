import { useState, useEffect } from 'react'
import { getServices, getStaffAvailability, getBookedSlots, generateAvailableSlots, autoAssignStaff, createBooking, triggerConfirmationEmail, getBreaks } from '../lib/bookings'
import { Service, Staff } from '../lib/types'
import { supabase } from '../lib/supabase'

const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID

export default function BookingWidget() {
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<any[]>([])

  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0)
  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0)

  useEffect(() => {
    getServices(BUSINESS_ID).then(setServices)
    getStaffAvailability(BUSINESS_ID, new Date().toISOString().split('T')[0]).then(setStaff)
  }, [])

  
  useEffect(() => {
    if (selectedServices.length > 0 && selectedDate) {
      setLoading(true)
      Promise.all([
        getBookedSlots(BUSINESS_ID, selectedStaff?.id || null, selectedDate),
        getStaffAvailability(BUSINESS_ID, selectedDate),
        getBreaks(BUSINESS_ID)
      ]).then(([booked, enrichedStaff, breaks]) => {
        setBookedSlots(booked)
        const slots = generateAvailableSlots(
          booked,
          totalDuration,
          selectedDate,
          selectedStaff?.id || null,
          selectedStaff ? enrichedStaff.filter(s => s.id === selectedStaff.id) : enrichedStaff,
          breaks
        )
        setAvailableSlots(slots)
      }).finally(() => setLoading(false))
    } else {
      setAvailableSlots([])
    }
  }, [selectedServices, selectedStaff, selectedDate])

  function toggleService(service: Service) {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id)
      if (exists) return prev.filter(s => s.id !== service.id)
      return [...prev, service]
    })
    setSelectedSlot('')
  }

  async function handleConfirm() {
    if (selectedServices.length === 0 || !selectedSlot || !customerName || !customerEmail || !customerPhone) {
      setError('Please fill in all fields')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setError('Please enter a valid email address')
      return
    }
    if (customerPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    setError('')

    try {
      let assignedStaff = selectedStaff
      if (!assignedStaff) {
        assignedStaff = autoAssignStaff(
          new Date(selectedSlot),
          totalDuration,
          bookedSlots,
          staff
        )
      }

      const booking = await createBooking({
        business_id: BUSINESS_ID,
        service_id: selectedServices[0].id, // primary service for backwards compat
        staff_id: assignedStaff?.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        booking_datetime: selectedSlot,
      }, selectedServices.map(s => s.id))

      

      await triggerConfirmationEmail({
        id: booking.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        booking_datetime: selectedSlot,
        duration_minutes: totalDuration,
        service_name: selectedServices.map(s => s.name).join(', '),
        staff_name: assignedStaff?.name,
        stylist_email: assignedStaff?.email ?? undefined,
        business_name: 'Luxe Studio',
        business_address: 'Indiranagar, Bengaluru',
        business_phone: '+91 98765 43210',
      })

      setConfirmed(true)
    } catch (err: any) {
      if (err.message?.includes('Too many bookings')) {
        setError('You have made too many bookings today. Please call us to book.')
      } else {
        setError('Something went wrong. Please try again.')
      }
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

  function getMaxDateString() {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
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

      {/* Services checklist */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Services</label>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {services.map(s => {
            const selected = !!selectedServices.find(sel => sel.id === s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggleService(s)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                  selected ? 'bg-black text-white border-black' : 'hover:border-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    selected ? 'bg-white border-white' : 'border-current'
                  }`}>
                    {selected && <span className="text-black text-xs">✓</span>}
                  </div>
                  <span className="text-sm">{s.name}</span>
                </div>
                <span className="text-sm opacity-75">{s.duration_minutes}min · ₹{s.price}</span>
              </button>
            )
          })}
        </div>

        {selectedServices.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm flex justify-between">
            <span className="text-gray-600">{selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} · {totalDuration} mins</span>
            <span className="font-medium">₹{totalPrice}</span>
          </div>
        )}
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
          <option value="">No preference — we'll assign the best available</option>
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
          max={getMaxDateString()}
          value={selectedDate}
          onChange={e => {
            setSelectedDate(e.target.value)
            setSelectedSlot('')
          }}
        />
      </div>

      {/* Time slots */}
      {selectedServices.length > 0 && selectedDate && (
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
            onBlur={e => {
              const val = e.target.value
              if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                setError('Please enter a valid email address')
              } else {
                setError('')
              }
            }}
          />
          <div className="flex items-center border rounded-lg overflow-hidden">
            <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r select-none">+91</span>
            <input
              type="tel"
              placeholder="10-digit phone number"
              className="flex-1 p-3 outline-none text-sm"
              value={customerPhone}
              maxLength={10}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '')
                setCustomerPhone(val)
              }}
            />
          </div>
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