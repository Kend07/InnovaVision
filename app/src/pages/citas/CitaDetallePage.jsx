import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { usePageTitle } from "@/hooks/usePageTitle"
import { obtenerCitaPorId, cancelarCita, cambiarEstadoCita } from "@/lib/citas"
import { obtenerEstadosCita } from "@/lib/estadosCita"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import AppointmentStatusBadge from "@/components/citas/AppointmentStatusBadge"
import CancelDialog from "@/components/citas/CancelDialog"
import EstadoCambioDialog from "@/components/citas/EstadoCambioDialog"
import { formatoFecha, formatoHora } from "@/lib/citasUtils"

export default function CitaDetallePage() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const rol = usuario?.rol?.nombre
  const esAdmin = rol === "Administrador"
  const esEmpleado = rol === "Empleado"
  const esCliente = rol === "Cliente"
  const empleadoId = usuario?.empleado?.id

  const [cita, setCita] = useState(null)
  const [estados, setEstados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [errorAccion, setErrorAccion] = useState("")
  const [exito, setExito] = useState("")
  const [showCancel, setShowCancel] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [showEstado, setShowEstado] = useState(false)
  const [cambiando, setCambiando] = useState(false)

  usePageTitle(cita ? `Cita #${cita.id}` : "Detalle de cita")

  async function cargar() {
    setCargando(true)
    setError("")
    try {
      const res = await obtenerCitaPorId(id)
      const data = res.data.data
      // autorización frontend
      if (esEmpleado && data.empleadoId !== empleadoId) {
        setError("No tiene permiso para ver esta cita")
        setCita(null)
        return
      }
      if (esCliente && data.clienteId !== usuario.id) {
        setError("No tiene permiso para ver esta cita")
        setCita(null)
        return
      }
      setCita(data)
      const resEstados = await obtenerEstadosCita()
      setEstados(resEstados.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cargar la cita")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleCancelar(motivo) {
    setCancelando(true)
    setErrorAccion("")
    try {
      await cancelarCita(id, motivo)
      setExito("Cita cancelada correctamente")
      setShowCancel(false)
      await cargar()
    } catch (err) {
      setErrorAccion(err.response?.data?.message || "No se pudo cancelar la cita")
    } finally {
      setCancelando(false)
    }
  }

  async function handleCambiarEstado(nuevoId) {
    setCambiando(true)
    setErrorAccion("")
    try {
      await cambiarEstadoCita(id, nuevoId)
      setExito("Estado actualizado correctamente")
      setShowEstado(false)
      await cargar()
    } catch (err) {
      setErrorAccion(err.response?.data?.message || "No se pudo cambiar el estado")
    } finally {
      setCambiando(false)
    }
  }

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
        <Link to="/citas" className="text-sm text-primary underline mb-4 inline-block">
          &larr; Volver a citas
        </Link>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!cita) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cita no encontrada.</p>
        <Link to="/citas" className="text-sm text-primary underline mt-2 inline-block">
          Volver a citas
        </Link>
      </div>
    )
  }

  const puedeEditar = cita.estadoCita?.permiteEdicion && (esAdmin || esEmpleado)
  const puedeCancelar = cita.estadoCita?.permiteCancelacionCliente && cita.estadoCita?.nombre !== "Cancelada"
  const puedeCambiarEstado = esAdmin || esEmpleado

  return (
    <div className="p-6">
      <Link to="/citas" className="text-sm text-primary underline mb-4 inline-block">
        &larr; Volver a citas
      </Link>

      {errorAccion && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorAccion}</AlertDescription>
        </Alert>
      )}
      {exito && <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">{exito}</div>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Cita #{cita.id}</h1>
          <AppointmentStatusBadge estado={cita.estadoCita} />
        </div>
        <div className="flex gap-2">
          {puedeEditar && (
            <Link to={`/citas/${cita.id}/editar`}>
              <Button variant="outline">Editar</Button>
            </Link>
          )}
          {puedeCancelar && (
            <Button variant="outline" onClick={() => setShowCancel(true)}>
              Cancelar
            </Button>
          )}
          {puedeCambiarEstado && (
            <Button variant="outline" onClick={() => setShowEstado(true)}>
              Cambiar estado
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Fecha:</span> {formatoFecha(cita.fecha)}
            </p>
            <p>
              <span className="font-semibold">Hora:</span> {formatoHora(cita.horaInicio)} - {formatoHora(cita.horaFin)}
            </p>
            <p>
              <span className="font-semibold">Duración:</span> {cita.duracionMinutos} min
            </p>
            <p>
              <span className="font-semibold">Observaciones:</span> {cita.observaciones || "—"}
            </p>
            {cita.motivoCancelacion && (
              <p>
                <span className="font-semibold">Motivo cancelación:</span> {cita.motivoCancelacion}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Costos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Precio servicio:</span> ₡{cita.precioServicio}
            </p>
            <p>
              <span className="font-semibold">Costo adicionales:</span> ₡{cita.costoAdicionales}
            </p>
            <p className="text-base font-semibold">
              Costo total: ₡{cita.costoTotal}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              {cita.cliente?.nombre} {cita.cliente?.primerApellido} {cita.cliente?.segundoApellido}
            </p>
            <p className="text-muted-foreground">{cita.cliente?.correo}</p>
            <p className="text-muted-foreground">{cita.cliente?.telefono || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Empleado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              {cita.empleado?.usuario?.nombre} {cita.empleado?.usuario?.primerApellido} {cita.empleado?.usuario?.segundoApellido}
            </p>
            <p className="text-muted-foreground">Código: {cita.empleado?.codigoEmpleado}</p>
            <p className="text-muted-foreground">Especialidad: {cita.empleado?.especialidad?.nombre}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Servicio principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{cita.servicio?.nombre}</p>
            <p className="text-muted-foreground">{cita.servicio?.descripcion}</p>
            <p>Duración: {cita.servicio?.duracionMinutos} min</p>
            <p>Precio base: ₡{cita.servicio?.precioBase}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adicionales ({cita.adicionales?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {cita.adicionales?.length ? (
              cita.adicionales.map((a) => (
                <p key={a.id} className="flex justify-between">
                  <span>{a.nombre}</span>
                  <span>₡{a.precio}</span>
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">Sin adicionales.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <AppointmentStatusBadge estado={cita.estadoCita} />
            </p>
            <p className="text-muted-foreground">{cita.estadoCita?.descripcion}</p>
            <p>
              <span className="font-semibold">Bloquea disponibilidad:</span> {cita.estadoCita?.bloqueaDisponibilidad ? "Sí" : "No"}
            </p>
            <p>
              <span className="font-semibold">Permite edición:</span> {cita.estadoCita?.permiteEdicion ? "Sí" : "No"}
            </p>
            <p>
              <span className="font-semibold">Permite cancelación:</span> {cita.estadoCita?.permiteCancelacionCliente ? "Sí" : "No"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="font-semibold">Creada por:</span> {cita.creadoPor?.nombre} {cita.creadoPor?.primerApellido}
            </p>
            <p className="text-muted-foreground">{cita.creadoPor?.correo}</p>
          </CardContent>
        </Card>
      </div>

      <CancelDialog open={showCancel} onOpenChange={setShowCancel} onConfirm={handleCancelar} cargando={cancelando} />
      <EstadoCambioDialog
        open={showEstado}
        onOpenChange={setShowEstado}
        estados={estados}
        estadoActualId={cita.estadoCitaId}
        onConfirm={handleCambiarEstado}
        cargando={cambiando}
      />
    </div>
  )
}
