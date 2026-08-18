import { useParams, Link } from "react-router-dom"
import { useFetch } from "@/hooks/useFetch"
import { obtenerAdicionalPorId } from "@/lib/adicionales"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdicionalDetailPage() {
    const { id } = useParams()
    const { data: adicional, cargando, error } = useFetch(
        () => obtenerAdicionalPorId(id),
        [id]
    )
    usePageTitle(adicional ? adicional.nombre : null)

    if (cargando) {
        return <p className="p-6 text-muted-foreground">Cargando adicional...</p>
    }

    if (error) {
        return <p className="p-6 text-destructive">{error}</p>
    }

    if (!adicional) {
        return <p className="p-6 text-muted-foreground">Adicional no encontrado.</p>
    }

    return (
        <div className="p-6">
            <Link to="/adicionales" className="text-sm text-primary underline mb-4 inline-block">
                &larr; Volver a adicionales
            </Link>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">{adicional.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-muted-foreground">{adicional.descripcion}</p>
                    <p><span className="font-semibold">Precio:</span> ₡{adicional.precio}</p>
                    <p><span className="font-semibold">Estado:</span> {adicional.activo ? "Activo" : "Inactivo"}</p>
                </CardContent>
            </Card>
        </div>
    )
}