import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function RequireRole({ rol, children }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  if (usuario?.rol?.nombre !== rol) {
    return <Navigate to="/" replace />
  }

  return children
}