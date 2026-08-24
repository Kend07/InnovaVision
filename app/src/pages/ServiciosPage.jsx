import { useState } from "react"
import { useFetch } from "@/hooks/useFetch"
import { obtenerServicios, cambiarEstadoServicio } from "@/lib/servicios"
import { urlImagen } from "@/lib/images"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function ServiciosPage() {
    const { usuario } = useAuth()
    usePageTitle("Servicios")
    const esAdmin = usuario?.rol?.nombre === "Administrador"
    const [recarga, setRecarga] = useState(0)
    const [errorAccion, setErrorAccion] = useState("")
    const [exitoAccion, setExitoAccion] = useState("")
    const { data: servicios, cargando, error } = useFetch(obtenerServicios, [recarga])

    async function handleCambiarEstado(servicio) {
        const nuevoEstado = !servicio.activo
        if (!window.confirm(`¿Desea ${nuevoEstado ? "activar" : "desactivar"} el servicio "${servicio.nombre}"?`)) return
        setErrorAccion("")
        setExitoAccion("")
        try {
            await cambiarEstadoServicio(servicio.id, nuevoEstado)
            setExitoAccion(`Servicio ${nuevoEstado ? "activado" : "desactivado"} correctamente`)
            setRecarga((r) => r + 1)
        } catch (err) {
            setErrorAccion(err.response?.data?.message || "No se pudo cambiar el estado del servicio")
        }
    }

    if (cargando) {
        return <p className="p-6 text-muted-foreground">Cargando servicios...</p>
    }

    if (error) {
        return <p className="p-6 text-destructive">{error}</p>
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Servicios</h1>
                {esAdmin && (
                    <Button asChild>
                        <Link to="/servicios/nuevo">Nuevo servicio</Link>
                    </Button>
                )}
            </div>

            {errorAccion && (
                <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorAccion}</p>
            )}
            {exitoAccion && (
                <p className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">{exitoAccion}</p>
            )}

            {!servicios || servicios.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No hay servicios registrados.</p>
                        {esAdmin && <p className="text-sm text-muted-foreground mt-1">Cree un nuevo servicio para comenzar.</p>}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {servicios.map((servicio) => (
                        <Card key={servicio.id} className="h-full flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-base leading-tight">{servicio.nombre}</CardTitle>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${servicio.activo ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                                        {servicio.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Especialidad: {servicio.especialidad?.nombre || "—"}</p>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col gap-3">
                                {servicio.imagen && (
                                    <img src={urlImagen(servicio.imagen)} alt={servicio.nombre} className="h-32 w-full rounded-md border object-cover" />
                                )}
                                <p className="text-sm text-muted-foreground line-clamp-3">{servicio.descripcion}</p>
                                <div className="mt-auto flex items-center justify-between text-sm">
                                    <span className="font-semibold">₡{servicio.precioBase}</span>
                                    <span className="text-muted-foreground">{servicio.duracionMinutos} min</span>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Link to={`/servicios/${servicio.id}`}>
                                        <Button variant="outline" size="sm">Ver detalle</Button>
                                    </Link>
                                    {esAdmin && (
                                        <>
                                            <Link to={`/servicios/${servicio.id}/editar`}>
                                                <Button variant="outline" size="sm">Editar</Button>
                                            </Link>
                                            <Button variant={servicio.activo ? "destructive" : "secondary"} size="sm" onClick={() => handleCambiarEstado(servicio)}>
                                                {servicio.activo ? "Desactivar" : "Activar"}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
