import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { usePageTitle } from "@/hooks/usePageTitle"
import { obtenerAgendaDiaria } from "@/lib/citas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AppointmentStatusBadge from "@/components/citas/AppointmentStatusBadge"
import { hoyISO, formatoHora, formatoFecha } from "@/lib/citasUtils"

export default function AgendaDiariaPage() {
  usePageTitle("Agenda diaria")
  const { usuario } = useAuth()
  const rol = usuario?.rol?.nombre
  const esAdmin = rol === "Administrador"

  const [fecha, setFecha] = useState(hoyISO())
  const [agenda, setAgenda] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  async function cargar() {
    setCargando(true)
    setError("")
    try {
      const res = await obtenerAgendaDiaria(fecha)
      setAgenda(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cargar la agenda diaria")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (esAdmin) cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, esAdmin])

  if (!esAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Solo los administradores pueden consultar la agenda diaria completa del establecimiento.</AlertDescription>
        </Alert>
        <Link to="/citas" className="mt-4 inline-block">
          <Button variant="outline">Volver a citas</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Link to="/citas" className="text-sm text-primary underline mb-4 inline-block">
        &larr; Volver a citas
      </Link>
      <h1 className="text-2xl font-bold">Agenda diaria del establecimiento</h1>
      <p className="text-sm text-muted-foreground">Seleccione una fecha para visualizar horarios, empleados, citas y restricciones.</p>

      <Card className="mt-4">
        <CardContent className="pt-6 flex flex-col gap-2 max-w-xs">
          <Label htmlFor="fechaAgenda">Fecha</Label>
          <Input id="fechaAgenda" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          <Button variant="outline" onClick={cargar} disabled={cargando}>
            {cargando ? "Cargando..." : "Actualizar agenda"}
          </Button>
        </CardContent>
      </Card>

      {cargando ? (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !agenda ? (
        <p className="mt-6 text-muted-foreground">Sin datos para esta fecha.</p>
      ) : (
        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Horario general — {formatoFecha(agenda.fecha)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {agenda.horarios?.length ? (
                agenda.horarios.map((h, idx) => (
                  <p key={idx}>
                    {h.diaSemana?.nombre || ""} {formatoHora(h.horaInicio)} - {formatoHora(h.horaFin)}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">El establecimiento no atiende en esta fecha (día inactivo).</p>
              )}
              {agenda.restriccionesGenerales?.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold">Restricciones generales</p>
                  {agenda.restriccionesGenerales.map((r) => (
                    <p key={r.id} className="text-amber-800">
                      {r.todoElDia ? "Todo el día" : `${formatoHora(r.horaInicio)} - ${formatoHora(r.horaFin)}`} · {r.motivo} ({r.tipoRestriccion?.nombre})
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {agenda.empleados?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">No hay empleados activos para esta fecha.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {agenda.empleados.map((empleado) => (
                <Card key={empleado.id} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {empleado.usuario?.nombre} {empleado.usuario?.primerApellido} — {empleado.codigoEmpleado}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {empleado.especialidad?.nombre} · {empleado.servicios?.length || 0} servicios
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold mb-1">Citas del día ({empleado.citas?.length || 0})</p>
                      {empleado.citas?.length ? (
                        <div className="space-y-1">
                          {empleado.citas
                            .slice()
                            .sort((a, b) => String(a.horaInicio).localeCompare(String(b.horaInicio)))
                            .map((cita) => (
                              <Link key={cita.id} to={`/citas/${cita.id}`} className="flex items-center justify-between rounded-md border px-2 py-1 hover:bg-muted/50">
                                <span>
                                  {formatoHora(cita.horaInicio)} - {formatoHora(cita.horaFin)} · {cita.cliente?.nombre} {cita.cliente?.primerApellido} · {cita.servicio?.nombre}
                                </span>
                                <AppointmentStatusBadge estado={cita.estadoCita} className="ml-2 shrink-0" />
                              </Link>
                            ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Sin citas. Horario disponible.</p>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Restricciones ({empleado.restricciones?.length || 0})</p>
                      {empleado.restricciones?.length ? (
                        empleado.restricciones.map((r) => (
                          <p key={r.id} className="text-amber-800 text-xs">
                            {r.todoElDia ? "Todo el día" : `${formatoHora(r.horaInicio)} - ${formatoHora(r.horaFin)}`} · {r.motivo}
                          </p>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-xs">Sin restricciones.</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {empleado.servicios?.slice(0, 3).map((s) => (
                        <span key={s.id} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                          {s.nombre}
                        </span>
                      ))}
                      {empleado.servicios?.length > 3 && <span className="text-xs text-muted-foreground">+{empleado.servicios.length - 3} más</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
