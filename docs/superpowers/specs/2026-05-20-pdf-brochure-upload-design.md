# PDF Brochure Upload — Design Spec

**Date:** 2026-05-20
**Status:** Approved

---

## Overview

Users can upload a single PDF brochure (máximo 10 MB) visible en su tarjeta pública como un botón "Ver brochure". El PDF ocupa uno de los 6 slots de `action_buttons` como botón gestionado (`is_managed = true`). El slot solo existe mientras haya un PDF activo.

---

## Architecture

### Storage

- **Proveedor:** Supabase Storage (nuevo bucket `profile-pdfs`)
- **Acceso:** Público (los brochures son visibles en la tarjeta pública)
- **Path fijo:** `{user_id}/brochure.pdf` — sobreescribe el anterior automáticamente
- **Límite:** 10 MB (validado en servidor y en RLS policy del bucket)

### Database

**Tabla `profiles` — columnas nuevas:**
```sql
ALTER TABLE public.profiles
  ADD COLUMN pdf_filename text,
  ADD COLUMN pdf_size integer; -- bytes, para mostrar en dashboard
```

`pdf_filename` y `pdf_size` son solo para el dashboard. La URL del PDF vive en `action_buttons.url` del botón managed.

**Tabla `action_buttons` — sin cambios de schema.**
El PDF se representa como una fila con:
- `is_managed = true`
- `icon = 'brochure'`
- `label = 'Ver brochure'`
- `url` = URL pública de Supabase Storage

Migración: `supabase/migrations/YYYYMMDD_add_pdf_to_profiles.sql`

---

## Data Flow

### Upload

```
1. Usuario selecciona PDF en PdfUploader.tsx
2. Validación client-side: MIME type + tamaño ≤ 10 MB
3. FormData → Server Action uploadProfilePdf()
4. requireAuth() → obtiene userId
5. Validación server-side con Zod (MIME + tamaño)
6. ¿Ya existe botón managed PDF?
   → SÍ: UPDATE action_button (url) — no consume slot extra
   → NO: INSERT action_button — enforce_button_quota valida el límite
7. Sube archivo a Supabase Storage → path {userId}/brochure.pdf
8. Obtiene publicUrl del bucket
9. UPDATE profiles SET pdf_filename, pdf_size WHERE id = userId
10. revalidatePath('/dashboard')
11. revalidatePath('/[username]')
```

### Delete

```
1. Usuario hace clic "Eliminar" en PdfUploader.tsx
2. Server Action deleteProfilePdf()
3. requireAuth()
4. DELETE action_button WHERE profile_id = userId AND icon = 'brochure' AND is_managed = true
5. DELETE archivo de Supabase Storage: {userId}/brochure.pdf
6. UPDATE profiles SET pdf_filename = null, pdf_size = null WHERE id = userId
7. revalidatePaths
```

---

## Validation

**Zod schema (lib/validation/schemas.ts):**
```ts
const pdfUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(f => f.type === 'application/pdf', 'Solo se aceptan archivos PDF')
    .refine(f => f.size <= 10 * 1024 * 1024, 'El archivo no puede superar 10 MB'),
})
```

Validación doble: client-side (UX inmediata) y server-side (seguridad). El MIME type se valida en servidor porque el cliente puede falsificarlo.

---

## Edge Cases

| Caso | Comportamiento |
|------|----------------|
| Usuario con 6 botones intenta subir PDF por primera vez | Server Action captura el error del trigger y retorna: *"Has alcanzado el límite de 6 botones. Elimina uno para añadir tu brochure."* |
| Usuario reemplaza PDF existente | UPDATE en lugar de INSERT — no consume slot adicional |
| Archivo no es PDF | Error inmediato en cliente y validación en servidor |
| Archivo > 10 MB | Error inmediato en cliente y validación en servidor |
| Upload falla tras insertar botón | Rollback: DELETE action_button + retornar error |

---

## UI Components

### PdfUploader.tsx (Client Component)

Ubicación: `features/dashboard/sections/dashboard-botones-section.tsx` — tarjeta fija al final de la lista de botones.

**Estado sin PDF:**
- Zona de drop con input file
- Botón "Subir brochure"
- Aviso preventivo si usuario ya tiene 6 botones: *"Necesitas un slot libre para añadir el brochure"*

**Estado con PDF:**
- Nombre del archivo (`pdf_filename`)
- Tamaño formateado (ej. "2.4 MB")
- Botón "Ver" (abre `action_button.url` en `target="_blank"`)
- Botón "Reemplazar" (abre el input file)
- Botón "Eliminar"

**Estado cargando:**
- Spinner durante el upload

### Tarjeta pública `/[username]`

El botón del PDF se renderiza en `linktree-card.tsx` igual que los demás `action_buttons`. El `icon = 'brochure'` se mapea a un icono de documento en el mapa de íconos existente. El click registra `event_type = 'pdf_view'` en `click_events`.

El contador "X / 6" en "Enlaces y redes" refleja el slot solo cuando hay un PDF activo.

---

## Security & CSP

- El archivo nunca pasa con permisos de escritura por el cliente — la Service Role Key solo se usa en el Server Action.
- Añadir a `connect-src` en `next.config.ts`: `https://<project-ref>.supabase.co`
- RLS policy en el bucket `profile-pdfs`: solo el propietario puede subir/borrar su archivo.

---

## Files to Create / Modify

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/YYYYMMDD_add_pdf_to_profiles.sql` | Crear — ALTER TABLE profiles |
| `lib/actions/profile.ts` | Modificar — añadir `uploadProfilePdf()` y `deleteProfilePdf()` |
| `lib/validation/schemas.ts` | Modificar — añadir `pdfUploadSchema` |
| `features/dashboard/sections/dashboard-botones-section.tsx` | Modificar — integrar `PdfUploader` |
| `components/dashboard/PdfUploader.tsx` | Crear — componente client |
| `components/card/linktree-card.tsx` | Modificar — mapear icono `brochure` |
| `next.config.ts` | Modificar — actualizar CSP con dominio Supabase Storage |
