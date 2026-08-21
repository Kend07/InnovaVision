export function hoyISO() {
  const hoy = new Date()
  const local = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export function minutosDesdeHora(hora) {
  if (!hora) return 0
  const [h, m] = String(hora).slice(0, 5).split(":").map(Number)
  return h * 60 + m
}

export function horaDesdeMinutos(minutos) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function sumarMinutosAHora(horaInicio, duracionMinutos) {
  const total = minutosDesdeHora(horaInicio) + Number(duracionMinutos || 0)
  return horaDesdeMinutos(total)
}

export function calcularCostoTotal(precioServicio, adicionales = []) {
  const precio = Number(precioServicio || 0)
  const suma = adicionales.reduce((acc, a) => acc + Number(a.precio || 0), 0)
  return precio + suma
}

export function calcularCostoAdicionales(adicionales = []) {
  return adicionales.reduce((acc, a) => acc + Number(a.precio || 0), 0)
}

export function intervalosSeTraslapan(inicioA, finA, inicioB, finB) {
  const aI = minutosDesdeHora(inicioA)
  const aF = minutosDesdeHora(finA)
  const bI = minutosDesdeHora(inicioB)
  const bF = minutosDesdeHora(finB)
  return aI < bF && aF > bI
}

export function estaDentroDeHorario(horaInicio, horaFin, horariosDelDia) {
  if (!horariosDelDia || horariosDelDia.length === 0) return false
  const i = minutosDesdeHora(horaInicio)
  const f = minutosDesdeHora(horaFin)
  return horariosDelDia.some((h) => {
    const hi = minutosDesdeHora(h.horaInicio)
    const hf = minutosDesdeHora(h.horaFin)
    return i >= hi && f <= hf
  })
}

export function coincideConRestriccion(horaInicio, horaFin, restricciones) {
  if (!restricciones || restricciones.length === 0) return null
  const i = minutosDesdeHora(horaInicio)
  const f = minutosDesdeHora(horaFin)
  for (const r of restricciones) {
    if (r.todoElDia) return r
    if (!r.horaInicio || !r.horaFin) continue
    const ri = minutosDesdeHora(r.horaInicio)
    const rf = minutosDesdeHora(r.horaFin)
    if (i < rf && f > ri) return r
  }
  return null
}

export function generarSlotsDisponibles({ horariosDelDia, restricciones, citas, duracionMinutos, pasoMinutos = 15 }) {
  if (!horariosDelDia || horariosDelDia.length === 0) return []
  if (!duracionMinutos || duracionMinutos <= 0) return []

  const slots = []
  for (const horario of horariosDelDia) {
    const inicio = minutosDesdeHora(horario.horaInicio)
    const fin = minutosDesdeHora(horario.horaFin)
    for (let cursor = inicio; cursor + duracionMinutos <= fin; cursor += pasoMinutos) {
      const hInicio = horaDesdeMinutos(cursor)
      const hFin = horaDesdeMinutos(cursor + duracionMinutos)
      const restriccion = coincideConRestriccion(hInicio, hFin, restricciones)
      const cita = (citas || []).find((c) => intervalosSeTraslapan(hInicio, hFin, c.horaInicio, c.horaFin))
      let estado = "disponible"
      let motivo = ""
      if (restriccion) {
        estado = "restringido"
        motivo = restriccion.motivo || "Restricción"
      } else if (cita) {
        estado = "ocupado"
        motivo = `${cita.cliente?.nombre || ""} ${cita.cliente?.primerApellido || ""}`.trim() + ` · ${cita.servicio?.nombre || ""}`
      }
      slots.push({ horaInicio: hInicio, horaFin: hFin, estado, motivo, cita, restriccion })
    }
  }
  // ordenar
  slots.sort((a, b) => minutosDesdeHora(a.horaInicio) - minutosDesdeHora(b.horaInicio))
  return slots
}

export function traducirEstado(nombre) {
  const map = {
    Pendiente: "Pendiente",
    Confirmada: "Confirmada",
    "En proceso": "En proceso",
    Finalizada: "Finalizada",
    Cancelada: "Cancelada",
  }
  return map[nombre] || nombre
}

export function colorEstado(nombre) {
  const map = {
    Pendiente: "bg-amber-100 text-amber-800 border-amber-200",
    Confirmada: "bg-emerald-100 text-emerald-800 border-emerald-200",
    "En proceso": "bg-blue-100 text-blue-800 border-blue-200",
    Finalizada: "bg-zinc-200 text-zinc-700 border-zinc-300",
    Cancelada: "bg-red-100 text-red-700 border-red-200",
  }
  return map[nombre] || "bg-secondary text-secondary-foreground"
}

export function formatoFecha(fecha) {
  if (!fecha) return "—"
  return String(fecha).slice(0, 10)
}

export function formatoHora(hora) {
  if (!hora) return "—"
  return String(hora).slice(0, 5)
}

export function esFechaPasada(fechaISO) {
  if (!fechaISO) return true
  const hoy = hoyISO()
  return fechaISO < hoy
}

export function obtenerDiaSemanaNumero(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d))
  const js = utc.getUTCDay()
  return js === 0 ? 7 : js
}

export const ESTADOS_BLOQUEAN = ["Pendiente", "Confirmada", "En proceso"]
export const ESTADOS_NO_BLOQUEAN = ["Cancelada", "Finalizada"]
