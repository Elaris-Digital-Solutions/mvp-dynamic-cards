'use client'

import { useRef, useState, useEffect } from 'react'
import { Home } from 'lucide-react'
import { Sidebar } from '@/components/shared/sidebar'
import { DashboardBotonesSection } from '@/features/dashboard/sections/dashboard-botones-section'
import { DashboardCuentaSection } from '@/features/dashboard/sections/dashboard-cuenta-section'
import { DashboardInicioSection } from '@/features/dashboard/sections/dashboard-inicio-section'
import { DashboardPerfilSection } from '@/features/dashboard/sections/dashboard-perfil-section'
import { DashboardPlantillaSection } from '@/features/dashboard/sections/dashboard-plantilla-section'
import { TEMPLATES } from '@/lib/constants'
import { useLogout } from '@/lib/auth/useLogout'
import { updateProfile, updateTemplate, deleteAccount } from '@/lib/actions/profile'
import { UsernameSetupModal } from '@/components/dashboard/UsernameSetupModal'
import { compressImage } from '@/lib/utils/compress-image'
import { createButton, updateButton, deleteButton } from '@/lib/actions/buttons'
import type { UIUserProfile, UILinkItem } from '@/lib/utils/adapters'
import type {
  DashboardSection,
  EditableLink,
  LinkIcon,
  ProfileFormState,
  SaveStatus,
} from '@/types/ui.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_STATUS: SaveStatus = { state: 'idle', message: '' }

function normalizeIcon(icon: string): LinkIcon {
  if (
    icon === 'instagram' ||
    icon === 'linkedin' ||
    icon === 'whatsapp' ||
    icon === 'website'
  ) {
    return icon
  }
  return 'link'
}

