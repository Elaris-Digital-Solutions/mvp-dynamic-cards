# Phone Input con Selector de Código de País

**Fecha:** 2026-05-04  
**Estado:** Aprobado

---

## Contexto y motivación

El formulario de perfil tenía un campo de teléfono con un checkbox "Usar el mismo número para WhatsApp" que ocultaba el campo de WhatsApp. Esto provocaba dos problemas:

1. El vCard solo incluía un número de teléfono (limitación de código, no del estándar — vCard 3.0 soporta múltiples líneas `TEL`).
2. Los números se guardaban sin código de país, lo que impedía que iOS los reconociera correctamente al importar el contacto.

## Decisiones de diseño

- **Selector de código:** Botón con bandera + código de discado que abre un Popover con búsqueda (shadcn `Popover` + `Command`).
- **Layout del formulario:** Teléfono y WhatsApp lado a lado en desktop (`grid-cols-2`), apilados en mobile (una columna). El checkbox desaparece.
- **País predeterminado:** Perú (`+51 🇵🇪`).
- **Almacenamiento:** Sin cambios de schema. Los campos `phone` y `whatsapp` siguen siendo `varchar(30)`. El valor guardado cambia de `"1143221234"` a `"+51 987654321"` (número completo con prefijo).
- **vCard:** Dos líneas `TEL` cuando ambos números existen y son distintos; una sola línea si son iguales o falta alguno.

---

## Componente `PhoneInput`

**Archivo:** `components/ui/phone-input.tsx`  
**Tipo:** Client Component reutilizable.

### Props

```ts
type PhoneInputProps = {
  id?: string
  value: string           // número completo: "+51 987654321"
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}
```

### Comportamiento interno

- Al montar, parsea `value` para separar el dial code (ej. `+51`) del número local.
- El botón muestra `{flag} {dialCode} ▾`. Al hacer click abre el Popover.
- Dentro del Popover: un `CommandInput` para buscar por nombre de país o código, y una lista con cada ítem mostrando `{flag} {nombre} {dialCode}`.
- El input de número local acepta solo dígitos, espacios y guiones.
- En cada cambio emite `onChange(dialCode + " " + localNumber)`.

### País predeterminado

Si `value` está vacío al montar, el selector muestra Perú (`+51 🇵🇪`) pero no emite `onChange` — el campo queda vacío hasta que el usuario tipee un número.

---

## Lista de países

**Archivo:** `lib/constants/phone-countries.ts`

22 entradas: toda LATAM + España + EE.UU. Orden: Perú primero, luego alfabético.

| País | Código | Flag |
|---|---|---|
| Perú | +51 | 🇵🇪 |
| Argentina | +54 | 🇦🇷 |
| Bolivia | +591 | 🇧🇴 |
| Brasil | +55 | 🇧🇷 |
| Chile | +56 | 🇨🇱 |
| Colombia | +57 | 🇨🇴 |
| Costa Rica | +506 | 🇨🇷 |
| Cuba | +53 | 🇨🇺 |
| Ecuador | +593 | 🇪🇨 |
| El Salvador | +503 | 🇸🇻 |
| España | +34 | 🇪🇸 |
| Estados Unidos | +1 | 🇺🇸 |
| Guatemala | +502 | 🇬🇹 |
| Honduras | +504 | 🇭🇳 |
| México | +52 | 🇲🇽 |
| Nicaragua | +505 | 🇳🇮 |
| Panamá | +507 | 🇵🇦 |
| Paraguay | +595 | 🇵🇾 |
| Puerto Rico | +1-787 | 🇵🇷 |
| República Dominicana | +1-809 | 🇩🇴 |
| Uruguay | +598 | 🇺🇾 |
| Venezuela | +58 | 🇻🇪 |

---

## Cambios al formulario de perfil

**Archivo:** `features/dashboard/sections/dashboard-perfil-section.tsx`

- Reemplazar los campos de teléfono y WhatsApp + checkbox por dos `PhoneInput` lado a lado.
- El grid de "Información de contacto" ya usa `grid-cols-1 md:grid-cols-2`; ambos `PhoneInput` encajan naturalmente en una fila.
- El campo de WhatsApp lleva un ícono o borde verde sutil para diferenciarlo visualmente.

---

## Cambios al estado del dashboard

**Archivo:** `types/ui.types.ts` — eliminar `useSameWhatsApp` de `ProfileFormState`.

**Archivo:** `components/dashboard/DashboardClient.tsx`:
- Eliminar `useSameWhatsApp: true` del estado inicial.
- Simplificar `handleProfileSave`: `whatsapp` ya no necesita el fallback `useSameWhatsApp ? phone : whatsapp`.
- En `profile.ts` (server action), eliminar `const whatsapp = parsed.data.whatsapp || phone` — cada campo se guarda independientemente.

---

## Cambios al generador de vCard

**Archivo:** `lib/utils/generate-vcard.ts`

```
Si phone !== whatsapp y ambos existen:
  TEL;TYPE=WORK:{normalizePhone(phone)}
  TEL;TYPE=CELL:{normalizePhone(whatsapp)}

Si son iguales o solo hay uno:
  TEL;TYPE=CELL:{normalizePhone(whatsapp || phone)}
```

El `normalizePhone` existente ya produce formato E.164 cuando el número tiene `+`, lo que garantiza compatibilidad total con iOS y Android.

---

## Archivos a crear

- `components/ui/phone-input.tsx`
- `lib/constants/phone-countries.ts`

## Archivos a modificar

- `features/dashboard/sections/dashboard-perfil-section.tsx`
- `types/ui.types.ts`
- `components/dashboard/DashboardClient.tsx`
- `lib/actions/profile.ts`
- `lib/utils/generate-vcard.ts`
