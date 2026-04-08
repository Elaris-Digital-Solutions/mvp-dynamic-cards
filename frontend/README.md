# Frontend — Pure UI Shell

This folder contains the extracted, backend-agnostic frontend for the Elaris NFC SaaS.

## What this is

A clean Next.js App Router application that is:
- **Visually identical** to the original frontend
- **Zero backend dependencies** — no Supabase, no server actions, no API routes
- **Prop-driven** — all components receive data from their parents
- **Ready to integrate** — clear `// Integration point:` comments mark every place where a real backend plugs in

## Structure

```
frontend/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (no AuthProvider)
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Design tokens + Tailwind v4
│   ├── (auth)/
│   │   ├── login/page.tsx      # Login shell
│   │   └── signup/page.tsx     # Signup shell
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Passthrough layout
│   │   ├── page.tsx            # Dashboard (useState only)
│   │   └── card/page.tsx       # Card preview with mock data
│   └── [username]/page.tsx     # Public profile with mock data
├── components/
│   ├── auth/                   # LoginForm, SignupForm (props-driven)
│   ├── shared/                 # Header, Sidebar (props-driven), NFCBadge
│   ├── card/                   # LinktreeCard (required profile prop)
│   ├── dashboard/              # TemplateCard, TemplateGrid (props-driven)
│   └── ui/                     # shadcn/ui primitives (untouched)
├── features/
│   └── dashboard/
│       ├── dashboard-status.ts
│       └── sections/           # 4 dashboard sections (all props-driven)
├── lib/
│   ├── constants.ts            # TEMPLATES, SOCIAL_ICONS
│   ├── fonts.ts                # Montserrat, Inter
│   ├── mock-data.ts            # MOCK_USER, MOCK_PUBLIC_PROFILE
│   └── utils.ts                # cn()
└── types/
    └── ui.types.ts             # Frontend-only TypeScript types
```

## What was removed

| Removed | Why |
|---|---|
| `lib/supabase/` | Supabase client — backend |
| `lib/repositories/` | Database query layer — backend |
| `lib/services/` | Business logic with auth guards — backend |
| `lib/mappers/` | DB row → frontend shape transforms — backend |
| `lib/validation/` | Zod server schemas — backend |
| `lib/api/` | `requireAuth`, `AppError` — server-only |
| `lib/security/` | Rate limiting, write guards — server-only |
| `lib/auth-context.tsx` | Full Supabase auth context — replaced by props |
| `app/actions/` | Next.js Server Actions — backend operations |
| `app/api/` | Cloudinary upload route — backend |
| `types/database.ts` | Supabase-generated DB types — backend |
| `supabase/` | Migrations, SQL — not UI |
| `features/dashboard/use-dashboard-controller.ts` | Complex controller calling server actions — replaced by simple `useState` in page |

## Integration guide

### 1. Auth (Login / Signup)

```tsx
// app/(auth)/login/page.tsx
import { useAuth } from '@/lib/auth-context' // your real auth context

const { login, isLoading } = useAuth()
<LoginForm onLogin={login} isLoading={isLoading} />
```

### 2. Dashboard user data

```tsx
// app/(dashboard)/page.tsx
// Replace the static import:
// const user = MOCK_USER
// With:
const user = await getAuthenticatedUser() // your SSR session helper
```

### 3. Profile save

```tsx
// In the handleProfileSave handler — replace the setTimeout with:
await fetch('/api/profile', { method: 'PATCH', body: JSON.stringify(profileForm) })
```

### 4. Image upload

```tsx
// Pass a real upload handler to handleImageUpload:
const cloudinaryUpload = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/uploads/image', { method: 'POST', body: formData })
  return (await res.json()).data.url
}

// In onImageUpload calls:
onImageUpload('profileImage', file, cloudinaryUpload)
```

### 5. Sidebar logout

```tsx
// Pass real logout to Sidebar in dashboard/page.tsx:
const { logout } = useAuth()
<Sidebar onLogout={() => { await logout(); router.replace('/') }} />
```

### 6. Public profile page

```tsx
// app/[username]/page.tsx — replace mock:
const { username } = await params
const profile = await profileService.getProfileByUsername(username)
if (!profile) notFound()
```

## Running locally

This folder shares the parent project's `node_modules`. To run it standalone:

```bash
cd frontend
npm install   # or copy ../package.json here and install
npm run dev
```
