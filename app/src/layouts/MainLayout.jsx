import { useEffect, useRef } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Navbar from "@/components/Navbar"

export default function MainLayout() {
  const location = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    mainRef.current?.focus()
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-muted/40">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main
        id="contenido-principal"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto max-w-5xl p-6 outline-none"
      >
        <Outlet />
      </main>
    </div>
  )
}
