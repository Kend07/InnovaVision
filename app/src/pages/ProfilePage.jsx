import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { obtenerPerfil } from "@/lib/auth"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  usePageTitle("Mi perfil")
  const { usuario } = useAuth()
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    obtenerPerfil()
      .then(setPerfil)
      .catch(() => setPerfil(null))
  }, [])

  const datos = perfil || usuario

  return (
    <>
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      {!datos ? (
        <p className="mt-6 text-sm text-muted-foreground">Cargando perfil...</p>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {datos.nombre} {datos.primerApellido} {datos.segundoApellido}
            </CardTitle>
            <CardDescription>Información obtenida del API (GET /usuarios/perfil)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p>
              <strong>Correo:</strong> {datos.correo}
            </p>
            <p>
              <strong>Teléfono:</strong> {datos.telefono || "—"}
            </p>
            <p>
              <strong>Rol:</strong> {datos.rol?.nombre}
            </p>
            <p>
              <strong>Descripción del rol:</strong> {datos.rol?.descripcion || "—"}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  )
}