# Luxe Studio — Salon Website Template

A production-ready, fully customizable salon website template with a custom booking system, Google Calendar sync, and an admin dashboard.

---

## What it does

- **Customer-facing site** — hero, about, services menu, gallery, booking widget, contact + Google Maps embed, WhatsApp floating button
- **Booking system** — multi-service selection, optional stylist preference, real-time slot availability, auto-assignment
- **Google Calendar sync** — every booking appears on the assigned stylist's Google Calendar automatically
- **Admin dashboard** — view all bookings by day, add manual bookings (phone/walk-in), manage staff availability and hours, manage breaks, reassign bookings

---

## Tech stack

- **Frontend:** TanStack Start + React + Tailwind v4
- **Database:** Supabase (multi-tenant schema with RLS)
- **Edge Functions:** Supabase Edge Functions (Deno)
- **Calendar:** Google Calendar API (OAuth 2.0)
- **Email:** Resend (configured, pending domain verification)
- **Deployment:** Netlify
- **Domains:** GoDaddy

---

## Key features

### Booking widget
- Multi-service selection — customer picks multiple services, durations add up automatically
- Optional stylist preference — if no preference, system auto-assigns the stylist with fewest bookings that day
- Real-time slot availability — slots blocked by existing bookings, breaks, and stylist hours
- IST timezone handling throughout
- Past slots and slots within 1 hour hidden from customers
- Booking confirms and syncs to stylist's Google Calendar instantly

### Admin dashboard (`/admin`)
- Daily bookings view with date picker
- Add manual bookings (phone/walk-in) with same slot availability check
- **Who's in today** — toggle each stylist on/off per day
- **Custom hours** — set default hours per stylist, override for specific days via ⚙ gear icon
- **Breaks** — default lunch break (1pm–2pm), add/edit/delete any break, all breaks apply to all stylists
- **Reassign** — if a stylist is marked unavailable or a booking falls outside their hours, it flags orange and lets you reassign to a free stylist (busy stylists shown as greyed out)
- Cancel bookings

### Setup page (`/setup`)
- Hidden admin page for connecting stylist Google Calendars
- Each stylist connects their own Google account via OAuth
- One-time setup per stylist — refresh token stored in DB, used for all future bookings

---

## Database schema

```
businesses       — one row per client salon
staff            — stylists, with default_start_time / default_end_time
services         — service catalog with duration_minutes and price
bookings         — all appointments (confirmed / cancelled)
booking_services — junction table for multi-service bookings
staff_availability — per-day availability overrides (is_available, start_time, end_time)
breaks           — recurring daily breaks (lunch etc.)
```

---

## Environment variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_BUSINESS_ID=
GOOGLE_CLIENT_SECRET=       # Supabase secret only
RESEND_API_KEY=              # Supabase secret only
```

---

## Onboarding a new client

1. Clone the repo
2. Update `src/routes/index.tsx` config object — brand name, tagline, services, contact info, Maps embed URL
3. Insert a new row in `businesses` table, update `VITE_BUSINESS_ID`
4. Insert staff rows for each stylist
5. Insert services rows
6. Set environment variables on Netlify
7. Add client's Netlify URL to Google Cloud Console authorized redirect URIs
8. Deploy
9. Visit `/setup` with the client — connect each stylist's Google Calendar
10. Done

---

## Todo

### Before going live with first client
- [ ] Get Google OAuth app verified (currently in Testing mode — only approved test users can connect calendars)
- [ ] Add a verified domain to Resend so confirmation emails work for all customers
- [ ] Input validation — email format check, phone number format check

### Deferred features (post first client)
- [ ] Confirmation + reminder emails to customers (needs verified domain)
- [ ] Google Maps reviews section (Google Places API no longer has a free tier — price on request)
- [ ] Recurring client history / notes
- [ ] Deposit / payment collection at booking
- [ ] No-show tracking and flagging
- [ ] Waiting list for fully booked days
- [ ] WhatsApp booking bot (significant build, premium tier product)

---

## Auto-assign logic

When a customer selects "No preference", the system:
1. Finds all stylists who are marked as available that day
2. Filters to stylists who are free for the requested time slot
3. Picks the one with the fewest bookings that day (load balancing)

---

## Known limitations

- Google OAuth app is in Testing mode — real clients need to be added as test users until the app is verified by Google
- Confirmation emails require a verified sending domain on Resend
- No SMS/WhatsApp reminders yet