import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-6xl font-bold text-primary">404</p>
            <h1 className="text-2xl font-bold">Página no encontrada</h1>
            <p className="max-w-md text-muted-foreground">
                La página que buscas no existe o fue movida. Verifica la dirección o
                vuelve al inicio.
            </p>
            <Button asChild>
                <Link to="/">Volver al inicio</Link>
            </Button>
        </div>
    )
}