import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { usePageTitle } from "@/hooks/usePageTitle"
import {
  obtenerCitas,
  obtenerCitasPorCliente,
  obtenerCitasPorEmpleado,
  cancelarCita,
  cambiarEstadoCita,
} from "@/lib/citas"
import { obtenerEstadosCita } from "@/lib/estadosCita"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AppointmentStatusBadge from "@/components/citas/AppointmentStatusBadge"
import CancelDialog from "@/components/citas/CancelDialog"
import EstadoCambioDialog from "@/components/citas/EstadoCambioDialog"
import { formatoFecha, formatoHora } from "@/lib/citasUtils"

function puedeEditar(cita) {
  return cita?.estadoCita?.permiteEdicion === true
}
function puedeCancelar(cita) {
  return cita?.estadoCita?.permiteCancelacionCliente === true && cita?.estadoCita?.nombre !== "Cancelada"
}

export default function CitasPage() {
  usePageTitle("Citas")
  const { usuario } = useAuth()
  const rol = usuario?.rol?.nombre
  const esAdmin = rol === "Administrador"
  const esEmpleado = rol === "Empleado"
  const esCliente = rol === "Cliente"
  const empleadoId = usuario?.empleado?.id

  const [citas, setCitas] = useState([])
  const [estados, setEstados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [ordenAsc, setOrdenAsc] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [citaCancelar, setCitaCancelar] = useState(null)
  const [cancelando, setCancelando] = useState(false)
  const [errorAccion, setErrorAccion] = useState("")
  const [exitoAccion, setExitoAccion] = useState("")
  const [citaEstado, setCitaEstado] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  async function cargar() {
    setCargando(true)
    setError("")
    try {
      let data = []
      if (esAdmin) {
        const res = await obtenerCitas()
        data = res.data.data
      } else if (esEmpleado) {
        if (!empleadoId) {
          throw new Error("Su usuario no está vinculado a un empleado")
        }
        const res = await obtenerCitasPorEmpleado(empleadoId)
        data = res.data.data
      } else if (esCliente) {
        const res = await obtenerCitasPorCliente(usuario.id)
        data = res.data.data
      }
      setCitas(Array.isArray(data) ? data : [])
      const resEstados = await obtenerEstadosCita()
      setEstados(resEstados.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || "No se pudieron cargar las citas")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol, empleadoId, usuario?.id])

  const citasFiltradas = useMemo(() => {
    let lista = [...citas]
    if (filtroEstado) {
      lista = lista.filter((c) => String(c.estadoCitaId) === String(filtroEstado) || c.estadoCita?.nombre === filtroEstado)
    }
    if (filtroFecha) {
      lista = lista.filter((c) => String(c.fecha).slice(0, 10) === filtroFecha)
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter(
        (c) =>
          `${c.cliente?.nombre} ${c.cliente?.primerApellido}`.toLowerCase().includes(q) ||
          `${c.empleado?.usuario?.nombre} ${c.empleado?.usuario?.primerApellido}`.toLowerCase().includes(q) ||
          c.servicio?.nombre?.toLowerCase().includes(q) ||
          String(c.id).includes(q)
      )
    }
    lista.sort((a, b) => {
      const fa = `${a.fecha} ${a.horaInicio}`
      const fb = `${b.fecha} ${b.horaInicio}`
      if (fa === fb) return 0
      return ordenAsc ? fa.localeCompare(fb) : fb.localeCompare(fa)
    })
    return lista
  }, [citas, filtroEstado, filtroFecha, ordenAsc, busqueda])

  async function handleCancelar(motivo) {
    if (!citaCancelar) return
    setCancelando(true)
    setErrorAccion("")
    setExitoAccion("")
    try {
      await cancelarCita(citaCancelar.id, motivo)
      setExitoAccion("Cita cancelada correctamente")
      setCitaCancelar(null)
      await cargar()
    } catch (err) {
      setErrorAccion(err.response?.data?.message || "No se pudo cancelar la cita")
    } finally {
      setCancelando(false)
    }
  }

  async function handleCambiarEstado(nuevoEstadoId) {
    if (!citaEstado) return
    setCambiandoEstado(true)
    setErrorAccion("")
    setExitoAccion("")
    try {
      await cambiarEstadoCita(citaEstado.id, nuevoEstadoId)
      setExitoAccion("Estado actualizado correctamente")
      setCitaEstado(null)
      await cargar()
    } catch (err) {
      setErrorAccion(err.response?.data?.message || "No se pudo cambiar el estado")
    } finally {
      setCambiandoEstado(false)
    }
  }

  const puedeCrear = esAdmin || esEmpleado

  if (cargando) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={cargar}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Citas</h1>
          <p className="text-sm text-muted-foreground">
            {esAdmin && "Listado completo de citas del establecimiento."}
            {esEmpleado && "Tus citas asignadas."}
            {esCliente && "Tus citas registradas."}
          </p>
        </div>
        <div className="flex gap-2">
          {puedeCrear && (
            <Link to="/citas/nueva">
              <Button>Nueva cita</Button>
            </Link>
          )}
          {esAdmin && (
            <Link to="/citas/agenda">
              <Button variant="outline">Agenda diaria</Button>
            </Link>
          )}
          {esEmpleado && (
            <Link to="/citas/mi-agenda">
              <Button variant="outline">Mi agenda</Button>
            </Link>
          )}
        </div>
      </div>

      {errorAccion && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorAccion}</AlertDescription>
        </Alert>
      )}
      {exitoAccion && (
        <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">{exitoAccion}</div>
      )}

      <Card className="mb-4">
        <CardContent className="pt-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="busqueda" className="text-sm font-medium">
              Buscar
            </label>
            <input
              id="busqueda"
              placeholder="Cliente, empleado, servicio o ID"
              className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="filtroFecha" className="text-sm font-medium">
              Fecha
            </label>
            <input
              id="filtroFecha"
              type="date"
              className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="filtroEstado" className="text-sm font-medium">
              Estado
            </label>
            <select
              id="filtroEstado"
              className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              {estados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={() => setOrdenAsc((v) => !v)} className="shrink-0">
            Orden: {ordenAsc ? "Más antiguas primero" : "Más recientes primero"}
          </Button>
          {(filtroEstado || filtroFecha || busqueda) && (
            <Button
              variant="ghost"
              onClick={() => {
                setFiltroEstado("")
                setFiltroFecha("")
                setBusqueda("")
              }}
            >
              Limpiar
            </Button>
          )}
        </CardContent>
      </Card>

      {citasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No hay citas registradas.</p>
            <p className="text-sm text-muted-foreground mt-1">
              {puedeCrear ? "Cree una nueva cita para comenzar." : "Cuando se registren citas, aparecerán aquí."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listado ({citasFiltradas.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citasFiltradas.map((cita) => (
                    <TableRow key={cita.id}>
                      <TableCell>{formatoFecha(cita.fecha)}</TableCell>
                      <TableCell>
                        {formatoHora(cita.horaInicio)} - {formatoHora(cita.horaFin)}
                      </TableCell>
                      <TableCell>
                        {cita.cliente?.nombre} {cita.cliente?.primerApellido}
                      </TableCell>
                      <TableCell>
                        {cita.empleado?.usuario?.nombre} {cita.empleado?.usuario?.primerApellido}
                      </TableCell>
                      <TableCell>{cita.servicio?.nombre}</TableCell>
                      <TableCell>
                        <AppointmentStatusBadge estado={cita.estadoCita} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 flex-wrap">
                          <Link to={`/citas/${cita.id}`}>
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                          </Link>
                          {puedeEditar(cita) && (esAdmin || esEmpleado) && (
                            <Link to={`/citas/${cita.id}/editar`}>
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                            </Link>
                          )}
                          {puedeCancelar(cita) && (
                            <Button variant="outline" size="sm" onClick={() => setCitaCancelar(cita)}>
                              Cancelar
                            </Button>
                          )}
                          {(esAdmin || esEmpleado) && (
                            <Button variant="ghost" size="sm" onClick={() => setCitaEstado(cita)}>
                              Estado
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <CancelDialog open={!!citaCancelar} onOpenChange={(o) => !o && setCitaCancelar(null)} onConfirm={handleCancelar} cargando={cancelando} />
      <EstadoCambioDialog
        open={!!citaEstado}
        onOpenChange={(o) => !o && setCitaEstado(null)}
        estados={estados}
        estadoActualId={citaEstado?.estadoCitaId}
        onConfirm={handleCambiarEstado}
        cargando={cambiandoEstado}
      />
    </div>
  )
}
