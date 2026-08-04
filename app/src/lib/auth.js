import api from "./api"

export async function login(correo, password) {
  const response = await api.post("/usuarios/login", { correo, password })
  return response.data.data.token
}

export async function registrarCliente(datos) {
  const response = await api.post("/usuarios/registro", datos)
  return response.data
}

export async function obtenerPerfil() {
  const response = await api.get("/usuarios/perfil")
  return response.data.data
}