import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useFetch } from "@/hooks/useFetch"
import { obtenerAdicionalPorId, cambiarEstadoAdicional } from "@/lib/adicionales"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function AdicionalDetailPage() {
    const { id } = useParams()
    const { usuario } = useAuth()
    const esAdmin = usuario?.rol?.nombre === "Administrador"
    const [recarga, setRecarga] = useState(0)
    const [errorAccion, setErrorAccion] = useState("")
    const [exitoAccion, setExitoAccion] = useState("")

    const { data: adicional, cargando, error } = useFetch(() => obtenerAdicionalPorId(id), [id, recarga])
    usePageTitle(adicional ? adicional.nombre : null)

    async function handleCambiarEstado() {
        if (!adicional) return
        const nuevoEstado = !adicional.activo
        if (!window.confirm(`¿Desea ${nuevoEstado ? "activar" : "desactivar"} el adicional "${adicional.nombre}"?`)) return
        setErrorAccion("")
        setExitoAccion("")
        try {
            await cambiarEstadoAdicional(adicional.id, nuevoEstado)
            setExitoAccion(`Adicional ${nuevoEstado ? "activado" : "desactivado"} correctamente`)
            setRecarga((r) => r + 1)
        } catch (err) {
            setErrorAccion(err.response?.data?.message || "No se pudo cambiar el estado")
        }
    }

    if (cargando) {
        return <p className="p-6 text-muted-foreground">Cargando adicional...</p>
    }

    if (error) {
        return (
            <div className="p-6">
                <Link to="/adicionales" className="text-sm text-primary underline mb-4 inline-block">
                    &larr; Volver a adicionales
                </Link>
                <p className="text-destructive">{error}</p>
            </div>
        )
    }

    if (!adicional) {
        return <p className="p-6 text-muted-foreground">Adicional no encontrado.</p>
    }

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <Link to="/adicionales" className="text-sm text-primary underline">
                    &larr; Volver a adicionales
                </Link>
                {esAdmin && (
                    <div className="flex gap-2">
                        <Link to={`/adicionales/${adicional.id}/editar`}>
                            <Button variant="outline" size="sm">Editar</Button>
                        </Link>
                        <Button variant={adicional.activo ? "destructive" : "secondary"} size="sm" onClick={handleCambiarEstado}>
                            {adicional.activo ? "Desactivar" : "Activar"}
                        </Button>
                    </div>
                )}
            </div>

            {errorAccion && <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorAccion}</p>}
            {exitoAccion && <p className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">{exitoAccion}</p>}

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="max-w-xl">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-2xl">{adicional.nombre}</CardTitle>
                            <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${adicional.activo ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                                {adicional.activo ? "Activo" : "Inactivo"}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{adicional.descripcion}</p>
                            <p><span className="font-semibold">Precio:</span> ₡{adicional.precio}</p>
                            <p><span className="font-semibold">Estado:</span> {adicional.activo ? "Activo (disponible para nuevas citas)" : "Inactivo (solo historial)"}</p>
                            {adicional.creadoEn && <p className="text-xs text-muted-foreground">Creado: {String(adicional.creadoEn).slice(0, 10)}</p>}
                            {adicional.actualizadoEn && <p className="text-xs text-muted-foreground">Actualizado: {String(adicional.actualizadoEn).slice(0, 10)}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Datos adicionales mínimos</CardTitle>
                        <p className="text-xs text-muted-foreground">Información resumida para trazabilidad</p>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3">
                            <div>
                                <p className="text-xs text-muted-foreground">ID</p>
                                <p className="font-medium">#{adicional.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Activo</p>
                                <p className="font-medium">{adicional.activo ? "Sí" : "No"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Precio</p>
                                <p className="font-medium">₡{adicional.precio}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Citas asociadas</p>
                                <p className="font-medium">{adicional.citas?.length ?? 0}</p>
                            </div>
                        </div>

                        {adicional.citas?.length > 0 ? (
                            <div>
                                <p className="mb-2 text-sm font-semibold">Últimas citas con este adicional</p>
                                <div className="space-y-1">
                                    {adicional.citas.slice(0, 5).map((cita) => (
                                        <div key={cita.id} className="flex items-center justify-between rounded border px-2 py-1.5 text-xs">
                                            <span>
                                                #{cita.id} · {String(cita.fecha).slice(0, 10)} {String(cita.horaInicio).slice(0, 5)} · {cita.servicio?.nombre || "Servicio"} · {cita.cliente?.nombre} {cita.cliente?.primerApellido}
                                            </span>
                                            <Link to={`/citas/${cita.id}`} className="ml-2 shrink-0 text-primary hover:underline">Ver</Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Sin citas asociadas aún.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
