export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">Gestión de Citas · InnovaVision</p>
            <p className="text-xs">Sistema de gestión de citas — React + Tailwind + shadcn/ui</p>
          </div>
          <div className="text-xs">
            <p>© {new Date().getFullYear()} Proyecto académico</p>
            <p>API: <span className="font-mono">/api</span> · Acceso por roles: Administrador / Empleado / Cliente</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
