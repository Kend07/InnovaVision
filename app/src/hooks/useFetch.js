import { useState, useEffect } from "react"

export function useFetch(fetchFn, deps = []) {
    const [estado, setEstado] = useState({
        data: null,
        cargando: true,
        error: null,
    })

    useEffect(() => {
        let activo = true

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEstado((prev) => ({ ...prev, cargando: true, error: null }))

        fetchFn()
            .then((res) => {
                if (activo) {
                    setEstado({ data: res.data.data, cargando: false, error: null })
                }
            })
            .catch((err) => {
                if (activo) {
                    setEstado({
                        data: null,
                        cargando: false,
                        error: err.response?.data?.message || "Ocurrió un error al cargar los datos",
                    })
                }
            })

        return () => {
            activo = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return estado
}