import { useEffect, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, Wrench, PlusCircle, Clock, ShieldAlert, Users, Eye } from "lucide-react"

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    if (!menuAbierto) return
    function cerrarConEscape(evento) {
      if (evento.key === "Escape") {
        setMenuAbierto(false)
      }
    }
    window.addEventListener("keydown", cerrarConEscape)
    return () => window.removeEventListener("keydown", cerrarConEscape)
  }, [menuAbierto])

  function cerrarSesion() {
    setMenuAbierto(false)
    logout()
    navigate("/login")
  }

  const enlaces = [
    { to: "/perfil", texto: "Mi perfil" },
    { to: "/citas", texto: "Citas", icono: Calendar },
    ...(usuario?.rol?.nombre === "Administrador"
      ? [{ to: "/citas/agenda", texto: "Agenda diaria", icono: Calendar }]
      : []),
    ...(usuario?.rol?.nombre === "Empleado"
      ? [{ to: "/citas/mi-agenda", texto: "Mi agenda", icono: Calendar }]
      : []),
    { to: "/servicios", texto: "Servicios", icono: Wrench },
    { to: "/adicionales", texto: "Adicionales", icono: PlusCircle },
    { to: "/horarios", texto: "Horarios", icono: Clock },
    ...(usuario?.rol?.nombre === "Administrador"
      ? [{ to: "/empleados", texto: "Empleados", icono: Users }]
      : []),
    ...(usuario?.rol?.nombre === "Administrador" || usuario?.rol?.nombre === "Empleado"
      ? [{ to: "/restricciones", texto: "Restricciones", icono: ShieldAlert }]
      : []),
  ]

  const claseEnlace = ({ isActive }) =>
    cn(
      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-accent font-medium text-foreground"
        : "text-muted-foreground hover:text-foreground"
    )

  return (
    <header className="border-b bg-card">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={() => setMenuAbierto(false)}
            className="flex items-center gap-2 text-lg font-semibold hover:underline"
          >
            <Eye className="h-5 w-5 text-primary" />
            Gestión de Citas
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            {enlaces.map((enlace) => {
              const Icono = enlace.icono
              return (
                <NavLink key={enlace.to} to={enlace.to} className={claseEnlace}>
                  {Icono && <Icono className="h-4 w-4" />}
                  {enlace.texto}
                </NavLink>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {usuario && (
            <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
              <span>
                {usuario.nombre} {usuario.primerApellido}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {usuario.rol?.nombre}
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-expanded={menuAbierto}
            aria-controls={menuAbierto ? "menu-movil" : undefined}
            aria-label={menuAbierto ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuAbierto ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span>{menuAbierto ? "Cerrar" : "Menú"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={cerrarSesion} className="hidden md:inline-flex">
            Cerrar sesión
          </Button>
        </div>
      </nav>

      {menuAbierto && (
        <div id="menu-movil" className="border-t px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {enlaces.map((enlace) => {
              const Icono = enlace.icono
              return (
                <NavLink
                  key={enlace.to}
                  to={enlace.to}
                  className={claseEnlace}
                  onClick={() => setMenuAbierto(false)}
                >
                  {Icono && <Icono className="h-4 w-4" />}
                  {enlace.texto}
                </NavLink>
              )
            })}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3">
              {usuario && (
                <p className="text-sm text-muted-foreground">
                  {usuario.nombre} {usuario.primerApellido} ·{" "}
                  <span className="font-medium text-foreground">{usuario.rol?.nombre}</span>
                </p>
              )}
              <Button variant="outline" size="sm" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}