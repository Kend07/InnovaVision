import { Link } from "react-router-dom"
import { useFetch } from "@/hooks/useFetch"
import { obtenerRestricciones } from "@/lib/restricciones"
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table"

export default function RestriccionesPage() {
    const { data: restricciones, cargando, error } = useFetch(obtenerRestricciones)

    if (cargando) {
        return <p className="p-6 text-muted-foreground">Cargando restricciones...</p>
    }

    if (error) {
        return <p className="p-6 text-destructive">{error}</p>
    }

    if (!restricciones || restricciones.length === 0) {
        return <p className="p-6 text-muted-foreground">No hay restricciones registradas.</p>
    }

    function formatearHora(horaTexto) {
        if (!horaTexto) return "—"
        const [horas, minutos] = horaTexto.split(":")
        const horaNum = parseInt(horas, 10)
        const periodo = horaNum >= 12 ? "p.m." : "a.m."
        const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12
        return `${hora12}:${minutos} ${periodo}`
    }

    function formatearHorario(restriccion) {
        if (restriccion.todoElDia) return "Todo el día"
        return `${formatearHora(restriccion.horaInicio)} - ${formatearHora(restriccion.horaFin)}`
    }

    function formatearFecha(fechaISO) {
        return new Date(fechaISO).toLocaleDateString("es-CR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Restricciones de horario</h1>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Aplica a</TableHead>
                            <TableHead>Horario</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {restricciones.map((restriccion) => (
                            <TableRow key={restriccion.id} className="hover:bg-accent">
                                <TableCell>
                                    <Link to={`/restricciones/${restriccion.id}`} className="hover:underline">
                                        {formatearFecha(restriccion.fecha)}
                                    </Link>
                                </TableCell>
                                <TableCell>{restriccion.tipoRestriccion?.nombre}</TableCell>
                                <TableCell>
                                    {restriccion.empleadoId
                                        ? restriccion.empleado?.usuario?.nombre || "Empleado"
                                        : "Todo el establecimiento"}
                                </TableCell>
                                <TableCell>{formatearHorario(restriccion)}</TableCell>
                                <TableCell>{restriccion.motivo}</TableCell>
                                <TableCell>{restriccion.activo ? "Activa" : "Inactiva"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}