type Props = {
  initialProfile: UIUserProfile
  isAdmin?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardClient({ initialProfile, isAdmin }: Props) {
  const { handleLogout } = useLogout()

  // ── Username setup (collision recovery) ───────────────────────────────────
  const [needsUsernameSetup, setNeedsUsernameSetup] = useState(
    () => !!initialProfile.username?.startsWith('_tmp_')
  )

  // ── Section state ──────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<DashboardSection>('inicio')

  // ── Profile form state ─────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    firstName: initialProfile.firstName,
    lastName: initialProfile.lastName,
    title: initialProfile.title ?? '',
    company: initialProfile.company ?? '',
    email: initialProfile.email,
    phone: initialProfile.phone ?? '',
    whatsapp: initialProfile.whatsapp ?? '',
    bio: initialProfile.bio ?? '',
    profileImage: initialProfile.profileImage ?? '',
    bannerImage: initialProfile.bannerImage ?? '',
    useSameWhatsApp: true,
  })

  // ── Links state ────────────────────────────────────────────────────────────
  const [links, setLinks] = useState<EditableLink[]>(
    (initialProfile.links ?? []).map((l: UILinkItem) => ({ ...l, icon: normalizeIcon(l.icon) }))
  )

  // ── Status state ───────────────────────────────────────────────────────────
  const [profileStatus, setProfileStatus] = useState<SaveStatus>(INITIAL_STATUS)
  const [linksStatus, setLinksStatus] = useState<SaveStatus>(INITIAL_STATUS)
  const [templateStatus, setTemplateStatus] = useState<SaveStatus>(INITIAL_STATUS)

  // ── Template state ─────────────────────────────────────────────────────────
  const [activeTemplateId, setActiveTemplateId] = useState(
    initialProfile.selectedTemplate ?? 'minimal-black'
  )

  // ── Image upload state ─────────────────────────────────────────────────────
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false)
  const [isUploadingBannerImage, setIsUploadingBannerImage] = useState(false)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const bannerImageInputRef = useRef<HTMLInputElement>(null)
  const [pendingProfileImage, setPendingProfileImage] = useState<File | null>(null)
  const [pendingBannerImage, setPendingBannerImage] = useState<File | null>(null)
  const previewUrls = useRef<{ profileImage?: string; bannerImage?: string }>({})

  useEffect(() => {
    return () => {
      if (previewUrls.current.profileImage) URL.revokeObjectURL(previewUrls.current.profileImage)
      if (previewUrls.current.bannerImage) URL.revokeObjectURL(previewUrls.current.bannerImage)
    }
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const cloudinaryUpload = async (file: File): Promise<string> => {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

    if (!ALLOWED.includes(file.type))
      throw new Error('Solo se permiten imágenes JPG, PNG o WebP.')

    const compressed = await compressImage(file)

    const formData = new FormData()
    formData.append('file', compressed)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    return data.secure_url
  }

  const handleImageUpload = (
    field: 'profileImage' | 'bannerImage',
    file: File | undefined,
  ) => {
    if (!file) return

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED.includes(file.type)) {
      setProfileStatus({ state: 'error', message: 'Solo se permiten imágenes JPG, PNG o WebP.' })
      return
    }

    // Revoke previous preview to free memory
    if (previewUrls.current[field]) URL.revokeObjectURL(previewUrls.current[field]!)

    const preview = URL.createObjectURL(file)
    previewUrls.current[field] = preview

    if (field === 'profileImage') setPendingProfileImage(file)
    else setPendingBannerImage(file)

    setProfileForm((prev: ProfileFormState) => ({ ...prev, [field]: preview }))
    setProfileStatus({ state: 'idle', message: '' })
  }

  const handleProfileSave = async () => {
    setProfileStatus({ state: 'saving', message: 'Guardando cambios de perfil...' })

    let avatarUrl = profileForm.profileImage
    let bannerUrl = profileForm.bannerImage

    if (pendingProfileImage) {
      setIsUploadingProfileImage(true)
      try {
        avatarUrl = await cloudinaryUpload(pendingProfileImage)
      } catch {
        setProfileStatus({ state: 'error', message: 'No se pudo subir la foto de perfil.' })
        setIsUploadingProfileImage(false)
        return
      }
      setIsUploadingProfileImage(false)
    }

    if (pendingBannerImage) {
      setIsUploadingBannerImage(true)
      try {
        bannerUrl = await cloudinaryUpload(pendingBannerImage)
      } catch {
        setProfileStatus({ state: 'error', message: 'No se pudo subir la foto de portada.' })
        setIsUploadingBannerImage(false)
        return
      }
      setIsUploadingBannerImage(false)
    }

    const formData = new FormData()
    formData.append('first_name', profileForm.firstName)
    formData.append('last_name', profileForm.lastName)
    formData.append('job_title', profileForm.title)
    formData.append('company', profileForm.company)
    formData.append('bio', profileForm.bio)
    formData.append('phone', profileForm.phone)
    formData.append('whatsapp', profileForm.useSameWhatsApp ? profileForm.phone : profileForm.whatsapp)
    formData.append('avatar_url', avatarUrl)
    formData.append('banner_url', bannerUrl)

    const res = await updateProfile(formData)

    if (res && 'error' in res) {
      setProfileStatus({ state: 'error', message: res.error as string })
    } else {
      // Revoke preview URLs and clear pending state
      if (previewUrls.current.profileImage) {
        URL.revokeObjectURL(previewUrls.current.profileImage)
        delete previewUrls.current.profileImage
      }
      if (previewUrls.current.bannerImage) {
        URL.revokeObjectURL(previewUrls.current.bannerImage)
        delete previewUrls.current.bannerImage
      }
      setPendingProfileImage(null)
      setPendingBannerImage(null)
      setProfileForm((prev: ProfileFormState) => ({ ...prev, profileImage: avatarUrl, bannerImage: bannerUrl }))
      setProfileStatus({ state: 'success', message: 'Perfil actualizado correctamente.' })
    }
  }

  const handleTemplateSelect = async (templateId: string) => {
    setTemplateStatus({ state: 'saving', message: 'Aplicando plantilla...' })
    const res = await updateTemplate(templateId)
    
    if (res && 'error' in res) {
      setTemplateStatus({ state: 'error', message: res.error as string })
    } else {
      setActiveTemplateId(templateId)
      setTemplateStatus({ state: 'success', message: 'Plantilla actualizada.' })
    }
  }

  const updateLink = (id: string, field: 'title' | 'url' | 'icon', value: string) => {
    setLinks((prev: EditableLink[]) => prev.map((l: EditableLink) => (l.id === id ? { ...l, [field]: value } : l)))
  }

  const removeLink = (id: string) => {
    setLinks((prev: EditableLink[]) => prev.filter((l: EditableLink) => l.id !== id))
  }

  const addLink = (data: { icon: LinkIcon; title: string; url: string }) => {
    if (links.length >= 6) return
    setLinks((prev: EditableLink[]) => [
      ...prev,
      { id: crypto.randomUUID(), ...data },
    ])
  }

  const saveLinks = async () => {
    for (const link of links) {
      if (!link.title.trim() || !link.url.trim()) {
        setLinksStatus({
          state: 'error',
          message: 'Todos los botones deben incluir etiqueta y URL.',
        })
        return
      }
    }
    setLinksStatus({ state: 'saving', message: 'Sincronizando botones...' })

    const initialLinks = initialProfile.links ?? []
    const currentIds = new Set(links.map((l: EditableLink) => l.id))
    
    // Deletions -> ID exists in initial but not current
    const deletedLinks = initialLinks.filter((l: UILinkItem) => !currentIds.has(l.id))

    // Handle new and updated links
    for (const link of links) {
      const isNew = !initialLinks.some((l: UILinkItem) => l.id === link.id)
      const formData = new FormData()
      formData.append('id', link.id)
      formData.append('label', link.title)
      formData.append('url', link.url)
      formData.append('icon', link.icon)

      if (isNew) {
        const res = await createButton(formData)
        if (res && 'error' in res) {
          setLinksStatus({ state: 'error', message: res.error as string })
          return
        }
      } else {
        const orig = initialLinks.find((l: UILinkItem) => l.id === link.id)!
        if (orig.title !== link.title || orig.url !== link.url || orig.icon !== link.icon) {
          const res = await updateButton(link.id, formData)
          if (res && 'error' in res) {
            setLinksStatus({ state: 'error', message: res.error as string })
            return
          }
        }
      }
    }

    // Handle deletions
    for (const del of deletedLinks) {
      const res = await deleteButton(del.id)
      if (res && 'error' in res) {
        setLinksStatus({ state: 'error', message: res.error as string })
        return
      }
    }

    setLinksStatus({ state: 'success', message: 'Botones actualizados correctamente.' })
  }

  const activeTemplate =
    TEMPLATES[activeTemplateId as keyof typeof TEMPLATES] ?? TEMPLATES['minimal-black']

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen animate-in fade-in duration-700 ease-out">
      {needsUsernameSetup && (
        <UsernameSetupModal
          onSuccess={(username) => {
            setNeedsUsernameSetup(false)
            setProfileForm((prev: ProfileFormState) => ({ ...prev }))
            // Update sidebar link
            initialProfile.username = username
          }}
        />
      )}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(s: string) => setActiveSection(s as DashboardSection)}
        userEmail={initialProfile.email}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        username={initialProfile.username}
      />

      <main className="flex-1 overflow-auto bg-background p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-700 ease-out delay-150 fill-mode-both">
        <div className="max-w-[1200px] mx-auto lg:px-8 xl:px-22">
          {activeSection === 'inicio' && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <Home className="w-4 h-4" />
                <span className="text-xs uppercase tracking-[0.2em]">Panel</span>
              </div>
              <DashboardInicioSection />
            </div>
          )}

          {activeSection === 'perfil' && (
            <DashboardPerfilSection
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              profileStatus={profileStatus}
              isUploadingProfileImage={isUploadingProfileImage}
              isUploadingBannerImage={isUploadingBannerImage}
              profileImageInputRef={profileImageInputRef}
              bannerImageInputRef={bannerImageInputRef}
              onImageUpload={handleImageUpload}
              onSave={handleProfileSave}
            />
          )}

          {activeSection === 'botones' && (
            <DashboardBotonesSection
              links={links}
              linksStatus={linksStatus}
              onRemoveLink={removeLink}
              onUpdateLink={updateLink}
              onAddLink={addLink}
              onSaveLinks={saveLinks}
            />
          )}

          {activeSection === 'plantilla' && (
            <DashboardPlantillaSection
              userName={initialProfile.name}
              userTitle={initialProfile.title}
              selectedTemplate={activeTemplateId}
              activeTemplateName={activeTemplate.name}
              templateStatus={templateStatus}
              onTemplateSelect={handleTemplateSelect}
            />
          )}

          {activeSection === 'cuenta' && (
            <DashboardCuentaSection
              username={initialProfile.username ?? ''}
              onDeleteAccount={async () => { await deleteAccount() }}
            />
          )}

        </div>
      </main>
    </div>
  )
}
