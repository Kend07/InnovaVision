import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatoHora, formatoFecha } from "@/lib/citasUtils"

export default function EmployeeSchedule({ agenda, fecha }) {
  if (!agenda) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agenda del empleado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Seleccione un empleado y fecha para consultar la agenda.</p>
        </CardContent>
      </Card>
    )
  }

  const horarios = agenda.horarios || []
  const citas = agenda.citas || []
  const restricciones = agenda.restricciones || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Agenda del {formatoFecha(fecha || agenda.fecha)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="font-semibold mb-1">Horario del establecimiento</p>
          {horarios.length ? (
            horarios.map((h, idx) => (
              <p key={idx} className="text-muted-foreground">
                {h.diaSemana?.nombre || ""} {h.horaInicio} - {h.horaFin} {h.activo === false ? "(inactivo)" : ""}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">Cerrado este día.</p>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="font-semibold mb-1">Citas ({citas.length})</p>
            {citas.length ? (
              citas.map((c) => (
                <p key={c.id}>
                  {formatoHora(c.horaInicio)} - {formatoHora(c.horaFin)} · {c.cliente?.nombre} {c.cliente?.primerApellido} · {c.servicio?.nombre} · {c.estadoCita?.nombre}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">Sin citas para esta fecha.</p>
            )}
          </div>
          <div>
            <p className="font-semibold mb-1">Restricciones ({restricciones.length})</p>
            {restricciones.length ? (
              restricciones.map((r) => (
                <p key={r.id}>
                  {r.todoElDia ? "Todo el día" : `${formatoHora(r.horaInicio)} - ${formatoHora(r.horaFin)}`} · {r.motivo}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">Sin restricciones para esta fecha.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
