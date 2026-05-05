import type { ProfileFormState, EditableLink } from '@/types/ui.types'

type Props = {
  profileForm: ProfileFormState
  links: EditableLink[]
}

export function DashboardInicioSection({ profileForm, links }: Props) {
  const isProfileComplete =
    profileForm.firstName.trim() !== '' &&
    profileForm.lastName.trim() !== '' &&
    profileForm.title.trim() !== '' &&
    profileForm.company.trim() !== '' &&
    profileForm.bio.trim() !== ''

  const hasLink = links.length > 0
  const isReady = isProfileComplete && hasLink

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight">Gestión de Identidad</h1>
        <p className="mt-1.5 text-muted-foreground text-lg">
          Configura tu tarjeta digital y mantén tu información actualizada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/60 p-4">
          <h3 className="text-2xl font-bold">Datos personales</h3>
          <p className="text-muted-foreground mt-1.5 text-base">Modifica tu cargo, empresa y bio profesional.</p>
        </div>
        <div className="rounded-xl border border-border/60 p-4">
          <h3 className="text-2xl font-bold">Enlaces y redes</h3>
          <p className="text-muted-foreground mt-1.5 text-base">Añade tus redes sociales, portafolio o WhatsApp.</p>
        </div>
        <div className="rounded-xl border border-border/60 p-4">
          <h3 className="text-2xl font-bold">Plantilla</h3>
          <p className="text-muted-foreground mt-1.5 text-base">Personaliza los colores y el diseño de tu perfil.</p>
        </div>
      </div>

      {isReady ? (
        <div className="rounded-xl border border-green-500/40 bg-green-500/5 p-4">
          <p className="text-sm tracking-[0.2em] uppercase font-semibold text-green-500">Lista</p>
          <p className="text-muted-foreground mt-2 text-base">
            ¡Tu tarjeta está lista para ser compartida!
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 p-4">
          <p className="text-sm tracking-[0.2em] uppercase font-semibold">Siguiente paso</p>
          <p className="text-muted-foreground mt-2 text-base">
            ¡Casi listo! Completa tu perfil y añade un enlace para que tu tarjeta sea funcional.
          </p>
        </div>
      )}
    </div>
  )
}
