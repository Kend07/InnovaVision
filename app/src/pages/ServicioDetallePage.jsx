import { useParams, Link } from "react-router-dom"
import { useFetch } from "@/hooks/useFetch"
import { obtenerServicioPorId } from "@/lib/servicios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ServicioDetallePage() {
    const { id } = useParams()
    const { data: servicio, cargando, error } = useFetch(
        () => obtenerServicioPorId(id),
        [id]
    )

    if (cargando) {
        return <p className="p-6 text-muted-foreground">Cargando servicio...</p>
    }

    if (error) {
        return <p className="p-6 text-destructive">{error}</p>
    }

    if (!servicio) {
        return <p className="p-6 text-muted-foreground">Servicio no encontrado.</p>
    }

    return (
        <div className="p-6">
            <Link to="/servicios" className="text-sm text-primary underline mb-4 inline-block">
                &larr; Volver a servicios
            </Link>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">{servicio.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-muted-foreground">{servicio.descripcion}</p>
                    <p><span className="font-semibold">Precio:</span> ₡{servicio.precioBase}</p>
                    <p><span className="font-semibold">Duración:</span> {servicio.duracionMinutos} min</p>
                    <p><span className="font-semibold">Estado:</span> {servicio.activo ? "Activo" : "Inactivo"}</p>
                    <p><span className="font-semibold">Especialidad:</span> {servicio.especialidad?.nombre}</p>
                </CardContent>
            </Card>
        </div>
    )
}