import { useFetch } from "@/hooks/useFetch";
import { obtenerAdicionales } from "@/lib/adicionales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"


export default function AdicionalesPage() {
    const { data: adicionales, cargando, error } = useFetch(obtenerAdicionales)

    if (cargando) {
        return <p className="p-6 text-muted-foreground">Cargando adicionales...</p>
    }

    if (error) {
        return <p className="p-6 text-destructive">{error}</p>
    }

    if (!adicionales || adicionales.length === 0) {
        return <p className="p-6 text-muted-foreground">No hay adicionales registrados.</p>
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Adicionales</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {adicionales.map((adicional) => (
                    <Link key={adicional.id} to={`/adicionales/${adicional.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle>{adicional.nombre}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-2">{adicional.descripcion}</p>
                                <p className="font-semibold">₡{adicional.precio}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}