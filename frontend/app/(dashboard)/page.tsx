'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/shared/sidebar'
import { DashboardBotonesSection } from '@/features/dashboard/sections/dashboard-botones-section'
import { DashboardInicioSection } from '@/features/dashboard/sections/dashboard-inicio-section'
import { DashboardPerfilSection } from '@/features/dashboard/sections/dashboard-perfil-section'
import { DashboardPlantillaSection } from '@/features/dashboard/sections/dashboard-plantilla-section'
import { MOCK_USER } from '@/lib/mock-data'
import { TEMPLATES } from '@/lib/constants'
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // Static mock — replace with authenticated user data during integration.
  // Example: const user = await getServerSideUser()  (Server Component)
  //          or: const { user } = useAuth()           (Client Component with context)
  const user = MOCK_USER

  // ── Section state ──────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<DashboardSection>('inicio')

  // ── Profile form state ─────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: user.name,
    title: user.title ?? '',
    company: user.company ?? '',
    email: user.email,
    phone: user.phone ?? '',
    whatsapp: user.whatsapp ?? '',
    bio: user.bio ?? '',
    profileImage: user.profileImage ?? '',
    bannerImage: user.bannerImage ?? '',
  })

  // ── Links state ────────────────────────────────────────────────────────────
  const [links, setLinks] = useState<EditableLink[]>(
    (user.links ?? []).map((l) => ({ ...l, icon: normalizeIcon(l.icon) }))
  )

  // ── Status state ───────────────────────────────────────────────────────────
  const [profileStatus, setProfileStatus] = useState<SaveStatus>(INITIAL_STATUS)
  const [linksStatus, setLinksStatus] = useState<SaveStatus>(INITIAL_STATUS)
  const [templateStatus, setTemplateStatus] = useState<SaveStatus>(INITIAL_STATUS)

  // ── Template state ─────────────────────────────────────────────────────────
  const [activeTemplateId, setActiveTemplateId] = useState(
    user.selectedTemplate ?? 'minimal-black'
  )

  // ── Image upload state ─────────────────────────────────────────────────────
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false)
  const [isUploadingBannerImage, setIsUploadingBannerImage] = useState(false)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const bannerImageInputRef = useRef<HTMLInputElement>(null)

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleProfileSave = async () => {
    setProfileStatus({ state: 'saving', message: 'Guardando cambios de perfil...' })
    // Integration point: call your profile update API here.
    //   await updateProfile(profileForm)
    await new Promise((r) => setTimeout(r, 600)) // simulate network delay for UI feedback
    setProfileStatus({ state: 'success', message: 'Perfil actualizado correctamente.' })
  }

  /**
   * Handles image selection for profile and banner images.
   *
   * Integration point — the optional `onUpload` parameter is the hook for
   * a real upload service (e.g. Cloudinary):
   *
   *   const cloudinaryUpload = async (file: File): Promise<string> => {
   *     const formData = new FormData()
   *     formData.append('file', file)
   *     const res = await fetch('/api/uploads/image', { method: 'POST', body: formData })
   *     const { data } = await res.json()
   *     return data.url
   *   }
   *   onImageUpload('profileImage', file, cloudinaryUpload)
   */
  const handleImageUpload = async (
    field: 'profileImage' | 'bannerImage',
    file: File | undefined,
    onUpload?: (file: File) => Promise<string>
  ) => {
    if (!file) return

    if (field === 'profileImage') setIsUploadingProfileImage(true)
    else setIsUploadingBannerImage(true)

    try {
      // Use provided upload handler or fall back to local object URL for preview
      const url = onUpload ? await onUpload(file) : URL.createObjectURL(file)
      setProfileForm((prev) => ({ ...prev, [field]: url }))
      setProfileStatus({
        state: 'success',
        message: 'Imagen lista. Guarda cambios para publicar.',
      })
    } catch {
      setProfileStatus({ state: 'error', message: 'No se pudo procesar la imagen.' })
    } finally {
      if (field === 'profileImage') setIsUploadingProfileImage(false)
      else setIsUploadingBannerImage(false)
    }
  }

  const handleTemplateSelect = async (templateId: string) => {
    setTemplateStatus({ state: 'saving', message: 'Aplicando plantilla...' })
    // Integration point: persist template selection to your backend.
    //   await setTemplate(templateId)
    await new Promise((r) => setTimeout(r, 400))
    setActiveTemplateId(templateId)
    setTemplateStatus({ state: 'success', message: 'Plantilla actualizada.' })
  }

  const updateLink = (id: string, field: 'title' | 'url' | 'icon', value: string) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)))
  }

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  const addLink = () => {
    if (links.length >= 6) return
    setLinks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: '', url: '', icon: 'website' },
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
    // Integration point: sync links to your backend.
    //   await saveLinksToBackend(links)
    await new Promise((r) => setTimeout(r, 600))
    setLinksStatus({ state: 'success', message: 'Botones actualizados correctamente.' })
  }

  const activeTemplate =
    TEMPLATES[activeTemplateId as keyof typeof TEMPLATES] ?? TEMPLATES['minimal-black']

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen animate-in fade-in duration-700 ease-out">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(s) => setActiveSection(s as DashboardSection)}
        userEmail={user.email}
        // Integration point: wire up real logout
        onLogout={() => { /* redirect to / after auth sign-out */ }}
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
              userName={user.name}
              userTitle={user.title}
              selectedTemplate={activeTemplateId}
              activeTemplateName={activeTemplate.name}
              templateStatus={templateStatus}
              onTemplateSelect={handleTemplateSelect}
            />
          )}

        </div>
      </main>
    </div>
  )
}
