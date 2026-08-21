import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AppointmentSummary({ servicio, adicionales = [], duracion, horaInicio, horaFin, costoTotal, costoAdicionales }) {
  const servicioPrecio = Number(servicio?.precioBase || 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Resumen de la cita</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Servicio principal</span>
          <span className="font-medium">{servicio ? `${servicio.nombre} · ₡${servicioPrecio}` : "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Duración total</span>
          <span className="font-medium">{duracion ? `${duracion} min` : "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hora inicio</span>
          <span className="font-medium">{horaInicio || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hora final</span>
          <span className="font-medium">{horaFin || "—"}</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Precio base</span>
          <span>₡{servicioPrecio}</span>
        </div>
        {adicionales.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground pt-1">Adicionales</p>
            {adicionales.map((a) => (
              <div key={a.id} className="flex justify-between text-xs">
                <span>{a.nombre}</span>
                <span>₡{a.precio}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs font-medium">
              <span>Subtotal adicionales</span>
              <span>₡{costoAdicionales ?? 0}</span>
            </div>
          </>
        )}
        <div className="flex justify-between pt-2 font-semibold text-base border-t">
          <span>Costo total</span>
          <span>₡{costoTotal ?? servicioPrecio}</span>
        </div>
        <p className="text-xs text-muted-foreground pt-2">Los adicionales no modifican la duración. Solo afectan el costo.</p>
      </CardContent>
    </Card>
  )
}
