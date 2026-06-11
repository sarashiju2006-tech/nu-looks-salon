import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const REDIRECT_URI = `${window.location.origin}/setup`

function getGoogleAuthUrl(staffId: string) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
    state: staffId,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export const Route = createFileRoute('/setup')({
  component: Setup,
})

function Setup() {
  const [staff, setStaff] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID

  useEffect(() => {
    loadStaff()

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const staffId = params.get('state')
    if (code && staffId) handleOAuthCallback(code, staffId)
  }, [])

  async function loadStaff() {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', BUSINESS_ID)
      .order('created_at')
    setStaff(data || [])
  }

  async function handleOAuthCallback(code: string, staffId: string) {
    setLoading(true)
    setStatus('Connecting Google Calendar...')
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ code, staffId, redirectUri: REDIRECT_URI })
      })
      if (!response.ok) throw new Error('Failed to exchange token')
      setStatus('✓ Google Calendar connected successfully!')
      loadStaff()
      window.history.replaceState({}, '', '/setup')
    } catch (err) {
      setStatus('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddStaff() {
    if (!newName.trim()) return
    setSaving(true)
    await supabase.from('staff').insert({
      business_id: BUSINESS_ID,
      name: newName.trim(),
      email: newEmail.trim() || null,
    })
    setNewName('')
    setNewEmail('')
    setShowAddForm(false)
    setSaving(false)
    loadStaff()
  }

  async function handleUpdateStaff() {
    if (!editingStaff || !editingStaff.name.trim()) return
    setSaving(true)
    await supabase.from('staff')
      .update({ name: editingStaff.name.trim(), email: editingStaff.email || null })
      .eq('id', editingStaff.id)
    setEditingStaff(null)
    setSaving(false)
    loadStaff()
  }

  async function handleDeleteStaff(staffId: string) {
    if (!confirm('Delete this stylist? Their bookings will remain but they will be unassigned.')) return
    await supabase.from('staff').delete().eq('id', staffId)
    loadStaff()
  }

  async function handleDisconnectCalendar(staffId: string) {
    if (!confirm('Disconnect this stylist\'s Google Calendar?')) return
    await supabase.from('staff').update({ google_refresh_token: null }).eq('id', staffId)
    loadStaff()
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Calendar Setup</h1>
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            + Add Stylist
          </button>
        </div>
        <p className="text-muted-foreground mb-8">Manage stylists and connect their Google Calendars.</p>

        {status && (
          <div className={`mb-6 p-4 rounded-lg ${status.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {status}
          </div>
        )}

        {/* Add stylist form */}
        {showAddForm && (
          <div className="mb-6 p-4 border border-border rounded-xl bg-card">
            <h2 className="font-medium mb-3 text-sm">New Stylist</h2>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Name *"
                className="w-full border rounded-lg p-2.5 text-sm"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email (optional)"
                className="w-full border rounded-lg p-2.5 text-sm"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAddStaff}
                disabled={saving || !newName.trim()}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewName(''); setNewEmail('') }}
                className="border px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {staff.map(s => (
            <div key={s.id} className="border rounded-xl overflow-hidden">
              {editingStaff?.id === s.id ? (
                <div className="p-4 space-y-2">
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 text-sm"
                    value={editingStaff.name}
                    onChange={e => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    className="w-full border rounded-lg p-2.5 text-sm"
                    value={editingStaff.email || ''}
                    onChange={e => setEditingStaff({ ...editingStaff, email: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdateStaff} disabled={saving} className="bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingStaff(null)} className="border px-4 py-2 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.google_refresh_token ? '✓ Calendar connected' : 'Not connected'}
                    </p>
                    {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {s.google_refresh_token ? (
                      <button
                        onClick={() => handleDisconnectCalendar(s.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Disconnect
                      </button>
                    ) : (
                      
                        <a href={getGoogleAuthUrl(s.id)}
                        className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800"
                      >
                        Connect Google
                      </a>
                    )}
                    <button
                      onClick={() => setEditingStaff({ ...s })}
                      className="text-xs border px-3 py-1.5 rounded-lg hover:border-black"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(s.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}