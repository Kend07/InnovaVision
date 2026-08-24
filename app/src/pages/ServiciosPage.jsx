import { useFetch } from "@/hooks/useFetch"
import { obtenerServicios } from "@/lib/servicios"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"


export default function ServiciosPage() {
    const { usuario } = useAuth()
    usePageTitle("Servicios")
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
        <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Servicios</h1>
            {usuario?.rol?.nombre === "Administrador" && (
                <Button asChild>
                    <Link to="/servicios/nuevo">Nuevo servicio</Link>
                </Button>
            )}
        </div>
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