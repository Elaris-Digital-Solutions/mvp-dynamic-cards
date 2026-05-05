# Auto-botón WhatsApp + Drag & Drop — Design

**Fecha:** 2026-05-04  
**Estado:** Aprobado

---

## Contexto

Los usuarios configuran su número de WhatsApp en "Mi Perfil" pero el botón de WhatsApp en la tarjeta pública requería crearlo manualmente en "Mis Botones". Esta fricción desaparece: el botón se crea/actualiza/elimina automáticamente cuando el perfil cambia. El drag & drop permite reordenar todos los botones (incluyendo el managed) desde la misma interfaz.

---

## Sección 1 — Base de datos

### Migración
Agregar columna `is_managed boolean NOT NULL DEFAULT false` a `action_buttons`.

- `false` (default): botón creado manualmente por el usuario
- `true`: botón generado y sincronizado automáticamente desde el perfil

### RLS / Políticas
Sin cambios en políticas existentes. La columna `is_managed` es solo metadata interna.

---

## Sección 2 — Auto-botón WhatsApp

### Sincronización desde updateProfile

En `lib/actions/profile.ts`, después del `UPDATE` de `profiles`, se ejecuta una lógica de sync:

**Si `whatsapp` tiene valor:**
```
UPSERT en action_buttons:
  WHERE profile_id = user.id AND icon = 'whatsapp' AND is_managed = true
  SET url = 'https://wa.me/' + normalizeWhatsappNumber(whatsapp),
      label = 'WhatsApp',
      is_managed = true,
      icon = 'whatsapp'
  Si no existe: INSERT con sort_order = (MAX sort_order actual) + 1
```

**Si `whatsapp` está vacío:**
```
DELETE FROM action_buttons
  WHERE profile_id = user.id AND icon = 'whatsapp' AND is_managed = true
```

### Normalización de la URL de WhatsApp

La función `normalizeWhatsappNumber(phone: string): string`:
- Toma el valor del campo whatsapp (ej. `"+51 987654321"`)
- Extrae solo dígitos: `"51987654321"`
- La URL resultante: `"https://wa.me/51987654321"`

### Límite de botones

El botón managed cuenta dentro del límite de 6. La UI ya gestiona esto por `links.length >= 6`.

---

## Sección 3 — Drag & Drop

### Librería
`@dnd-kit/sortable` + `@dnd-kit/core` + `@dnd-kit/utilities`

### Comportamiento
- Cada fila de botón tiene un handle `GripVertical` (lucide-react) a la izquierda
- Arrastrar reordena visualmente y guarda automáticamente al soltar (sin "Guardar cambios")
- El botón managed de WhatsApp también es arrastrable
- En mobile: drag por touch funciona nativamente con @dnd-kit

### Nueva server action
`reorderButtons(orderedIds: string[])` en `lib/actions/buttons.ts`:
- Requiere usuario autenticado y activo
- Valida que todos los IDs pertenezcan al perfil del usuario
- Actualiza `sort_order` de cada botón: `orderedIds.map((id, index) => UPDATE ... SET sort_order = index)`
- Llama `revalidatePath('/[username]')` y `revalidatePath('/dashboard')`

### Separación de acciones
- **Reordenar** → `reorderButtons` → auto-save al soltar
- **Editar URL/label** → flujo existente `saveLinks` → botón "Guardar cambios"

---

## Sección 4 — UI: Pestaña "Mis Botones"

### Botón managed en la lista
- Misma tarjeta que los otros botones
- Muestra ícono de WhatsApp + label "WhatsApp"
- Badge o texto pequeño: `"Gestionado desde Mi Perfil"` en lugar del botón "Eliminar"
- Sin campo de URL editable
- Handle de drag igual al resto

### Modal "Añadir botón"
- La opción `whatsapp` se elimina del `TYPE_ORDER` en el modal
- Razón: el botón WhatsApp solo se gestiona desde Mi Perfil

### Prop nueva en DashboardBotonesSection
```ts
onReorderLinks: (orderedIds: string[]) => Promise<void>
```

---

## Sección 5 — Tipos

### EditableLink (types/ui.types.ts)
Agregar campo opcional:
```ts
isManaged?: boolean
```

### Adapter (lib/utils/adapters.ts)
Mapear `is_managed` → `isManaged` en `dbProfileToUIProfile`.

---

## Archivos a crear
- Ninguno nuevo (solo modificaciones)

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `lib/actions/profile.ts` | Sync del botón WhatsApp tras guardar perfil |
| `lib/actions/buttons.ts` | Nueva action `reorderButtons` |
| `lib/utils/adapters.ts` | Mapear `is_managed` → `isManaged` |
| `types/ui.types.ts` | Agregar `isManaged?` a `EditableLink` |
| `components/dashboard/DashboardClient.tsx` | Handler `handleReorderLinks`, pasar prop |
| `features/dashboard/sections/dashboard-botones-section.tsx` | DnD, managed badge, quitar whatsapp del modal |
| DB migration | Columna `is_managed` en `action_buttons` |
