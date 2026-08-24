import { Link } from "react-router-dom"
import { useFetch } from "@/hooks/useFetch"
import { obtenerHorarios } from "@/lib/horarios"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table"

export default function HorariosPage() {
    const { data: horarios, cargando, error } = useFetch(obtenerHorarios)

    if (cargando) {
        return <p className="p-6 text-muted-foreground">Cargando horarios...</p>
    }

    if (error) {
        return <p className="p-6 text-destructive">{error}</p>
    }

    if (!horarios || horarios.length === 0) {
        return <p className="p-6 text-muted-foreground">No hay horarios registrados.</p>
    }

    function formatearHora(horaTexto) {
        if (!horaTexto) return "—"
        const [horas, minutos] = horaTexto.split(":")
        const horaNum = parseInt(horas, 10)
        const periodo = horaNum >= 12 ? "p.m." : "a.m."
        const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12
        return `${hora12}:${minutos} ${periodo}`
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Horarios de atención</h1>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Día</TableHead>
                            <TableHead>Hora inicio</TableHead>
                            <TableHead>Hora fin</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {horarios.map((horario) => (
                            <TableRow key={horario.id}>
                                <TableCell>{horario.diaSemana?.nombre}</TableCell>
                                <TableCell>{formatearHora(horario.horaInicio)}</TableCell>
                                <TableCell>{formatearHora(horario.horaFin)}</TableCell>
                                <TableCell>{horario.activo ? "Activo" : "Inactivo"}</TableCell>
                                <TableCell className="text-right">
                                    <Link to={`/horarios/${horario.id}`}>
                                        <Button variant="outline" size="sm">Ver detalle</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}