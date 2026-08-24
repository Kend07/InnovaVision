import api from './api'

export function obtenerAdicionales() {
    return api.get('/servicios-adicionales')
}

export function obtenerAdicionalesActivos() {
    return api.get('/servicios-adicionales/activos')
}

export function obtenerAdicionalPorId(id) {
    return api.get(`/servicios-adicionales/${id}`)
}

export function crearAdicional(datos) {
    return api.post('/servicios-adicionales', datos)
}

export function actualizarAdicional(id, datos) {
    return api.put(`/servicios-adicionales/${id}`, datos)
}

export function cambiarEstadoAdicional(id, activo) {
    return api.patch(`/servicios-adicionales/${id}/estado`, { activo })
}