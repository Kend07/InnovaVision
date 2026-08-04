import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function cerrarSesion() {
    logout()
    navigate("/login")
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-semibold">
            Gestión de Citas
          </Link>
          <Link to="/perfil" className="text-sm text-muted-foreground hover:text-foreground">
            Mi perfil
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {usuario && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {usuario.nombre} {usuario.primerApellido}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {usuario.rol?.nombre}
              </span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  )
}