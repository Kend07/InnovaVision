import { useState } from "react"
import { Link } from "react-router-dom"
import { useFetch } from "@/hooks/useFetch"
import { obtenerEmpleados, cambiarEstadoEmpleado } from "@/lib/empleados"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EmpleadosPage() {
  usePageTitle("Empleados")
  const [recarga, setRecarga] = useState(0)
  const [errorAccion, setErrorAccion] = useState("")
  const { data: empleados, cargando, error } = useFetch(obtenerEmpleados, [recarga])

  async function cambiarEstado(empleado) {
    const nuevoEstado = !empleado.activo
    if (!window.confirm(`¿Desea ${nuevoEstado ? "activar" : "desactivar"} a ${empleado.usuario?.nombre} ${empleado.usuario?.primerApellido}?`)) return
    setErrorAccion("")
    try {
      await cambiarEstadoEmpleado(empleado.id, nuevoEstado)
      setRecarga((r) => r + 1)
    } catch (err) {
      setErrorAccion(err.response?.data?.message || "No se pudo cambiar el estado del empleado")
    }
  }

  if (cargando) {
    return <p className="p-6 text-muted-foreground">Cargando empleados...</p>
  }

  if (error) {
    return <p className="p-6 text-destructive">{error}</p>
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Empleados</h1>
        <Link to="/empleados/nuevo">
          <Button>Nuevo empleado</Button>
        </Link>
      </div>

      {errorAccion && (
        <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorAccion}</p>
      )}

      {!empleados || empleados.length === 0 ? (
        <p className="text-muted-foreground">No hay empleados registrados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {empleados.map((empleado) => (
            <Card key={empleado.id} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>
                    {empleado.usuario?.nombre} {empleado.usuario?.primerApellido} {empleado.usuario?.segundoApellido}
                  </CardTitle>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      empleado.activo ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {empleado.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Código:</span> {empleado.codigoEmpleado}
                </p>
                <p>
                  <span className="font-semibold">Especialidad:</span> {empleado.especialidad?.nombre}
                </p>
                <p>
                  <span className="font-semibold">Citas asignadas:</span> {empleado._count?.citas ?? 0}
                </p>
                <div className="flex flex-wrap gap-1">
                  {empleado.servicios?.slice(0, 4).map((servicio) => (
                    <span key={servicio.id} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {servicio.nombre}
                    </span>
                  ))}
                  {empleado.servicios?.length > 4 && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      +{empleado.servicios.length - 4}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Link to={`/empleados/${empleado.id}`}>
                    <Button variant="outline" size="sm">Ver detalle</Button>
                  </Link>
                  <Link to={`/empleados/${empleado.id}/editar`}>
                    <Button variant="outline" size="sm">Editar</Button>
                  </Link>
                  <Button variant={empleado.activo ? "destructive" : "secondary"} size="sm" onClick={() => cambiarEstado(empleado)}>
                    {empleado.activo ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}