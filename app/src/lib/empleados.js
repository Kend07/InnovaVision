import api from "./api"

export function obtenerEmpleados() {
    return api.get("/empleados")
}

export function obtenerEmpleadoPorId(id) {
    return api.get(`/empleados/${id}`)
}

export function crearEmpleado(datos) {
    return api.post("/empleados", datos)
}

export function actualizarEmpleado(id, datos) {
    return api.put(`/empleados/${id}`, datos)
}

export function cambiarEstadoEmpleado(id, activo) {
    return api.patch(`/empleados/${id}/estado`, { activo })
}

export function obtenerAgendaEmpleado(id, fecha) {
    return api.get(`/empleados/${id}/agenda`, { params: { fecha } })
}

export function obtenerUsuariosEmpleados() {
    return api.get("/usuarios", { params: { rol: "Empleado" } })
}

export function obtenerEspecialidades() {
    return api.get("/especialidades")
}

export function obtenerServicios() {
    return api.get("/servicios")
}