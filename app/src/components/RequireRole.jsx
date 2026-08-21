import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function RequireRole({ rol, roles, children }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  const permitidos = roles || (rol ? [rol] : [])
  // si no se especifican roles, permite a cualquier autenticado
  if (permitidos.length === 0) return children

  if (!permitidos.includes(usuario?.rol?.nombre)) {
    return <Navigate to="/" replace />
  }

  return children
}

export function RequireAnyRole({ roles, children }) {
  return <RequireRole roles={roles}>{children}</RequireRole>
}