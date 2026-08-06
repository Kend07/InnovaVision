import { useFetch } from "@/hooks/useFetch"
import { obtenerServicios } from "@/lib/servicios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"


export default function ServiciosPage() {
    const { data: servicios, cargando, error } = useFetch(obtenerServicios)

    if (cargando) {
        return <p className="p-6 text-muted-foreground">Cargando servicios...</p>
    }

    if (error) {
        return <p className="p-6 text-destructive">{error}</p>
    }

    if (!servicios || servicios.length === 0) {
        return <p className="p-6 text-muted-foreground">No hay servicios registrados.</p>
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Servicios</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {servicios.map((servicio) => (
                    <Link key={servicio.id} to={`/servicios/${servicio.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle>{servicio.nombre}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-2">{servicio.descripcion}</p>
                                <p className="font-semibold">₡{servicio.precioBase}</p>
                                <p className="text-sm">{servicio.duracionMinutos} min</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}