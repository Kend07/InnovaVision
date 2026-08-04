import { createContext, useContext, useEffect, useState } from "react"
import { login as loginApi, obtenerPerfil } from "@/lib/auth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(() => Boolean(localStorage.getItem("token")))

  useEffect(() => {
    if (!token) return

    let cancelado = false
    obtenerPerfil()
      .then((perfil) => {
        if (!cancelado) setUsuario(perfil)
      })
      .catch(() => {
        if (cancelado) return
        setToken(null)
        localStorage.removeItem("token")
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [token])

  async function login(correo, password) {
    const nuevoToken = await loginApi(correo, password)
    localStorage.setItem("token", nuevoToken)
    setToken(nuevoToken)
    const perfil = await obtenerPerfil()
    setUsuario(perfil)
    return perfil
  }

  function logout() {
    localStorage.removeItem("token")
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ token, usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}