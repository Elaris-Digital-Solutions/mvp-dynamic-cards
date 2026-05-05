# Auto-botón WhatsApp + Drag & Drop — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un botón de WhatsApp auto-gestionado en action_buttons (sincronizado desde el campo whatsapp del perfil) y drag & drop para reordenar todos los botones desde la pestaña "Mis Botones".

**Architecture:** Una columna `is_managed` en `action_buttons` identifica el botón de WhatsApp auto-creado. `updateProfile` sincroniza el botón al guardar. `@dnd-kit/sortable` maneja el reordenamiento en el cliente, con una nueva server action `saveButtonOrder` que persiste el orden.

**Tech Stack:** Next.js 16 Server Actions, Supabase, @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities, TypeScript.

---

## Mapa de archivos

| Acción | Archivo | Cambio |
|---|---|---|
| DB migration | Supabase MCP | Agregar `is_managed boolean NOT NULL DEFAULT false` a `action_buttons` |
| Modificar | `types/ui.types.ts` | Agregar `isManaged?: boolean` a `EditableLink` |
| Modificar | `lib/utils/adapters.ts` | Mapear `is_managed` → `isManaged` en `UILinkItem` y `dbButtonToLinkItem` |
| Modificar | `lib/actions/buttons.ts` | Nueva action exportada `saveButtonOrder` |
| Modificar | `lib/actions/profile.ts` | Sync del botón WhatsApp tras guardar perfil |
| Modificar | `components/dashboard/DashboardClient.tsx` | Handler `handleReorderLinks`, import `saveButtonOrder`, nueva prop |
| Modificar | `features/dashboard/sections/dashboard-botones-section.tsx` | DnD, managed badge, quitar whatsapp del modal |

---

## Task 1: DB Migration — columna is_managed

**Files:**
- DB migration via Supabase MCP

- [ ] **Step 1: Aplicar migración**

Ejecutar via Supabase MCP (`project_id: ralerpzljxcxivrdqlxj`):

```sql
ALTER TABLE action_buttons
  ADD COLUMN IF NOT EXISTS is_managed boolean NOT NULL DEFAULT false;
```

