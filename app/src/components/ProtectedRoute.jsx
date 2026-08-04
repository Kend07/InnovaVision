import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedRoute({ children }) {
  const { token, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}