import { cn } from "@/lib/utils"

export default function AvailabilityGrid({ slots = [], horaSeleccionada, onSelect, cargando, error, vacioMensaje }) {
  if (cargando) {
    return <p className="text-sm text-muted-foreground">Cargando disponibilidad...</p>
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }
  if (!slots || slots.length === 0) {
    return <p className="text-sm text-muted-foreground">{vacioMensaje || "Seleccione empleado, servicio y fecha para ver horarios."}</p>
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Mostrando {slots.length} intervalos de {slots[0]?.horaInicio || ""} a {slots[slots.length - 1]?.horaFin || ""}. Verde = disponible, rojo = ocupado, ámbar = restricción.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {slots.map((slot) => {
          const esDisponible = slot.estado === "disponible"
          const esSeleccionado = horaSeleccionada === slot.horaInicio
          return (
            <button
              key={`${slot.horaInicio}-${slot.horaFin}`}
              type="button"
              disabled={!esDisponible}
              onClick={() => esDisponible && onSelect?.(slot.horaInicio)}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-sm text-left transition-colors",
                esDisponible
                  ? esSeleccionado
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-900"
                  : slot.estado === "ocupado"
                    ? "bg-red-50 border-red-200 text-red-800 opacity-70 cursor-not-allowed"
                    : "bg-amber-50 border-amber-200 text-amber-900 opacity-70 cursor-not-allowed"
              )}
              title={slot.motivo || slot.estado}
            >
              <span className="font-medium">
                {slot.horaInicio} - {slot.horaFin}
              </span>
              <span className="text-xs truncate ml-2 max-w-[150px]">
                {slot.estado === "disponible" ? (esSeleccionado ? "Seleccionado" : "Disponible") : slot.estado === "ocupado" ? "Ocupado" : "Restricción"}
              </span>
            </button>
          )
        })}
      </div>
      {slots.filter((s) => s.estado === "disponible").length === 0 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          No hay horarios disponibles para la fecha y empleado seleccionados. Intente con otra fecha o empleado.
        </p>
      )}
    </div>
  )
}
