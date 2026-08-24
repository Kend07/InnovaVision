import { useMemo, useState } from "react"
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
  const [exitoAccion, setExitoAccion] = useState("")
  const [ordenAsc, setOrdenAsc] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const { data: empleados, cargando, error } = useFetch(obtenerEmpleados, [recarga])

  const empleadosFiltrados = useMemo(() => {
    let lista = [...(empleados || [])]
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter((e) => `${e.usuario?.nombre} ${e.usuario?.primerApellido} ${e.codigoEmpleado}`.toLowerCase().includes(q) || e.especialidad?.nombre?.toLowerCase().includes(q))
    }
    lista.sort((a, b) => {
      const fa = `${a.usuario?.nombre} ${a.usuario?.primerApellido}`.toLowerCase()
      const fb = `${b.usuario?.nombre} ${b.usuario?.primerApellido}`.toLowerCase()
      return ordenAsc ? fa.localeCompare(fb) : fb.localeCompare(fa)
    })
    return lista
  }, [empleados, busqueda, ordenAsc])

  async function cambiarEstado(empleado) {
    const nuevoEstado = !empleado.activo
    if (!window.confirm(`¿Desea ${nuevoEstado ? "activar" : "desactivar"} a ${empleado.usuario?.nombre} ${empleado.usuario?.primerApellido}?`)) return
    setErrorAccion("")
    setExitoAccion("")
    try {
      await cambiarEstadoEmpleado(empleado.id, nuevoEstado)
      setExitoAccion(`Empleado ${nuevoEstado ? "activado" : "desactivado"} correctamente`)
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Empleados</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOrdenAsc((v) => !v)}>Orden: {ordenAsc ? "A → Z" : "Z → A"}</Button>
          <Link to="/empleados/nuevo">
            <Button>Nuevo empleado</Button>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <input placeholder="Buscar por nombre, código o especialidad" className="border-input flex h-9 w-full max-w-md rounded-md border bg-transparent px-3 py-1 text-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        {busqueda && <Button variant="ghost" onClick={() => setBusqueda("")}>Limpiar</Button>}
      </div>

      {errorAccion && (
        <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorAccion}</p>
      )}
      {exitoAccion && <p className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">{exitoAccion}</p>}

      {!empleadosFiltrados || empleadosFiltrados.length === 0 ? (
        <p className="text-muted-foreground">{empleados?.length ? "Sin resultados para la búsqueda." : "No hay empleados registrados."}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {empleadosFiltrados.map((empleado) => (
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