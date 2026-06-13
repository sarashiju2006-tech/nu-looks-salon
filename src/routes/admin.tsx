import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getBookedSlots, generateAvailableSlots, autoAssignStaff, getStaffAvailability, setStaffAvailability, triggerConfirmationEmail, updateStaffDefaultHours, setStaffDailyHours, getBreaks, addBreak, updateBreak, deleteBreak } from '../lib/bookings'

const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID

export const Route = createFileRoute('/admin')({
  component: Admin,
})

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN

function Admin() {
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem('admin_unlocked') === 'true')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [staffWithAvailability, setStaffWithAvailability] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
const [searchQuery, setSearchQuery] = useState('')
  const [reassigning, setReassigning] = useState<string | null>(null)
  const [reassignStaffIds, setReassignStaffIds] = useState<Record<string, string>>({})
  const [rescheduling, setRescheduling] = useState<string | null>(null)
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([])
  const [rescheduleDate, setRescheduleDate] = useState<Record<string, string>>({})
  const [rescheduleSlot, setRescheduleSlot] = useState<Record<string, string>>({})
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null)
const [editingDefault, setEditingDefault] = useState(false)
const [tempStart, setTempStart] = useState('')
const [tempEnd, setTempEnd] = useState('')

  const [formServices, setFormServices] = useState<any[]>([])
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
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null)
  const [saveError, setSaveError] = useState('')
  const [breaks, setBreaks] = useState<any[]>([])
