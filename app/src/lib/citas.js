import api from "./api"

export function obtenerCitas() {
  return api.get("/citas")
}

export function obtenerCitaPorId(id) {
  return api.get(`/citas/${id}`)
}

export function obtenerCitasPorCliente(clienteId) {
  return api.get(`/citas/cliente/${clienteId}`)
}

export function obtenerCitasPorEmpleado(empleadoId) {
  return api.get(`/citas/empleado/${empleadoId}`)
}

export function crearCita(datos) {
  return api.post("/citas", datos)
}

export function actualizarCita(id, datos) {
  return api.put(`/citas/${id}`, datos)
}

export function cancelarCita(id, motivoCancelacion) {
  return api.patch(`/citas/${id}/cancelar`, { motivoCancelacion })
}

export function cambiarEstadoCita(id, estadoCitaId) {
  return api.patch(`/citas/${id}/estado`, { estadoCitaId })
}

export function consultarDisponibilidad(datos) {
  return api.post("/citas/disponibilidad", datos)
}

export function obtenerAgendaEmpleadoPorCita(empleadoId, fecha) {
  return api.get(`/citas/agenda-empleado/${empleadoId}`, { params: { fecha } })
}

export function obtenerAgendaDiaria(fecha) {
  return api.get("/citas/agenda-diaria", { params: { fecha } })
}
