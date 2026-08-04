import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { obtenerRoles } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const OPCIONES_POR_ROL = {
  Administrador: [
    { titulo: "Gestión de usuarios", descripcion: "Consultar y administrar los usuarios del sistema." },
    { titulo: "Gestión de servicios", descripcion: "Administrar los servicios ofrecidos." },
    { titulo: "Gestión de empleados", descripcion: "Administrar los empleados del establecimiento." },
  ],
  Empleado: [{ titulo: "Mis citas asignadas", descripcion: "Consultar y atender las citas asignadas." }],
  Cliente: [
    { titulo: "Registrar cita", descripcion: "Agendar una nueva cita." },
    { titulo: "Mis citas", descripcion: "Consultar y cancelar mis citas." },
  ],
}

export default function HomePage() {
  const { usuario } = useAuth()
  const [roles, setRoles] = useState([])

  useEffect(() => {
    obtenerRoles()
      .then(setRoles)
      .catch(() => setRoles([]))
  }, [])

  const opciones = OPCIONES_POR_ROL[usuario?.rol?.nombre] || []

  return (
    <>
      <h1 className="text-2xl font-bold">Bienvenido, {usuario?.nombre}</h1>
      <p className="mt-1 text-muted-foreground">
        Rol: <span className="font-medium text-foreground">{usuario?.rol?.nombre}</span> — estas son las opciones
        disponibles para ti.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {opciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay opciones disponibles para tu rol.</p>
        ) : (
          opciones.map((opcion) => (
            <Card key={opcion.titulo}>
              <CardHeader>
                <CardTitle>{opcion.titulo}</CardTitle>
                <CardDescription>{opcion.descripcion}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled>Próximamente</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Roles del sistema</CardTitle>
          <CardDescription>Obtenidos desde el API (GET /roles). Módulo Consulta de Roles.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No se encontraron roles.</p>
          ) : (
            roles.map((rol) => (
              <span key={rol.id} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                {rol.nombre}
              </span>
            ))
          )}
        </CardContent>
      </Card>
    </>
  )
}