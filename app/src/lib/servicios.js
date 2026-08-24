import api from "./api"

export function obtenerServicios() {
    return api.get("/servicios")
}

export function obtenerServicioPorId(id) {
    return api.get(`/servicios/${id}`)
}

export function crearServicio(datos) {
    return api.post("/servicios", datos)
}