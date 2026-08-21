import api from "./api"

export function obtenerRestricciones() {
  return api.get("/restricciones-horario")
}

export function obtenerRestriccionPorId(id) {
  return api.get(`/restricciones-horario/${id}`)
}
