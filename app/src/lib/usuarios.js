import api from "./api"

export function obtenerUsuarios(params = {}) {
  return api.get("/usuarios", { params })
}

export function obtenerUsuariosPorRol(rol) {
  return api.get("/usuarios", { params: { rol } })
}

export function obtenerClientes() {
  return api.get("/usuarios", { params: { rol: "Cliente" } })
}

export function obtenerUsuarioPorId(id) {
  return api.get(`/usuarios/${id}`)
}
