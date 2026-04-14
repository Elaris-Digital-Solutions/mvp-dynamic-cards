export function DashboardInicioSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight">Panel de usuario</h1>
        <p className="mt-1.5 text-muted-foreground text-lg">
          Gestiona tu perfil, enlaces y plantilla desde el menu lateral.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/60 p-4">
          <h3 className="text-2xl font-bold">Perfil</h3>
          <p className="text-muted-foreground mt-1.5 text-base">Actualiza datos profesionales y contacto.</p>
        </div>
        <div className="rounded-xl border border-border/60 p-4">
          <h3 className="text-2xl font-bold">Botones</h3>
          <p className="text-muted-foreground mt-1.5 text-base">Configura enlaces y orden de acciones.</p>
        </div>
        <div className="rounded-xl border border-border/60 p-4">
          <h3 className="text-2xl font-bold">Plantilla</h3>
          <p className="text-muted-foreground mt-1.5 text-base">Elige el estilo visual de tu tarjeta.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 p-4">
        <p className="text-sm tracking-[0.2em] uppercase font-semibold">Siguiente paso</p>
        <p className="text-muted-foreground mt-2 text-base">
          Completa tu perfil y agrega al menos un boton para publicar una tarjeta utilizable.
        </p>
      </div>
    </div>
  )
}