- [ ] **Step 2: Verificar columna**

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'action_buttons' AND column_name = 'is_managed';
```

Expected: una fila con `is_managed | boolean | false`.

---

## Task 2: Actualizar tipos y adapter

**Files:**
- Modify: `types/ui.types.ts`
- Modify: `lib/utils/adapters.ts`

- [ ] **Step 1: Agregar `isManaged` a `EditableLink` en types/ui.types.ts**

```typescript
export type EditableLink = {
  id: string
  title: string
  url: string
  icon: LinkIcon
  isManaged?: boolean
}
```

- [ ] **Step 2: Agregar `isManaged` a `UILinkItem` en lib/utils/adapters.ts**

```typescript
export type UILinkItem = {
  id: string
  title: string
  url: string
  icon: string
  isManaged?: boolean
}
```

- [ ] **Step 3: Actualizar `dbButtonToLinkItem` en lib/utils/adapters.ts**

Reemplazar la función completa:

```typescript
export function dbButtonToLinkItem(
  button: Pick<DBButton, 'id' | 'label' | 'url' | 'icon'> & { is_managed?: boolean }
): UILinkItem {
  return {
    id: button.id,
    title: button.label,
    url: button.url,
    icon: button.icon,
    isManaged: button.is_managed ?? false,
  }
}
```

- [ ] **Step 4: Actualizar la firma de `dbProfileToUIProfile` en lib/utils/adapters.ts**

Cambiar la firma del parámetro `buttons` para incluir `is_managed`:

```typescript
export function dbProfileToUIProfile(
  profile: DBProfile,
  buttons: (Pick<DBButton, 'id' | 'label' | 'url' | 'icon'> & { is_managed?: boolean })[] = []
): UIUserProfile {
```

El cuerpo no cambia — el spread ya incluye `isManaged` desde el paso anterior.

- [ ] **Step 5: Actualizar el SELECT de action_buttons en el dashboard page**

En `app/(dashboard)/dashboard/page.tsx`, buscar el SELECT de `action_buttons` y agregar `is_managed`:

```typescript
// Buscar la query de action_buttons y cambiar el select a:
.select('id, label, url, icon, sort_order, is_managed')
```

- [ ] **Step 6: Actualizar el SELECT en la página pública**

En `app/(public)/[username]/page.tsx`, buscar el SELECT de `action_buttons` y agregar `is_managed`:

```typescript
.select('id, label, url, icon, sort_order, is_managed')
```

- [ ] **Step 7: Verificar tipos**

```bash
cd C:\Users\Alejandro\Desktop\Elaris\mvp-dynamic-cards && npx tsc --noEmit 2>&1 | grep -v ".next" | grep -v "node_modules" | grep -v "cmdk" | head -20
```

Expected: sin errores en los archivos modificados.

---

## Task 3: Nueva server action `saveButtonOrder`

**Files:**
- Modify: `lib/actions/buttons.ts`

- [ ] **Step 1: Agregar la función exportada al final del archivo**

Agregar después de `deleteButton`:

```typescript
export async function saveButtonOrder(
  orderedIds: string[]
): Promise<{ success: true } | { error: string }> {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  if (orderedIds.length === 0) return { success: true }

  // Verify all IDs belong to this user
  const { data: existing } = await (supabase as any)
    .from('action_buttons')
    .select('id')
    .eq('profile_id', user.id)
    .in('id', orderedIds)

  if (!existing || existing.length !== orderedIds.length) {
    return { error: 'Uno o más botones no pertenecen a tu perfil.' }
  }

  await Promise.all(
    orderedIds.map((id, index) =>
      (supabase as any)
        .from('action_buttons')
        .update({ sort_order: index })
        .match({ id, profile_id: user.id })
    )
  )

  revalidatePath('/dashboard')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | grep "buttons.ts"
```

Expected: sin errores.

---

## Task 4: Sync del botón WhatsApp en updateProfile

**Files:**
- Modify: `lib/actions/profile.ts`

- [ ] **Step 1: Agregar la lógica de sync después de la limpieza de imágenes**

En `lib/actions/profile.ts`, reemplazar el bloque final de `updateProfile` (desde `revalidatePath('/dashboard')` hasta el `return { success: true }`):

```typescript
  await Promise.all([
    current?.avatar_url && current.avatar_url !== avatar_url
      ? deleteCloudinaryImage(current.avatar_url)
      : Promise.resolve(),
    current?.banner_url && current.banner_url !== banner_url
      ? deleteCloudinaryImage(current.banner_url)
      : Promise.resolve(),
  ])

  // Sync managed WhatsApp button
  await syncWhatsAppButton(supabase, user.id, whatsapp ?? null)

  revalidatePath('/dashboard')
  revalidatePath(`/${profile.username}`)
  return { success: true }
```

- [ ] **Step 2: Agregar la función `syncWhatsAppButton` antes de `updateProfile`**

```typescript
async function syncWhatsAppButton(
  supabase: any,
  profileId: string,
  whatsapp: string | null | undefined
): Promise<void> {
  const { data: existing } = await supabase
    .from('action_buttons')
    .select('id')
    .match({ profile_id: profileId, icon: 'whatsapp', is_managed: true })
    .maybeSingle()

  if (whatsapp) {
    const normalizedNumber = whatsapp.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${normalizedNumber}`

    if (existing) {
      await supabase
        .from('action_buttons')
        .update({ url: whatsappUrl, label: 'WhatsApp' })
        .match({ id: existing.id, profile_id: profileId })
    } else {
      const { data: maxBtn } = await supabase
        .from('action_buttons')
        .select('sort_order')
        .eq('profile_id', profileId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { count } = await supabase
        .from('action_buttons')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId)

      if (count !== null && count >= 6) return

      await supabase.from('action_buttons').insert({
        id: crypto.randomUUID(),
        profile_id: profileId,
        label: 'WhatsApp',
        url: whatsappUrl,
        icon: 'whatsapp',
        is_managed: true,
        sort_order: maxBtn ? maxBtn.sort_order + 1 : 0,
        is_active: true,
      })
    }
  } else if (existing) {
    await supabase
      .from('action_buttons')
      .delete()
      .match({ id: existing.id, profile_id: profileId })
  }
}
```

- [ ] **Step 3: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | grep "profile.ts"
```

Expected: sin errores.

---

## Task 5: Actualizar DashboardClient

**Files:**
- Modify: `components/dashboard/DashboardClient.tsx`

- [ ] **Step 1: Agregar `saveButtonOrder` al import de actions**

Cambiar la línea de imports de buttons:

```typescript
import { createButton, updateButton, deleteButton, saveButtonOrder } from '@/lib/actions/buttons'
```

- [ ] **Step 2: Agregar el handler `handleReorderLinks` después de `saveLinks`**

```typescript
  const handleReorderLinks = async (orderedIds: string[]) => {
    setLinks(prev => {
      const map = new Map(prev.map(l => [l.id, l]))
      return orderedIds.map(id => map.get(id)).filter(Boolean) as EditableLink[]
    })
    const res = await saveButtonOrder(orderedIds)
    if (res && 'error' in res) {
      setLinksStatus({ state: 'error', message: res.error as string })
    }
  }
```

- [ ] **Step 3: Pasar `onReorderLinks` a DashboardBotonesSection**

Buscar el bloque `{activeSection === 'botones' && (` y agregar la prop:

```tsx
{activeSection === 'botones' && (
  <DashboardBotonesSection
    links={links}
    linksStatus={linksStatus}
    onRemoveLink={removeLink}
    onUpdateLink={updateLink}
    onAddLink={addLink}
    onSaveLinks={saveLinks}
    onReorderLinks={handleReorderLinks}
  />
)}
```

- [ ] **Step 4: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | grep "DashboardClient"
```

Expected: sin errores (puede haber error temporal sobre prop faltante en BotonesSection hasta Task 6).

---

## Task 6: Botones section con Drag & Drop

**Files:**
- Modify: `features/dashboard/sections/dashboard-botones-section.tsx`

- [ ] **Step 1: Instalar @dnd-kit**

```bash
cd C:\Users\Alejandro\Desktop\Elaris\mvp-dynamic-cards && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Reemplazar el archivo completo**

```typescript
'use client'

import { useState } from 'react'
import type { ComponentType } from 'react'
import { Save, Globe, ExternalLink, MessageCircle, GripVertical, Lock } from 'lucide-react'
import { IconBrandInstagram, IconBrandLinkedin } from '@tabler/icons-react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { buildDashboardStatusClass } from '@/features/dashboard/dashboard-status'
import type { EditableLink, LinkIcon, SaveStatus } from '@/types/ui.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardBotonesSectionProps = {
  links: EditableLink[]
  linksStatus: SaveStatus
  onRemoveLink: (id: string) => void
  onUpdateLink: (id: string, field: 'title' | 'url' | 'icon', value: string) => void
  onAddLink: (data: { icon: LinkIcon; title: string; url: string }) => void
  onSaveLinks: () => Promise<void>
  onReorderLinks: (orderedIds: string[]) => Promise<void>
}

// ─── Link type config ─────────────────────────────────────────────────────────

type LinkTypeConfig = {
  label: string
  Icon: ComponentType<{ className?: string }>
  urlPrefix: string
  displayPrefix: string
  placeholder: string
  labelFixed: boolean
}

const LINK_TYPE_CONFIG: Record<string, LinkTypeConfig> = {
  instagram: {
    label: 'Instagram',
    Icon: IconBrandInstagram,
    urlPrefix: 'https://instagram.com/',
    displayPrefix: 'instagram.com/',
    placeholder: 'tuusuario',
    labelFixed: true,
  },
  linkedin: {
    label: 'LinkedIn',
    Icon: IconBrandLinkedin,
    urlPrefix: 'https://linkedin.com/in/',
    displayPrefix: 'linkedin.com/in/',
    placeholder: 'tu-nombre',
    labelFixed: true,
  },
  whatsapp: {
    label: 'WhatsApp',
    Icon: MessageCircle,
    urlPrefix: 'https://wa.me/',
    displayPrefix: 'wa.me/',
    placeholder: '521234567890',
    labelFixed: true,
  },
  website: {
    label: 'Sitio Web',
    Icon: Globe,
    urlPrefix: 'https://',
    displayPrefix: 'https://',
    placeholder: 'tudominio.com',
    labelFixed: true,
  },
  link: {
    label: '',
    Icon: ExternalLink,
    urlPrefix: 'https://',
    displayPrefix: 'https://',
    placeholder: 'tudominio.com/ruta',
    labelFixed: false,
  },
}

// WhatsApp excluido — se gestiona desde Mi Perfil
const TYPE_ORDER: LinkIcon[] = ['instagram', 'linkedin', 'website', 'link']

// ─── Sortable Button Row ──────────────────────────────────────────────────────

function SortableButtonRow({
  link,
  linksStatus,
  onRemoveLink,
  onUpdateLink,
}: {
  link: EditableLink
  linksStatus: SaveStatus
  onRemoveLink: (id: string) => void
  onUpdateLink: (id: string, field: 'title' | 'url' | 'icon', value: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = LINK_TYPE_CONFIG[link.icon] ?? LINK_TYPE_CONFIG.link
  const { Icon } = config
  const isCustom = link.icon === 'link'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-border/60 p-4 space-y-3 bg-background ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <Icon className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm tracking-[0.15em] uppercase font-semibold">
            {config.label || link.title || 'Otro'}
          </p>
          {link.isManaged && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              Mi Perfil
            </span>
          )}
        </div>
        {!link.isManaged && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemoveLink(link.id)}
            disabled={linksStatus.state === 'saving'}
          >
            Eliminar
          </Button>
        )}
      </div>

      {!link.isManaged && (
        <div className="space-y-3">
          {isCustom && (
            <div className="space-y-2">
              <Label>Etiqueta</Label>
              <Input
                value={link.title}
                onChange={(e) => onUpdateLink(link.id, 'title', e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>URL de destino</Label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground text-sm font-medium">
                https://
              </span>
              <Input
                value={link.url.replace(/^https?:\/\//i, '')}
                onChange={(e) => {
                  const val = e.target.value.replace(/^https?:\/\//i, '').replace(/\s+/g, '')
                  onUpdateLink(link.id, 'url', val ? `https://${val}` : '')
                }}
                placeholder="tudominio.com/ruta"
                className="rounded-l-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add Link Modal ───────────────────────────────────────────────────────────

function AddLinkModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (data: { icon: LinkIcon; title: string; url: string }) => void
}) {
  const [step, setStep] = useState<'pick' | 'url'>('pick')
  const [selectedType, setSelectedType] = useState<LinkIcon | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [customLabel, setCustomLabel] = useState('')

  const resetAndClose = () => {
    setStep('pick')
    setSelectedType(null)
    setUrlInput('')
    setCustomLabel('')
    onClose()
  }

  const handleTypeSelect = (type: LinkIcon) => {
    setSelectedType(type)
    setUrlInput('')
    setCustomLabel('')
    setStep('url')
  }

  const handleBack = () => {
    setStep('pick')
    setSelectedType(null)
    setUrlInput('')
  }

  const handleConfirm = () => {
    if (!selectedType) return
    const config = LINK_TYPE_CONFIG[selectedType]
    const title = config.labelFixed ? config.label : customLabel.trim()
    if (!title || !urlInput.trim()) return
    onConfirm({ icon: selectedType, title, url: config.urlPrefix + urlInput.trim() })
    resetAndClose()
  }

  const config = selectedType ? LINK_TYPE_CONFIG[selectedType] : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'pick' ? 'Selecciona el tipo de enlace' : 'Configura el enlace'}
          </DialogTitle>
        </DialogHeader>

        {step === 'pick' && (
          <div className="grid grid-cols-3 gap-3 pt-1">
            {TYPE_ORDER.map((type) => {
              const { label, Icon } = LINK_TYPE_CONFIG[type]
              return (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className="flex flex-col items-center gap-2.5 rounded-xl border border-border/60 p-4 hover:bg-muted/60 hover:border-primary/40 transition-colors"
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{label || 'Otro'}</span>
                </button>
              )
            })}
          </div>
        )}

        {step === 'url' && config && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/50">
              <config.Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">{config.label || 'Otro enlace'}</span>
            </div>

            {!config.labelFixed && (
              <div className="space-y-2">
                <Label>Etiqueta</Label>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="ej. Mi portafolio"
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>URL de destino</Label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground text-xs font-medium whitespace-nowrap">
                  {config.displayPrefix}
                </span>
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value.replace(/\s+/g, ''))}
                  placeholder={config.placeholder}
                  className="rounded-l-none"
                  autoFocus={config.labelFixed}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                Atrás
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={!urlInput.trim() || (!config.labelFixed && !customLabel.trim())}
              >
                Añadir enlace
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardBotonesSection({
  links,
  linksStatus,
  onRemoveLink,
  onUpdateLink,
  onAddLink,
  onSaveLinks,
  onReorderLinks,
}: DashboardBotonesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex(l => l.id === active.id)
      const newIndex = links.findIndex(l => l.id === over.id)
      const reordered = arrayMove(links, oldIndex, newIndex)
      void onReorderLinks(reordered.map(l => l.id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 p-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Mis botones</h1>
          <p className="mt-1.5 text-muted-foreground text-lg">
            Gestiona los botones que se muestran en tu perfil publico.
          </p>
        </div>
        <span className="text-sm border border-border rounded-md px-3 py-1 font-semibold">
          {links.length} / 6
        </span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {links.map((link) => (
              <SortableButtonRow
                key={link.id}
                link={link}
                linksStatus={linksStatus}
                onRemoveLink={onRemoveLink}
                onUpdateLink={onUpdateLink}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {linksStatus.state !== 'idle' && (
        <p className={`text-sm font-medium ${buildDashboardStatusClass(linksStatus)}`}>
          {linksStatus.message}
        </p>
      )}

      <div className="sticky bottom-4 rounded-xl border border-border/60 bg-background/90 backdrop-blur p-3 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setModalOpen(true)}
          disabled={linksStatus.state === 'saving' || links.length >= 6}
        >
          + Añadir botón
        </Button>
        <Button
          onClick={() => void onSaveLinks()}
          className="px-6"
          disabled={linksStatus.state === 'saving'}
        >
          <Save className="w-4 h-4 mr-2" />
          {linksStatus.state === 'saving' ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      <AddLinkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={onAddLink}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verificar tipos y lint**

```bash
npx tsc --noEmit 2>&1 | grep -v ".next" | grep -v "node_modules" | grep -v "cmdk" | head -20
```

Expected: sin errores.

- [ ] **Step 4: Probar en dev server**

```bash
npm run dev
```

Verificar en `http://localhost:3000/dashboard`:

1. **Auto-botón WhatsApp:**
   - Ir a "Mi Perfil", ingresar un número de WhatsApp (ej. seleccionar Perú +51, tipear 987654321), guardar
   - Ir a "Mis Botones" — debe aparecer el botón WhatsApp con el ícono de candado 🔒 y "Mi Perfil"
   - El botón de WhatsApp no tiene campo de URL ni botón "Eliminar"
   - La tarjeta pública (`/[username]`) muestra el botón WhatsApp funcional
   - Borrar el número de WhatsApp en Mi Perfil, guardar → el botón desaparece de Mis Botones

2. **Drag & Drop:**
   - Arrastrar cualquier botón (incluyendo el de WhatsApp) a otra posición
   - El orden se actualiza visualmente de inmediato
   - Recargar la página — el orden persiste
   - En mobile (DevTools responsive) — arrastrar con touch funciona después de 250ms de press

3. **Modal "Añadir botón":**
   - Abrir el modal — WhatsApp NO aparece entre las opciones
