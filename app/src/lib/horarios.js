import api from './api'

export function obtenerHorarios() {
  return api.get('/horarios-atencion')
}