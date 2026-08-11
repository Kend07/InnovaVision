import api from './api'

export function obtenerAdicionales() {
    return api.get('/servicios-adicionales')
}

export function obtenerAdicionalPorId(id) {
    return api.get(`/servicios-adicionales/${id}`)
}