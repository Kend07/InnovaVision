import { useEffect } from "react"

export function usePageTitle(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | Gestión de Citas` : "Gestión de Citas"
  }, [titulo])
}
