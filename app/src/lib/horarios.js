import api from './api'

export function obtenerHorarios() {
  return api.get('/horarios-atencion')
}

export function obtenerHorarioPorId(id) {
  return api.get(`/horarios-atencion/${id}`)
}