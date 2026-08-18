import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useFetch } from "@/hooks/useFetch"
import { obtenerEmpleadoPorId, obtenerAgendaEmpleado } from "@/lib/empleados"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function formatearFecha(fecha) {
  return fecha ? String(fecha).slice(0, 10) : "—"
}

function formatearHora(hora) {
  return hora ? String(hora).slice(0, 5) : "—"
}

export default function EmpleadoDetallePage() {
  const { id } = useParams()
  const hoy = new Date()
  const fechaLocal = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const [fechaAgenda, setFechaAgenda] = useState(fechaLocal)

  const { data: empleado, cargando, error } = useFetch(() => obtenerEmpleadoPorId(id), [id])
  usePageTitle(empleado ? `${empleado.usuario?.nombre} ${empleado.usuario?.primerApellido}` : null)
  const { data: agenda, cargando: cargandoAgenda } = useFetch(
    () => obtenerAgendaEmpleado(id, fechaAgenda),
    [id, fechaAgenda]
  )

  if (cargando) {
    return <p className="p-6 text-muted-foreground">Cargando empleado...</p>
  }

  if (error) {
    return <p className="p-6 text-destructive">{error}</p>
  }

  if (!empleado) {
    return <p className="p-6 text-muted-foreground">Empleado no encontrado.</p>
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/empleados" className="text-sm text-primary underline">
          &larr; Volver a empleados
        </Link>
        <Link to={`/empleados/${empleado.id}/editar`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
      </div>

      <h1 className="mb-1 text-2xl font-bold">
        {empleado.usuario?.nombre} {empleado.usuario?.primerApellido} {empleado.usuario?.segundoApellido}
      </h1>
      <p className="mb-6 text-muted-foreground">
        Código {empleado.codigoEmpleado} —{" "}
        <span className={empleado.activo ? "font-medium text-green-700" : "font-medium text-destructive"}>
          {empleado.activo ? "Activo" : "Inactivo"}
        </span>
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-semibold">Correo:</span> {empleado.usuario?.correo}</p>
            <p><span className="font-semibold">Teléfono:</span> {empleado.usuario?.telefono || "—"}</p>
            <p><span className="font-semibold">Especialidad:</span> {empleado.especialidad?.nombre}</p>
            <p><span className="font-semibold">Descripción:</span> {empleado.descripcion || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servicios que puede realizar ({empleado.servicios?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {empleado.servicios?.length ? (
              empleado.servicios.map((servicio) => (
                <span key={servicio.id} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  {servicio.nombre}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin servicios asignados.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Citas asignadas ({empleado.citas?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {empleado.citas?.length ? (
              empleado.citas.map((cita) => (
                <p key={cita.id}>
                  {formatearFecha(cita.fecha)} {formatearHora(cita.horaInicio)} — {cita.cliente?.nombre}{" "}
                  {cita.cliente?.primerApellido} · {cita.servicio?.nombre} · {cita.estadoCita?.nombre}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">Sin citas asignadas.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restricciones registradas ({empleado.restricciones?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {empleado.restricciones?.length ? (
              empleado.restricciones.map((restriccion) => (
                <p key={restriccion.id}>
                  {formatearFecha(restriccion.fecha)}{" "}
                  {restriccion.todoElDia
                    ? "· Todo el día"
                    : `· ${formatearHora(restriccion.horaInicio)} - ${formatearHora(restriccion.horaFin)}`}{" "}
                  — {restriccion.motivo}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">Sin restricciones registradas.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Agenda del empleado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex max-w-xs flex-col gap-2">
            <Label htmlFor="fechaAgenda">Fecha</Label>
            <Input id="fechaAgenda" type="date" value={fechaAgenda} onChange={(e) => setFechaAgenda(e.target.value)} />
          </div>
          {cargandoAgenda ? (
            <p className="text-sm text-muted-foreground">Cargando agenda...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold">Citas del día</p>
                {agenda?.citas?.length ? (
                  agenda.citas.map((cita) => (
                    <p key={cita.id} className="text-sm">
                      {formatearHora(cita.horaInicio)} — {cita.cliente?.nombre} {cita.cliente?.primerApellido} ·{" "}
                      {cita.servicio?.nombre} · {cita.estadoCita?.nombre}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin citas para esta fecha.</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Restricciones del día</p>
                {agenda?.restricciones?.length ? (
                  agenda.restricciones.map((restriccion) => (
                    <p key={restriccion.id} className="text-sm">
                      {restriccion.todoElDia
                        ? "Todo el día"
                        : `${formatearHora(restriccion.horaInicio)} - ${formatearHora(restriccion.horaFin)}`}{" "}
                      · {restriccion.tipoRestriccion?.nombre} · {restriccion.motivo}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin restricciones para esta fecha.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}