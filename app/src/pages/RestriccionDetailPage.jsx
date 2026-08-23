import { useParams, Link } from "react-router-dom"
import { useFetch } from "@/hooks/useFetch"
import { obtenerRestriccionPorId } from "@/lib/restricciones"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RestriccionDetallePage() {
    const { id } = useParams()
    const { data: restriccion, cargando, error } = useFetch(
        () => obtenerRestriccionPorId(id),
        [id]
    )

    if (cargando) {
        return <p className="p-6 text-muted-foreground">Cargando restricción...</p>
    }

    if (error) {
        return <p className="p-6 text-destructive">{error}</p>
    }

    if (!restriccion) {
        return <p className="p-6 text-muted-foreground">Restricción no encontrada.</p>
    }

    function formatearHora(horaTexto) {
        if (!horaTexto) return "—"
        const [horas, minutos] = horaTexto.split(":")
        const horaNum = parseInt(horas, 10)
        const periodo = horaNum >= 12 ? "p.m." : "a.m."
        const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12
        return `${hora12}:${minutos} ${periodo}`
    }

    const horario = restriccion.todoElDia
        ? "Todo el día"
        : `${formatearHora(restriccion.horaInicio)} - ${formatearHora(restriccion.horaFin)}`

    const aplicaA = restriccion.empleadoId
        ? restriccion.empleado?.usuario?.nombre || "Empleado"
        : "Todo el establecimiento"

    return (
        <div className="p-6">
            <Link to="/restricciones" className="text-sm text-primary underline mb-4 inline-block">
                &larr; Volver a restricciones
            </Link>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">{restriccion.tipoRestriccion?.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>
                        <span className="font-semibold">Fecha:</span>{" "}
                        {new Date(restriccion.fecha).toLocaleDateString("es-CR")}
                    </p>
                    <p><span className="font-semibold">Aplica a:</span> {aplicaA}</p>
                    <p><span className="font-semibold">Horario:</span> {horario}</p>
                    <p><span className="font-semibold">Motivo:</span> {restriccion.motivo}</p>
                    <p><span className="font-semibold">Estado:</span> {restriccion.activo ? "Activa" : "Inactiva"}</p>
                </CardContent>
            </Card>
        </div>
    )
}