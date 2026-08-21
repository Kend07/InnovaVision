import api from "./api"

export function obtenerEstadosCita() {
  return api.get("/estados-cita")
}

export function obtenerEstadoCitaPorId(id) {
  return api.get(`/estados-cita/${id}`)
}
