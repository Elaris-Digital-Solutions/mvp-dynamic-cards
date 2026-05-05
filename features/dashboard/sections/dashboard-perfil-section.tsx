import type { RefObject } from 'react'
import { Save, Loader2, Camera } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { IconBrandWhatsapp } from '@tabler/icons-react'
import type { ProfileFormState, SaveStatus } from '@/types/ui.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardPerfilSectionProps = {
  profileForm: ProfileFormState
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileFormState>>
  profileStatus: SaveStatus
  isUploadingProfileImage: boolean
  isUploadingBannerImage: boolean
  profileImageInputRef: RefObject<HTMLInputElement | null>
  bannerImageInputRef: RefObject<HTMLInputElement | null>
  /**
   * Called when user selects an image file.
   *
   * The optional third argument `onUpload` is the integration point for a real
   * upload service (e.g. Cloudinary). When omitted, the page handler falls back
   * to URL.createObjectURL() for local preview.
   *
   * Integration example (in the parent page):
   *   const myUpload = async (file: File) => {
   *     const res = await fetch('/api/uploads/image', { method: 'POST', body: ... })
   *     return (await res.json()).data.url
   *   }
   *   onImageUpload('profileImage', file, myUpload)
   */
  onImageUpload: (
    field: 'profileImage' | 'bannerImage',
    file: File | undefined,
  ) => void
  onSave: () => Promise<void>
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardPerfilSection({
  profileForm,
  setProfileForm,
  profileStatus,
  isUploadingProfileImage,
  isUploadingBannerImage,
  profileImageInputRef,
  bannerImageInputRef,
  onImageUpload,
  onSave,
}: DashboardPerfilSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight">Datos personales</h1>
        <p className="mt-1.5 text-muted-foreground text-lg">Configura la informacion publica y de contacto.</p>
      </div>

      {/* Visual identity */}
      <div className="rounded-xl border border-border/60 p-4 space-y-4">
        <p className="text-sm tracking-[0.2em] uppercase font-semibold">Identidad visual</p>
        <div className="relative rounded-lg border border-border/60 p-3 md:p-4 pb-10 overflow-visible bg-card">
          <input
            ref={profileImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              onImageUpload('profileImage', event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <input
            ref={bannerImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              onImageUpload('bannerImage', event.target.files?.[0])
              event.target.value = ''
            }}
          />

          {/* Banner — clickeable para cambiar portada */}
          <button
            type="button"
            onClick={() => bannerImageInputRef.current?.click()}
            disabled={isUploadingBannerImage || profileStatus.state === 'saving'}
            className="relative h-32 md:h-40 w-full rounded-lg border border-primary/40 shadow-inner overflow-hidden group cursor-pointer disabled:cursor-not-allowed"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: profileForm.bannerImage
                  ? `url(${profileForm.bannerImage})`
                  : 'linear-gradient(to right, rgba(255,255,255,0.7), #22324e, #0d1f3c)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-black/25 to-black/40" />
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity">
              {isUploadingBannerImage
                ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                : <div className="flex flex-col items-center gap-1.5 text-white">
                    <Camera className="w-6 h-6" />
                    <span className="text-xs font-semibold tracking-wide">Cambiar portada</span>
                  </div>
              }
            </div>
          </button>

          {/* Avatar — clickeable para cambiar foto de perfil */}
          <button
            type="button"
            onClick={() => profileImageInputRef.current?.click()}
            disabled={isUploadingProfileImage || profileStatus.state === 'saving'}
            className="absolute z-20 -bottom-0 left-10 h-20 w-20 rounded-xl group cursor-pointer disabled:cursor-not-allowed"
          >
            <Avatar className="h-full w-full rounded-xl border-4 border-background shadow-xl">
              <AvatarImage src={profileForm.profileImage || undefined} />
              <AvatarFallback className="rounded-xl text-lg font-bold bg-white text-black">
                {profileForm.firstName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-[8px] flex items-center justify-center bg-black/55 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity">
              {isUploadingProfileImage
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Camera className="w-5 h-5 text-white" />
              }
            </div>
          </button>
        </div>
      </div>

      {/* Contact info */}
      <div className="rounded-xl border border-border/60 p-4 space-y-4">
        <p className="text-sm tracking-[0.2em] uppercase font-semibold">Informacion de contacto</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombres</Label>
            <Input id="firstName" value={profileForm.firstName} onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellidos</Label>
            <Input id="lastName" value={profileForm.lastName} onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Cargo</Label>
            <Input id="title" value={profileForm.title} onChange={(e) => setProfileForm((prev) => ({ ...prev, title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" value={profileForm.company} onChange={(e) => setProfileForm((prev) => ({ ...prev, company: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profileForm.email} onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <PhoneInput
              id="phone"
              value={profileForm.phone}
              onChange={(val) => setProfileForm((prev) => ({ ...prev, phone: val }))}
              placeholder="987 654 321"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
              <IconBrandWhatsapp className="w-4 h-4 text-[#25d366]" />
              WhatsApp
            </Label>
            <PhoneInput
              id="whatsapp"
              value={profileForm.whatsapp}
              onChange={(val) => setProfileForm((prev) => ({ ...prev, whatsapp: val }))}
              placeholder="987 654 321"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="bio">Biografía</Label>
              <span className={`text-xs ${profileForm.bio.length > 480 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {profileForm.bio.length} / 500
              </span>
            </div>
            <textarea
              id="bio"
              value={profileForm.bio}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              maxLength={500}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={() => void onSave()} className="px-6" disabled={profileStatus.state === 'saving'}>
          {profileStatus.state === 'saving'
            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            : <Save className="w-4 h-4 mr-2" />}
          {profileStatus.state === 'saving' ? 'Guardando...' : 'Publicar cambios'}
        </Button>
      </div>

      {profileStatus.state === 'error' && (
        <p className="text-sm font-medium text-right text-red-400">
          {profileStatus.message}
        </p>
      )}
    </div>
  )
}
