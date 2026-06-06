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

  const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID

  useEffect(() => {
    // Load staff
    supabase
      .from('staff')
      .select('*')
      .eq('business_id', BUSINESS_ID)
      .then(({ data }) => setStaff(data || []))

    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const staffId = params.get('state')

    if (code && staffId) {
      handleOAuthCallback(code, staffId)
    }
  }, [])

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
      // Reload staff to show updated status
      const { data } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', BUSINESS_ID)
      setStaff(data || [])

      // Clean up URL
      window.history.replaceState({}, '', '/setup')
    } catch (err) {
      setStatus('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Calendar Setup</h1>
        <p className="text-muted-foreground mb-8">Connect each stylist's Google Calendar so bookings appear automatically.</p>

        {status && (
          <div className={`mb-6 p-4 rounded-lg ${status.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {status}
          </div>
        )}

        <div className="space-y-4">
          {staff.map(s => (
            <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.google_refresh_token ? '✓ Calendar connected' : 'Not connected'}
                </p>
              </div>
              {!s.google_refresh_token && (
                
                 <a href={getGoogleAuthUrl(s.id)}
                  className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                  Connect Google
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}