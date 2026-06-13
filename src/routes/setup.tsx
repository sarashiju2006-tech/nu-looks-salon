import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const Route = createFileRoute('/setup')({
  component: Setup,
})

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN

function Setup() {
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem('admin_unlocked') === 'true')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [staff, setStaff] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID

  useEffect(() => { loadStaff() }, [])

  async function loadStaff() {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', BUSINESS_ID)
      .order('created_at')
    setStaff(data || [])
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
    if (deleteConfirm !== staffId) {
      setDeleteConfirm(staffId)
      setTimeout(() => setDeleteConfirm(prev => prev === staffId ? null : prev), 4000)
      return
    }
    setDeleteConfirm(null)
    const { error } = await supabase.from('staff').delete().eq('id', staffId)
    if (error) {
      console.error('Delete error:', error)
      return
    }
    loadStaff()
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Stylist Setup</h1>
        <p className="text-muted-foreground mb-8">Manage stylists. Their email is used for calendar invites on each booking.</p>
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
                placeholder="Email (for calendar invites)"
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

        <div className="space-y-4 mb-6">
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
                    placeholder="Email (for calendar invites)"
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
                    <p className="text-sm text-muted-foreground">{s.email || 'No email set'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingStaff({ ...s })}
                      className="text-xs border px-3 py-1.5 rounded-lg hover:border-black"
                    >
                      Edit
                    </button>
                    {deleteConfirm === s.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-600 font-medium">Sure?</span>
                        <button onClick={() => handleDeleteStaff(s.id)} className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">Yes</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-xs border px-2 py-0.5 rounded">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteStaff(s.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="bg-black text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-800"
          >
            + Add Stylist
          </button>
        </div>
      </div>
    </div>
  )
}