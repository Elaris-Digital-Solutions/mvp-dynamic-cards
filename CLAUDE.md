# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

No test suite is configured.

## Architecture

**Identidad Digital** is a Next.js 16 SaaS platform for digital business cards. Users get a public profile page at `/[username]` that functions as a Linktree-style card, optionally linked to a physical NFC card.

### Route Groups

```
app/
  (public)/          # Unauthenticated: landing, login, register, /[username], /nfc/[card_uid], admin-login
  (dashboard)/       # Authenticated users: dashboard, profile editor, buttons
  (admin)/           # Admin-only: user/NFC management
  api/track-click/   # POST — records analytics events
```

### Key Data Flows

**Auth:** Middleware refreshes Supabase sessions on every non-static request. `lib/auth/` exports `requireAuth()`, `requireAdmin()`, and `requireActiveUser()` — call these at the top of Server Actions and page components to gate access.

**Mutations:** Done via Next.js Server Actions in `lib/actions/` (profile.ts, buttons.ts, admin.ts). Actions validate with Zod (`lib/validation/schemas.ts`), write to Supabase, then call `revalidatePath()`.

**Public card:** `/[username]` fetches the profile and its action buttons. Every page view fires a non-blocking POST to `/api/track-click`. Button clicks also POST there before navigating.

**NFC:** `/nfc/[card_uid]` looks up the `nfc_cards` table (UID stored normalized: uppercase, no colons) and redirects to the linked profile.

**Analytics:** `click_events` table tracks page views, button clicks, vCard downloads, and WhatsApp clicks. IP addresses are hashed for privacy. Rate limiting uses Upstash Redis in production (env vars optional; falls back to in-memory).

### Supabase Clients

- `lib/supabase/client.ts` — browser client (anon key)
- `lib/supabase/server.ts` — server client (anon key + cookie store, respects RLS)
- Admin actions bypass RLS using `SUPABASE_SERVICE_ROLE_KEY` — only accessible after `requireAdmin()`.

### Database Tables

| Table | Purpose |
|---|---|
| `profiles` | Extends Supabase Auth users; holds username, bio, social links, role, active status |
| `action_buttons` | Ordered list of CTA buttons per profile |
| `click_events` | Analytics: event_type, ip_hash, platform, button_label, metadata (JSONB) |
| `nfc_cards` | Maps NFC card UIDs to profiles |

### Component Conventions

- Server Components are the default; client components are named `*Client.tsx`.
- UI primitives live in `components/ui/` (shadcn/ui with Zinc base color).
- The public card is rendered by `components/card/linktree-card.tsx`.
- Zod schemas in `lib/validation/schemas.ts` sanitize all user input (HTML entity escaping, URL normalization).

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # Server-only; required for admin actions
UPSTASH_REDIS_REST_URL           # Optional; production rate limiting
UPSTASH_REDIS_REST_TOKEN         # Optional
```

### Security Headers

Configured in `next.config.ts`: strict CSP (Cloudinary allowed for images), HSTS, `X-Frame-Options: SAMEORIGIN`, Permissions-Policy. Do not weaken these without consideration.
