import api from "./api"

export function obtenerServicios() {
    return api.get("/servicios")
}

export function obtenerServiciosActivos() {
    return api.get("/servicios/activos")
}

export function obtenerServicioPorId(id) {
    return api.get(`/servicios/${id}`)
}

export function crearServicio(datos) {
    return api.post("/servicios", datos)
}

export function actualizarServicio(id, datos) {
    return api.put(`/servicios/${id}`, datos)
}

export function cambiarEstadoServicio(id, activo) {
    return api.patch(`/servicios/${id}/estado`, { activo })
}