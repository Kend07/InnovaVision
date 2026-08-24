import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useFetch } from "@/hooks/useFetch"
import { obtenerServicioPorId, cambiarEstadoServicio } from "@/lib/servicios"
import { urlImagen } from "@/lib/images"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function ServicioDetallePage() {
    const { id } = useParams()
    const { usuario } = useAuth()
    const esAdmin = usuario?.rol?.nombre === "Administrador"
    const [recarga, setRecarga] = useState(0)
    const [errorAccion, setErrorAccion] = useState("")
    const [exitoAccion, setExitoAccion] = useState("")

    const { data: servicio, cargando, error } = useFetch(() => obtenerServicioPorId(id), [id, recarga])
    usePageTitle(servicio ? servicio.nombre : null)

    async function handleCambiarEstado() {
        if (!servicio) return
        const nuevoEstado = !servicio.activo
        if (!window.confirm(`¿Desea ${nuevoEstado ? "activar" : "desactivar"} el servicio "${servicio.nombre}"?`)) return
        setErrorAccion("")
        setExitoAccion("")
        try {
            await cambiarEstadoServicio(servicio.id, nuevoEstado)
            setExitoAccion(`Servicio ${nuevoEstado ? "activado" : "desactivado"} correctamente`)
            setRecarga((r) => r + 1)
        } catch (err) {
            setErrorAccion(err.response?.data?.message || "No se pudo cambiar el estado")
        }
    }

    if (cargando) {
        return <p className="p-6 text-muted-foreground">Cargando servicio...</p>
    }

    if (error) {
        return (
            <div className="p-6">
                <Link to="/servicios" className="text-sm text-primary underline mb-4 inline-block">
                    &larr; Volver a servicios
                </Link>
                <p className="text-destructive">{error}</p>
            </div>
        )
    }

    if (!servicio) {
        return <p className="p-6 text-muted-foreground">Servicio no encontrado.</p>
    }

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <Link to="/servicios" className="text-sm text-primary underline">
                    &larr; Volver a servicios
                </Link>
                {esAdmin && (
                    <div className="flex gap-2">
                        <Link to={`/servicios/${servicio.id}/editar`}>
                            <Button variant="outline" size="sm">Editar</Button>
                        </Link>
                        <Button variant={servicio.activo ? "destructive" : "secondary"} size="sm" onClick={handleCambiarEstado}>
                            {servicio.activo ? "Desactivar" : "Activar"}
                        </Button>
                    </div>
                )}
            </div>

            {errorAccion && <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorAccion}</p>}
            {exitoAccion && <p className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">{exitoAccion}</p>}

            <Card className="max-w-2xl">
                <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-2xl">{servicio.nombre}</CardTitle>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${servicio.activo ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                            {servicio.activo ? "Activo" : "Inactivo"}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {servicio.imagen ? (
                        <img src={urlImagen(servicio.imagen)} alt={servicio.nombre} className="h-64 w-full rounded-md border object-cover" />
                    ) : (
                        <div className="flex h-32 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">Sin imagen</div>
                    )}
                    <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">{servicio.descripcion}</p>
                        <p><span className="font-semibold">Precio:</span> ₡{servicio.precioBase}</p>
                        <p><span className="font-semibold">Duración:</span> {servicio.duracionMinutos} min</p>
                        <p><span className="font-semibold">Especialidad:</span> {servicio.especialidad?.nombre || "—"}</p>
                        <p><span className="font-semibold">Estado:</span> {servicio.activo ? "Activo" : "Inactivo"}</p>
                    </div>

                    {servicio.empleados?.length > 0 && (
                        <div>
                            <p className="mb-2 text-sm font-semibold">Empleados que realizan este servicio ({servicio.empleados.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {servicio.empleados.slice(0, 8).map((emp) => (
                                    <span key={emp.id} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                                        {emp.usuario?.nombre} {emp.usuario?.primerApellido} — {emp.codigoEmpleado}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {servicio.citas?.length > 0 && (
                        <div>
                            <p className="mb-1 text-sm font-semibold">Citas recientes ({servicio.citas.slice(0, 5).length})</p>
                            <div className="space-y-1 text-xs text-muted-foreground">
                                {servicio.citas.slice(0, 5).map((cita) => (
                                    <div key={cita.id} className="flex justify-between rounded border px-2 py-1">
                                        <span>{String(cita.fecha).slice(0, 10)} {String(cita.horaInicio).slice(0, 5)} — {cita.estadoCita?.nombre}</span>
                                        <Link to={`/citas/${cita.id}`} className="text-primary hover:underline">Ver</Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
