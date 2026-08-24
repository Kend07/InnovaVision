import { Link, useParams } from "react-router-dom"
import { useFetch } from "@/hooks/useFetch"
import { obtenerHorarioPorId } from "@/lib/horarios"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function formatearHora(h) {
  if (!h) return "—"
  const [hh, mm] = String(h).split(":")
  const n = parseInt(hh, 10)
  const p = n >= 12 ? "p.m." : "a.m."
  const h12 = n % 12 === 0 ? 12 : n % 12
  return `${h12}:${mm} ${p}`
}

export default function HorarioDetailPage() {
  const { id } = useParams()
  const { data: horario, cargando, error } = useFetch(() => obtenerHorarioPorId(id), [id])
  usePageTitle(horario ? `Horario ${horario.diaSemana?.nombre}` : "Detalle horario")

  if (cargando) return <p className="p-6 text-muted-foreground">Cargando horario...</p>
  if (error) return <p className="p-6 text-destructive">{error}</p>
  if (!horario) return <p className="p-6 text-muted-foreground">Horario no encontrado.</p>

  return (
    <div className="p-6">
      <Link to="/horarios" className="mb-4 inline-block text-sm text-primary underline">&larr; Volver a horarios</Link>
      <h1 className="text-2xl font-bold mb-6">Detalle de horario</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{horario.diaSemana?.nombre} {horario.diaSemana?.numeroOrden ? `· Día ${horario.diaSemana.numeroOrden}` : ""}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-semibold">Día:</span> {horario.diaSemana?.nombre || `ID ${horario.diaSemanaId}`}</p>
          <p><span className="font-semibold">Hora inicio:</span> {formatearHora(horario.horaInicio)}</p>
          <p><span className="font-semibold">Hora fin:</span> {formatearHora(horario.horaFin)}</p>
          <p><span className="font-semibold">Estado:</span> <span className={horario.activo ? "text-green-700 font-medium" : "text-destructive font-medium"}>{horario.activo ? "Activo" : "Inactivo"}</span></p>
          {horario.diaSemana && (
            <p className="text-muted-foreground pt-2">Este horario corresponde al horario general del establecimiento y es compartido por todos los empleados. Las variaciones solo aplican vía restricciones.</p>
          )}
        </CardContent>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">Los horarios no son editables desde el FrontEnd según especificación.</p>
    </div>
  )
}
