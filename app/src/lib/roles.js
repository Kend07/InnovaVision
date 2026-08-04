import api from "./api"

export async function obtenerRoles() {
  const response = await api.get("/roles")
  return response.data.data
}