import { colorEstado, traducirEstado } from "@/lib/citasUtils"
import { cn } from "@/lib/utils"

export default function AppointmentStatusBadge({ estado, className }) {
  const nombre = typeof estado === "string" ? estado : estado?.nombre
  if (!nombre) return null
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorEstado(nombre),
        className
      )}
    >
      {traducirEstado(nombre)}
    </span>
  )
}
