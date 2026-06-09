import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getBookedSlots, generateAvailableSlots, autoAssignStaff } from '../lib/bookings'
import { triggerConfirmationEmail } from '../lib/bookings'

const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID

export const Route = createFileRoute('/admin')({
  component: Admin,
})

function Admin() {
  const [bookings, setBookings] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // New booking form state
  const [formService, setFormService] = useState<any>(null)
  const [formStaff, setFormStaff] = useState<any>(null)
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formSlot, setFormSlot] = useState('')
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formSlots, setFormSlots] = useState<string[]>([])
  const [formBookedSlots, setFormBookedSlots] = useState<any[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetchAll()
  }, [selectedDate])

  useEffect(() => {
    if (formService && formDate) {
      setSlotsLoading(true)
      getBookedSlots(BUSINESS_ID, formStaff?.id || null, formDate)
        .then(booked => {
          setFormBookedSlots(booked)
          const slots = generateAvailableSlots(
            booked,
            formService.duration_minutes,
            formDate,
            formStaff?.id || null,
            formStaff ? undefined : staff
          )
          setFormSlots(slots)
          setFormSlot('')
        })
        .finally(() => setSlotsLoading(false))
    }
  }, [formService, formStaff, formDate, staff])

  async function fetchAll() {
    setLoading(true)
    const startOfDay = `${selectedDate}T00:00:00+05:30`
    const endOfDay = `${selectedDate}T23:59:59+05:30`

    const [bookingsRes, staffRes, servicesRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('*, services(name, duration_minutes), staff(name)')
        .eq('business_id', BUSINESS_ID)
        .gte('booking_datetime', startOfDay)
        .lte('booking_datetime', endOfDay)
        .order('booking_datetime', { ascending: true }),
      supabase.from('staff').select('*').eq('business_id', BUSINESS_ID),
      supabase.from('services').select('*').eq('business_id', BUSINESS_ID),
    ])

    setBookings(bookingsRes.data || [])
    setStaff(staffRes.data || [])
    setServices(servicesRes.data || [])
    setLoading(false)
  }

  async function handleAddBooking() {
    if (!formName || !formService || !formSlot) {
      setSaveError('Please fill in name, service and time')
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      let assignedStaff = formStaff
      if (!assignedStaff) {
        assignedStaff = autoAssignStaff(
          new Date(formSlot),
          formService.duration_minutes,
          formBookedSlots,
          staff
        )
      }

      const { data: insertData, error } = await supabase.from('bookings').insert({
        business_id: BUSINESS_ID,
        service_id: formService.id,
        staff_id: assignedStaff?.id || null,
        customer_name: formName,
        customer_email: formEmail || null,
        customer_phone: formPhone || null,
        booking_datetime: formSlot,
        status: 'confirmed',
        notes: formNotes || null,
      }).select().single()

      if (error) throw error

      setShowAddForm(false)
      // Trigger Google Calendar event
try {
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
    id: insertData.id,
    customer_name: formName,
    customer_email: formEmail || '',
    customer_phone: formPhone || '',
    booking_datetime: formSlot,
    duration_minutes: formService.duration_minutes,
    service_name: formService.name,
    staff_name: assignedStaff?.name,
    staff_refresh_token: staffRefreshToken,
    business_name: 'Luxe Studio',
    business_address: 'Indiranagar, Bengaluru',
    business_phone: '+91 98765 43210',
  })
} catch (e) {
  // Calendar sync failed silently — booking is still saved
  console.error('Calendar sync failed:', e)
}
      resetForm()
      fetchAll()
    } catch (err: any) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setFormService(null)
    setFormStaff(null)
    setFormDate(new Date().toISOString().split('T')[0])
    setFormSlot('')
    setFormName('')
    setFormPhone('')
    setFormEmail('')
    setFormNotes('')
    setFormSlots([])
    setSaveError('')
  }

  async function handleCancel(bookingId: string) {
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
    fetchAll()
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Bookings Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all appointments</p>
          </div>
          <button
            onClick={() => { setShowAddForm(v => !v); resetForm() }}
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            + Add Booking
          </button>
        </div>

        {/* Add booking form */}
        {showAddForm && (
          <div className="mb-8 border border-border rounded-2xl p-6 bg-card">
            <h2 className="font-medium mb-4">New Manual Booking</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Customer Name *</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2.5 text-sm"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                <input
                  type="tel"
                  className="w-full border rounded-lg p-2.5 text-sm"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                />
              </div>
              <div>
  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
  <input
    type="email"
    className="w-full border rounded-lg p-2.5 text-sm"
    value={formEmail}
    onChange={e => setFormEmail(e.target.value)}
  />
</div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Service *</label>
                <select
                  className="w-full border rounded-lg p-2.5 text-sm"
                  value={formService?.id || ''}
                  onChange={e => {
                    const s = services.find(s => s.id === e.target.value) || null
                    setFormService(s)
                    setFormSlot('')
                  }}
                >
                  <option value="">Select service...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — ₹{s.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Stylist</label>
                <select
                  className="w-full border rounded-lg p-2.5 text-sm"
                  value={formStaff?.id || ''}
                  onChange={e => {
                    const s = staff.find(s => s.id === e.target.value) || null
                    setFormStaff(s)
                    setFormSlot('')
                  }}
                >
                  <option value="">No preference</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Date *</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2.5 text-sm"
                  value={formDate}
                  onChange={e => {
                    setFormDate(e.target.value)
                    setFormSlot('')
                  }}
                />
              </div>
            </div>

            {/* Available slots */}
            {formService && formDate && (
              <div className="mt-4">
                <label className="text-xs text-muted-foreground mb-2 block">Select Time *</label>
                {slotsLoading ? (
                  <p className="text-sm text-gray-400">Loading slots...</p>
                ) : formSlots.length === 0 ? (
                  <p className="text-sm text-gray-400">No slots available for this date</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {formSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setFormSlot(slot)}
                        className={`p-2 rounded-lg border text-sm ${
                          formSlot === slot
                            ? 'bg-black text-white border-black'
                            : 'hover:border-black'
                        }`}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
              <input
                type="text"
                placeholder="e.g. Called in, wants Priya specifically"
                className="w-full border rounded-lg p-2.5 text-sm"
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
              />
            </div>

            {saveError && <p className="text-red-500 text-sm mt-3">{saveError}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddBooking}
                disabled={saving}
                className="bg-black text-white px-5 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Booking'}
              </button>
              <button
                onClick={() => { setShowAddForm(false); resetForm() }}
                className="border px-5 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Date picker */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="date"
            className="border rounded-lg p-2.5 text-sm"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">{bookings.length} appointment{bookings.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Bookings list */}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No appointments for this day</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-sm text-accent hover:underline"
            >
              + Add one manually
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div
                key={b.id}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  b.status === 'cancelled' ? 'opacity-50 bg-muted' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center w-16">
                    <p className="font-medium text-sm">{formatTime(b.booking_datetime)}</p>
                  </div>
                  <div>
                    <p className="font-medium">{b.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.services?.name} · {b.staff?.name || 'Unassigned'}
                      {b.customer_phone && ` · ${b.customer_phone}`}
                    </p>
                    {b.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{b.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {b.status}
                  </span>
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}