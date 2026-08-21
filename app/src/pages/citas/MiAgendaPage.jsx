import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { usePageTitle } from "@/hooks/usePageTitle"
import { obtenerAgendaEmpleadoPorCita } from "@/lib/citas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { hoyISO, formatoHora } from "@/lib/citasUtils"

export default function MiAgendaPage() {
  usePageTitle("Mi agenda")
  const { usuario } = useAuth()
  const rol = usuario?.rol?.nombre
  const empleadoId = usuario?.empleado?.id
  const [fecha, setFecha] = useState(hoyISO())
  const [agenda, setAgenda] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  async function cargar() {
    if (!empleadoId) {
      setError("Su usuario no está vinculado a un empleado")
      setCargando(false)
      return
    }
    setCargando(true)
    setError("")
    try {
      const res = await obtenerAgendaEmpleadoPorCita(empleadoId, fecha)
      setAgenda(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cargar la agenda")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (rol === "Empleado") cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, empleadoId, rol])

  if (rol !== "Empleado") {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Solo los empleados pueden consultar su agenda personal desde esta vista.</AlertDescription>
        </Alert>
        <Link to="/citas" className="mt-4 inline-block">
          <Button variant="outline">Volver a citas</Button>
        </Link>
      </div>
    )
  }

  if (!empleadoId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Su usuario no está vinculado a ningún empleado. Contacte al administrador.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Link to="/citas" className="text-sm text-primary underline mb-4 inline-block">
        &larr; Volver a citas
      </Link>
      <h1 className="text-2xl font-bold">Mi agenda</h1>
      <p className="text-sm text-muted-foreground">Consulta tus citas, restricciones y horario para la fecha seleccionada.</p>

      <Card className="mt-4">
        <CardContent className="pt-6 flex flex-col gap-2 max-w-xs">
          <Label htmlFor="fecha">Fecha</Label>
          <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </CardContent>
      </Card>

      {cargando ? (
        <Skeleton className="h-48 w-full mt-6" />
      ) : error ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !agenda ? (
        <p className="mt-6 text-muted-foreground">Sin datos.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Horario del establecimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {agenda.horarios?.length ? (
                agenda.horarios.map((h, idx) => (
                  <p key={idx}>
                    {h.diaSemana?.nombre || ""} {formatoHora(h.horaInicio)} - {formatoHora(h.horaFin)}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">Cerrado este día.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Restricciones ({agenda.restricciones?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {agenda.restricciones?.length ? (
                agenda.restricciones.map((r) => (
                  <p key={r.id}>
                    {r.todoElDia ? "Todo el día" : `${formatoHora(r.horaInicio)} - ${formatoHora(r.horaFin)}`} · {r.motivo} ({r.tipoRestriccion?.nombre})
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">Sin restricciones.</p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Citas del día ({agenda.citas?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {agenda.citas?.length ? (
                agenda.citas
                  .slice()
                  .sort((a, b) => String(a.horaInicio).localeCompare(String(b.horaInicio)))
                  .map((cita) => (
                    <Link key={cita.id} to={`/citas/${cita.id}`} className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/50">
                      <span>
                        {formatoHora(cita.horaInicio)} - {formatoHora(cita.horaFin)} · {cita.cliente?.nombre} {cita.cliente?.primerApellido} · {cita.servicio?.nombre}
                      </span>
                      <span className="text-xs text-muted-foreground">{cita.estadoCita?.nombre}</span>
                    </Link>
                  ))
              ) : (
                <p className="text-muted-foreground">Sin citas para esta fecha. Horario disponible.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