const [editingBreak, setEditingBreak] = useState<any>(null)
const [showAddBreak, setShowAddBreak] = useState(false)
const [newBreakName, setNewBreakName] = useState('')
const [newBreakStart, setNewBreakStart] = useState('')
const [newBreakEnd, setNewBreakEnd] = useState('')

  const formTotalDuration = formServices.reduce((sum: number, s: any) => sum + s.duration_minutes, 0)

  useEffect(() => { fetchAll() }, [selectedDate])

  useEffect(() => {
    if (formServices.length > 0 && formDate) {
      setSlotsLoading(true)
      Promise.all([
        getBookedSlots(BUSINESS_ID, formStaff?.id || null, formDate),
        getStaffAvailability(BUSINESS_ID, formDate),
        getBreaks(BUSINESS_ID)
      ]).then(([booked, enrichedStaff, breaks]) => {
        setFormBookedSlots(booked)
        const slots = generateAvailableSlots(
          booked,
          formTotalDuration,
          formDate,
          formStaff?.id || null,
          formStaff ? enrichedStaff.filter(s => s.id === formStaff.id) : enrichedStaff,
          breaks
        )
        setFormSlots(slots)
        setFormSlot('')
      }).finally(() => setSlotsLoading(false))
    } else {
      setFormSlots([])
    }
  }, [formServices, formStaff, formDate])

  async function fetchAll() {
    setLoading(true)
    const startOfDay = `${selectedDate}T00:00:00+05:30`
    const endOfDay = `${selectedDate}T23:59:59+05:30`

    const [bookingsRes, staffRes, servicesRes, availabilityRes, breaksRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('*, services(name, duration_minutes), staff(name)')
        .eq('business_id', BUSINESS_ID)
        .gte('booking_datetime', startOfDay)
        .lte('booking_datetime', endOfDay)
        .order('booking_datetime', { ascending: true }),
      supabase.from('staff').select('*').eq('business_id', BUSINESS_ID),
      supabase.from('services').select('*').eq('business_id', BUSINESS_ID),
      getStaffAvailability(BUSINESS_ID, selectedDate),
      getBreaks(BUSINESS_ID),
    ])

    setBookings(bookingsRes.data || [])
    setStaff(staffRes.data || [])
    setServices(servicesRes.data || [])
    setStaffWithAvailability(availabilityRes)
    setBreaks(breaksRes || [])
    setLoading(false)
  }

  async function handleToggleAvailability(staffId: string, currentlyAvailable: boolean) {
    await setStaffAvailability(staffId, selectedDate, !currentlyAvailable)
    fetchAll()
  }
  async function handleSaveDefaultHours(staffId: string) {
    await updateStaffDefaultHours(staffId, tempStart, tempEnd)
    // Clear today's override so new default takes effect
    await supabase
      .from('staff_availability')
      .delete()
      .eq('staff_id', staffId)
      .eq('date', selectedDate)
    setEditingDefault(false)
    setSettingsOpen(null)
    await fetchAll()
  }

  async function handleSaveDailyHours(staffId: string) {
    await setStaffDailyHours(staffId, selectedDate, tempStart, tempEnd)
    setEditingDefault(false)
    setSettingsOpen(null)
    fetchAll()
  }
  async function handleAddBreak() {
    if (!newBreakName || !newBreakStart || !newBreakEnd) return
    await addBreak(BUSINESS_ID, newBreakName, newBreakStart, newBreakEnd)
    setShowAddBreak(false)
    setNewBreakName('')
    setNewBreakStart('')
    setNewBreakEnd('')
    fetchAll()
  }

  async function handleUpdateBreak() {
    if (!editingBreak) return
    await updateBreak(editingBreak.id, editingBreak.name, editingBreak.start_time, editingBreak.end_time)
    setEditingBreak(null)
    fetchAll()
  }

  async function handleDeleteBreak(breakId: string) {
    await deleteBreak(breakId)
    fetchAll()
  }

  async function handleReschedule(bookingId: string) {
    const slot = rescheduleSlot[bookingId]
    if (!slot) return
    setRescheduling(bookingId)
    try {
      const booking = bookings.find(b => b.id === bookingId)
      const { data: staffData } = await supabase
        .from('staff')
        .select('name, email')
        .eq('id', booking.staff_id)
        .single()

      await supabase.from('bookings').update({
        booking_datetime: slot,
        google_event_id: null
      }).eq('id', bookingId)

      await triggerConfirmationEmail({
        id: booking.id,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email || '',
        customer_phone: booking.customer_phone || '',
        booking_datetime: slot,
        duration_minutes: booking.services?.duration_minutes || 60,
        service_name: booking.services?.name || '',
        staff_name: staffData?.name,
        stylist_email: staffData?.email ?? undefined,
        old_google_event_id: booking.google_event_id,
        business_name: 'Luxe Studio',
        business_address: 'Indiranagar, Bengaluru',
        business_phone: '+91 98765 43210',
      })

      setRescheduling(null)
      setRescheduleSlots([])
      setRescheduleDate(prev => { const next = { ...prev }; delete next[bookingId]; return next })
      setRescheduleSlot(prev => { const next = { ...prev }; delete next[bookingId]; return next })
      fetchAll()
    } catch (err) {
      console.error('Reschedule failed:', err)
      setRescheduling(null)
    }
  }

  async function handleReassign(bookingId: string) {
    const reassignStaffId = reassignStaffIds[bookingId]
    if (!reassignStaffId) return
    setReassigning(bookingId)
    try {
      const booking = bookings.find(b => b.id === bookingId)

      await supabase.from('bookings').update({
        staff_id: reassignStaffId,
        google_event_id: null
      }).eq('id', bookingId)

      const { data: newStaffData } = await supabase
        .from('staff')
        .select('name, email')
        .eq('id', reassignStaffId)
        .single()

      await triggerConfirmationEmail({
        id: booking.id,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email || '',
        customer_phone: booking.customer_phone || '',
        booking_datetime: booking.booking_datetime,
        duration_minutes: booking.services?.duration_minutes || 60,
        service_name: booking.services?.name || '',
        staff_name: newStaffData?.name,
        stylist_email: newStaffData?.email ?? undefined,
        old_google_event_id: booking.google_event_id,
        business_name: 'Luxe Studio',
        business_address: 'Indiranagar, Bengaluru',
        business_phone: '+91 98765 43210',
      })

      setReassigning(null)
      setReassignStaffIds(prev => { const next = { ...prev }; delete next[bookingId]; return next })
      fetchAll()
    } catch (err) {
      console.error('Reassign failed:', err)
      setReassigning(null)
    }
  }

  async function handleAddBooking() {
    if (!formName || formServices.length === 0 || !formSlot) {
      setSaveError('Please fill in name, service and time')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      let assignedStaff = formStaff
      if (!assignedStaff) {
        assignedStaff = autoAssignStaff(new Date(formSlot), formTotalDuration, formBookedSlots, staff)
      }

      const { data: insertData, error } = await supabase.from('bookings').insert({
        business_id: BUSINESS_ID,
        service_id: formServices[0].id,
        staff_id: assignedStaff?.id || null,
        customer_name: formName,
        customer_email: formEmail || null,
        customer_phone: formPhone || null,
        booking_datetime: formSlot,
        status: 'confirmed',
        notes: formNotes || null,
      }).select().single()

      if (error) throw error

      if (formServices.length > 1) {
        await supabase.from('booking_services').insert(
          formServices.map((s: any) => ({ booking_id: insertData.id, service_id: s.id }))
        )
      }

      try {
        await triggerConfirmationEmail({
          id: insertData.id,
          customer_name: formName,
          customer_email: formEmail || '',
          customer_phone: formPhone || '',
          booking_datetime: formSlot,
          duration_minutes: formTotalDuration,
          service_name: formServices.map((s: any) => s.name).join(', '),
          staff_name: assignedStaff?.name,
          stylist_email: assignedStaff?.email ?? undefined,
          business_name: 'Luxe Studio',
          business_address: 'Indiranagar, Bengaluru',
          business_phone: '+91 98765 43210',
        })
      } catch (e) {
        console.error('Calendar sync failed:', e)
      }

      setShowAddForm(false)
      resetForm()
      fetchAll()
    } catch (err: any) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setFormServices([])
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
    if (cancelConfirm !== bookingId) {
      setCancelConfirm(bookingId)
      setTimeout(() => setCancelConfirm(prev => prev === bookingId ? null : prev), 4000)
      return
    }
    setCancelConfirm(null)
    const booking = bookings.find(b => b.id === bookingId)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
    if (booking?.google_event_id) {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        await fetch(`${supabaseUrl}/functions/v1/confirm-booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            cancel_only: true,
            old_google_event_id: booking.google_event_id,
          })
        })
      } catch (e) {
        console.error('Calendar delete failed:', e)
      }
    }
    fetchAll()
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
    })
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-sm p-8 border border-border rounded-2xl bg-card">
          <h1 className="text-xl font-semibold mb-2">Admin Access</h1>
          <p className="text-muted-foreground text-sm mb-6">Enter your PIN to continue.</p>
          <input
            type="password"
            placeholder="Enter PIN"
            className="w-full border rounded-lg p-3 text-sm mb-3"
            value={pin}
            onChange={e => { setPin(e.target.value); setPinError(false) }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (pin === ADMIN_PIN) {
                  sessionStorage.setItem('admin_unlocked', 'true')
                  setUnlocked(true)
                } else {
                  setPinError(true)
                }
              }
            }}
          />
          {pinError && <p className="text-red-500 text-xs mb-3">Incorrect PIN</p>}
          <button
            onClick={() => {
              if (pin === ADMIN_PIN) {
                sessionStorage.setItem('admin_unlocked', 'true')
                setUnlocked(true)
              } else {
                setPinError(true)
              }
            }}
            className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium"
          >
            Unlock
          </button>
        </div>
      </div>
    )
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
        
 {/* Date picker */}
        <div className="flex items-center gap-3 mb-6">
          <input type="date" className="border rounded-lg p-2.5 text-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          <p className="text-sm text-muted-foreground whitespace-nowrap">{bookings.length} appointment{bookings.length !== 1 ? 's' : ''}</p>
        </div>
{/* Add booking form */}
        {showAddForm && (
          <div className="mb-8 border border-border rounded-2xl p-6 bg-card">
            <h2 className="font-medium mb-4">New Manual Booking</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Customer Name *</label>
                <input type="text" className="w-full border rounded-lg p-2.5 text-sm" value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                <input type="tel" className="w-full border rounded-lg p-2.5 text-sm" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <input type="email" className="w-full border rounded-lg p-2.5 text-sm" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Stylist</label>
                <select className="w-full border rounded-lg p-2.5 text-sm" value={formStaff?.id || ''} onChange={e => { const s = staff.find(s => s.id === e.target.value) || null; setFormStaff(s); setFormSlot('') }}>
                  <option value="">No preference</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date *</label>
                <input type="date" className="w-full border rounded-lg p-2.5 text-sm" value={formDate} onChange={e => { setFormDate(e.target.value); setFormSlot('') }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Services *</label>
                <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2">
                  {services.map(s => {
                    const selected = !!formServices.find((fs: any) => fs.id === s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setFormServices((prev: any[]) => {
                            const exists = prev.find(fs => fs.id === s.id)
                            return exists ? prev.filter(fs => fs.id !== s.id) : [...prev, s]
                          })
                          setFormSlot('')
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded text-left text-sm transition-colors ${
                          selected ? 'bg-black text-white' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span>{s.name}</span>
                        <span className="opacity-75">{s.duration_minutes}min · ₹{s.price}</span>
                      </button>
                    )
                  })}
                </div>
                {formServices.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formServices.length} service{formServices.length > 1 ? 's' : ''} · {formTotalDuration} mins · ₹{formServices.reduce((sum: number, s: any) => sum + Number(s.price), 0)}
                  </p>
                )}
              </div>
            </div>

            {formServices.length > 0 && formDate && (
              <div className="mt-4">
                <label className="text-xs text-muted-foreground mb-2 block">Select Time *</label>
                {slotsLoading ? (
                  <p className="text-sm text-gray-400">Loading slots...</p>
                ) : formSlots.length === 0 ? (
                  <p className="text-sm text-gray-400">No slots available for this date</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {formSlots.map(slot => (
                      <button key={slot} onClick={() => setFormSlot(slot)}
                        className={`p-2 rounded-lg border text-sm ${formSlot === slot ? 'bg-black text-white border-black' : 'hover:border-black'}`}>
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
              <input type="text" placeholder="e.g. Called in, wants Priya specifically" className="w-full border rounded-lg p-2.5 text-sm" value={formNotes} onChange={e => setFormNotes(e.target.value)} />
            </div>

            {saveError && <p className="text-red-500 text-sm mt-3">{saveError}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={handleAddBooking} disabled={saving} className="bg-black text-white px-5 py-2 rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Booking'}
              </button>
              <button onClick={() => { setShowAddForm(false); resetForm() }} className="border px-5 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}
        {/* Who's in today */}
<div className="mb-8 border border-border rounded-2xl p-5 bg-card">
  <h2 className="font-medium mb-4 text-sm">
  Who's in on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
  {selectedDate === new Date().toISOString().split('T')[0] && (
    <span className="text-muted-foreground font-normal ml-2">(today)</span>
  )}
</h2>
  <div className="flex flex-col gap-3">
    {staffWithAvailability.map(s => (
      <div key={s.id}>
        <div className={`flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl border text-sm ${
          s.is_available ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'
        }`}>
          <span className={s.is_available ? 'text-green-800' : 'text-gray-400'}>{s.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {s.today_start?.slice(0,5)} – {s.today_end?.slice(0,5)}
            </span>
            <button
              onClick={() => {
                if (settingsOpen === s.id) {
                  setSettingsOpen(null)
                  setEditingDefault(false)
                } else {
                  setSettingsOpen(s.id)
                  setEditingDefault(false)
                  setTempStart(s.today_start?.slice(0,5) || '10:00')
                  setTempEnd(s.today_end?.slice(0,5) || '19:00')
                }
              }}
              className="text-muted-foreground hover:text-foreground text-base"
            >
              ⚙
            </button>
            <button
              onClick={() => handleToggleAvailability(s.id, s.is_available)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                s.is_available ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                s.is_available ? 'translate-x-4' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {settingsOpen === s.id && (
          <div className="mt-2 p-4 border border-border rounded-xl bg-background text-sm space-y-3">
            {!editingDefault ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Default hours</p>
                    <p className="text-muted-foreground text-xs">{s.default_start_time?.slice(0,5)} – {s.default_end_time?.slice(0,5)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingDefault(true)
                      setTempStart(s.default_start_time?.slice(0,5) || '10:00')
                      setTempEnd(s.default_end_time?.slice(0,5) || '19:00')
                    }}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:border-black"
                  >
                    Edit default
                  </button>
                </div>
                <div className="border-t pt-3">
                  <p className="font-medium mb-2">Change hours for today</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      className="border rounded-lg p-2 text-sm flex-1"
                      value={tempStart}
                      onChange={e => setTempStart(e.target.value)}
                    />
                    <span className="text-muted-foreground">to</span>
                    <input
                      type="time"
                      className="border rounded-lg p-2 text-sm flex-1"
                      value={tempEnd}
                      onChange={e => setTempEnd(e.target.value)}
                    />
                    <button
                      onClick={() => handleSaveDailyHours(s.id)}
                      className="bg-black text-white px-3 py-2 rounded-lg text-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="font-medium mb-2">Edit default hours for {s.name}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    className="border rounded-lg p-2 text-sm flex-1"
                    value={tempStart}
                    onChange={e => setTempStart(e.target.value)}
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="time"
                    className="border rounded-lg p-2 text-sm flex-1"
                    value={tempEnd}
                    onChange={e => setTempEnd(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleSaveDefaultHours(s.id)}
                    className="bg-black text-white px-4 py-2 rounded-lg text-xs"
                  >
                    Save default
                  </button>
                  <button
                    onClick={() => setEditingDefault(false)}
                    className="border px-4 py-2 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    ))}
  </div>
</div>

        {/* Breaks */}
        <div className="mb-8 border border-border rounded-2xl p-5 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-sm">Breaks</h2>
            <button
              onClick={() => setShowAddBreak(v => !v)}
              className="text-xs border px-3 py-1.5 rounded-lg hover:border-black"
            >
              + Add break
            </button>
          </div>

          {showAddBreak && (
            <div className="mb-4 p-3 border border-border rounded-xl bg-background">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Break name"
                  className="flex-1 border rounded-lg p-2 text-sm"
                  value={newBreakName}
                  onChange={e => setNewBreakName(e.target.value)}
                />
                <input
                  type="time"
                  className="border rounded-lg p-2 text-sm"
                  value={newBreakStart}
                  onChange={e => setNewBreakStart(e.target.value)}
                />
                <span className="text-muted-foreground text-sm">to</span>
                <input
                  type="time"
                  className="border rounded-lg p-2 text-sm"
                  value={newBreakEnd}
                  onChange={e => setNewBreakEnd(e.target.value)}
                />
                <button
                  onClick={handleAddBreak}
                  className="bg-black text-white px-3 py-2 rounded-lg text-xs"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {breaks.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 border border-border rounded-xl text-sm">
                {editingBreak?.id === b.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg p-2 text-sm"
                      value={editingBreak.name}
                      onChange={e => setEditingBreak({ ...editingBreak, name: e.target.value })}
                    />
                    <input
                      type="time"
                      className="border rounded-lg p-2 text-sm"
                      value={editingBreak.start_time}
                      onChange={e => setEditingBreak({ ...editingBreak, start_time: e.target.value })}
                    />
                    <span className="text-muted-foreground">to</span>
                    <input
                      type="time"
                      className="border rounded-lg p-2 text-sm"
                      value={editingBreak.end_time}
                      onChange={e => setEditingBreak({ ...editingBreak, end_time: e.target.value })}
                    />
                    <button onClick={handleUpdateBreak} className="bg-black text-white px-3 py-1.5 rounded-lg text-xs">Save</button>
                    <button onClick={() => setEditingBreak(null)} className="border px-3 py-1.5 rounded-lg text-xs">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingBreak({ ...b })}
                        className="text-xs border px-3 py-1.5 rounded-lg hover:border-black"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBreak(b.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        
           {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full border rounded-lg p-2.5 text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Bookings list */}
        
        {/* Bookings list */}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No appointments for this day</p>
            <button onClick={() => setShowAddForm(true)} className="mt-4 text-sm text-accent hover:underline">+ Add one manually</button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.filter(b => {
              if (!searchQuery) return true
              const q = searchQuery.toLowerCase()
              return b.customer_name?.toLowerCase().includes(q) || b.customer_phone?.includes(q)
            }).map(b => {
              const assignedStaff = staffWithAvailability.find(s => s.id === b.staff_id)
              const needsReassign = assignedStaff && b.status === 'confirmed' && (
  !assignedStaff.is_available ||
  (() => {
    const bookingTime = new Date(b.booking_datetime)
    const bookingEnd = new Date(bookingTime.getTime() + (b.services?.duration_minutes || 60) * 60000)
    const staffStart = new Date(`${selectedDate}T${assignedStaff.today_start}+05:30`)
    const staffEnd = new Date(`${selectedDate}T${assignedStaff.today_end}+05:30`)
    return bookingTime < staffStart || bookingEnd > staffEnd
  })()
)

              return (
                <div key={b.id} className={`p-4 rounded-xl border ${
                  b.status === 'cancelled' ? 'opacity-50 bg-muted' :
                  needsReassign ? 'border-orange-300 bg-orange-50' :
                  'bg-card border-border'
                }`}>
                  <div className="flex items-center justify-between">
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
                        {needsReassign && <p className="text-xs text-orange-600 mt-0.5 font-medium">⚠ Stylist not available - reassign</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {b.status}
                      </span>
                      {b.status === 'confirmed' && (
                        cancelConfirm === b.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-red-600 font-medium">Sure?</span>
                            <button onClick={() => handleCancel(b.id)} className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">Yes</button>
                            <button onClick={() => setCancelConfirm(null)} className="text-xs border px-2 py-0.5 rounded">No</button>
                          </div>
                        ) : (
                          <button onClick={() => handleCancel(b.id)} className="text-xs text-red-500 hover:underline">Cancel</button>
                        )
                      )}
                    </div>
                  </div>

                  {needsReassign && (
                    <div className="mt-3 pt-3 border-t border-orange-200 space-y-3">
                      {/* Reassign to different stylist */}
                      <div className="flex items-center gap-2">
                        <select
                          className="flex-1 border rounded-lg p-2 text-sm"
                          value={reassignStaffIds[b.id] || ''}
                          onChange={e => setReassignStaffIds(prev => ({ ...prev, [b.id]: e.target.value }))}
                        >
                          <option value="">Reassign to different stylist...</option>
                          {staffWithAvailability.filter(s => s.is_available && s.id !== b.staff_id).map(s => {
                            const slotStart = new Date(b.booking_datetime)
                            const slotEnd = new Date(slotStart.getTime() + (b.services?.duration_minutes || 60) * 60000)
                            const hasConflict = bookings.some(other => {
                              if (other.staff_id !== s.id || other.status !== 'confirmed' || other.id === b.id) return false
                              const otherStart = new Date(other.booking_datetime)
                              const otherDuration = other.services?.duration_minutes || 60
                              const otherEnd = new Date(otherStart.getTime() + otherDuration * 60000)
                              return slotStart < otherEnd && slotEnd > otherStart
                            })
                            return (
                              <option key={s.id} value={s.id} disabled={hasConflict}>
                                {s.name}{hasConflict ? ' — busy' : ''}
                              </option>
                            )
                          })}
                        </select>
                        <button
                          onClick={() => handleReassign(b.id)}
                          disabled={reassigning === b.id || !reassignStaffIds[b.id]}
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          {reassigning === b.id ? 'Reassigning...' : 'Reassign'}
                        </button>
                      </div>

                      {/* Reschedule with same stylist */}
                      <div className="border-t border-orange-100 pt-3">
                        <p className="text-xs text-orange-700 font-medium mb-2">Or reschedule with {b.staff?.name} at a new time</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="date"
                            className="border rounded-lg p-2 text-sm"
                            min={new Date().toISOString().split('T')[0]}
                            value={rescheduleDate[b.id] || ''}
                            onChange={async e => {
                              const date = e.target.value
                              setRescheduleDate(prev => ({ ...prev, [b.id]: date }))
                              setRescheduleSlot(prev => { const next = { ...prev }; delete next[b.id]; return next })
                              if (!date) return
                              setRescheduleLoading(true)
                              const [booked, enrichedStaff, breaks] = await Promise.all([
                                getBookedSlots(BUSINESS_ID, b.staff_id, date),
                                getStaffAvailability(BUSINESS_ID, date),
                                getBreaks(BUSINESS_ID)
                              ])
                              const slots = generateAvailableSlots(
                                booked,
                                b.services?.duration_minutes || 60,
                                date,
                                b.staff_id,
                                enrichedStaff.filter(s => s.id === b.staff_id),
                                breaks
                              )
                              setRescheduleSlots(slots)
                              setRescheduleLoading(false)
                            }}
                          />
                          {rescheduleLoading && <span className="text-xs text-gray-400">Loading slots...</span>}
                          {rescheduleDate[b.id] && !rescheduleLoading && rescheduleSlots.length === 0 && (
                            <span className="text-xs text-gray-400">No slots available</span>
                          )}
                          {rescheduleSlots.length > 0 && (
                            <select
                              className="border rounded-lg p-2 text-sm flex-1"
                              value={rescheduleSlot[b.id] || ''}
                              onChange={e => setRescheduleSlot(prev => ({ ...prev, [b.id]: e.target.value }))}
                            >
                              <option value="">Pick a time...</option>
                              {rescheduleSlots.map(slot => (
                                <option key={slot} value={slot}>
                                  {new Date(slot).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                                </option>
                              ))}
                            </select>
                          )}
                          {rescheduleSlot[b.id] && (
                            <button
                              onClick={() => handleReschedule(b.id)}
                              disabled={rescheduling === b.id}
                              className="bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                            >
                              {rescheduling === b.id ? 'Saving...' : 'Confirm Reschedule'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}