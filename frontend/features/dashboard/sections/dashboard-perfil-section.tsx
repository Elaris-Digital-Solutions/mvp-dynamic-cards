import type { RefObject } from 'react'
import { Save } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildDashboardStatusClass } from '@/features/dashboard/dashboard-status'
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
    onUpload?: (file: File) => Promise<string>
  ) => Promise<void>
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
        <h1 className="text-4xl font-black tracking-tight">Mi perfil</h1>
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
              void onImageUpload('profileImage', event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <input
            ref={bannerImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void onImageUpload('bannerImage', event.target.files?.[0])
              event.target.value = ''
            }}
          />

          <div className="relative h-32 md:h-40 w-full rounded-lg border border-primary/40 shadow-inner overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: profileForm.bannerImage
                  ? `url(${profileForm.bannerImage})`
                  : 'linear-gradient(to right, rgba(255,255,255,0.7), #22324e, #0d1f3c)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-black/25 to-black/40" />

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => profileImageInputRef.current?.click()}
              disabled={isUploadingProfileImage || profileStatus.state === 'saving'}
              className="absolute z-10 bottom-3 left-24 md:left-32 h-8 rounded-md border-border/70 bg-background/95 text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-primary/50 hover:bg-background hover:shadow-lg hover:shadow-black/30 active:translate-y-0 active:scale-100"
            >
              {isUploadingProfileImage ? 'Subiendo...' : 'Subir foto de perfil'}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => bannerImageInputRef.current?.click()}
              disabled={isUploadingBannerImage || profileStatus.state === 'saving'}
              className="absolute z-10 bottom-3 right-3 h-8 rounded-md border-border/70 bg-background/95 text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-primary/50 hover:bg-background hover:shadow-lg hover:shadow-black/30 active:translate-y-0 active:scale-100"
            >
              {isUploadingBannerImage ? 'Subiendo...' : 'Agregar foto de portada'}
            </Button>
          </div>

          <Avatar className="absolute z-20 -bottom-0 left-10 h-20 w-20 rounded-xl border-4 border-background shadow-xl">
            <AvatarImage src={profileForm.profileImage || undefined} />
            <AvatarFallback className="rounded-xl text-lg font-bold bg-white text-black">
              {profileForm.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Contact info */}
      <div className="rounded-xl border border-border/60 p-4 space-y-4">
        <p className="text-sm tracking-[0.2em] uppercase font-semibold">Informacion de contacto</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" value={profileForm.name} onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))} />
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
            <Label htmlFor="phone">Telefono</Label>
            <Input id="phone" value={profileForm.phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" value={profileForm.whatsapp} onChange={(e) => setProfileForm((prev) => ({ ...prev, whatsapp: e.target.value }))} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Biografia</Label>
            <textarea
              id="bio"
              value={profileForm.bio}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={() => void onSave()} className="px-6" disabled={profileStatus.state === 'saving'}>
          <Save className="w-4 h-4 mr-2" />
          {profileStatus.state === 'saving' ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {profileStatus.state !== 'idle' && (
        <p className={`text-sm font-medium text-right ${buildDashboardStatusClass(profileStatus)}`}>
          {profileStatus.message}
        </p>
      )}
    </div>
  )
}
