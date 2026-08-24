import { useMemo, useState } from "react"
import { useFetch } from "@/hooks/useFetch"
import { obtenerAdicionales, cambiarEstadoAdicional } from "@/lib/adicionales"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function AdicionalesPage() {
    const { usuario } = useAuth()
    usePageTitle("Adicionales")
    const esAdmin = usuario?.rol?.nombre === "Administrador"
    const [recarga, setRecarga] = useState(0)
    const [errorAccion, setErrorAccion] = useState("")
    const [exitoAccion, setExitoAccion] = useState("")
    const [busqueda, setBusqueda] = useState("")
    const [ordenAsc, setOrdenAsc] = useState(true)
    const { data: adicionales, cargando, error } = useFetch(obtenerAdicionales, [recarga])

    const adicionalesFiltrados = useMemo(() => {
        let lista = [...(adicionales || [])]
        if (busqueda.trim()) {
            const q = busqueda.toLowerCase()
            lista = lista.filter((a) => a.nombre.toLowerCase().includes(q) || a.descripcion?.toLowerCase().includes(q))
        }
        lista.sort((a, b) => ordenAsc ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre))
        return lista
    }, [adicionales, busqueda, ordenAsc])

    async function handleCambiarEstado(adicional) {
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
        return <p className="p-6 text-muted-foreground">Cargando adicionales...</p>
    }

    if (error) {
        return <p className="p-6 text-destructive">{error}</p>
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Adicionales</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setOrdenAsc((v) => !v)}>Orden: {ordenAsc ? "A → Z" : "Z → A"}</Button>
                    {esAdmin && (
                        <Button asChild>
                            <Link to="/adicionales/nuevo">Nuevo adicional</Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="mb-4 flex gap-2">
                <input placeholder="Buscar por nombre o descripción" className="border-input flex h-9 w-full max-w-md rounded-md border bg-transparent px-3 py-1 text-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                {busqueda && <Button variant="ghost" onClick={() => setBusqueda("")}>Limpiar</Button>}
            </div>

            {errorAccion && <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorAccion}</p>}
            {exitoAccion && <p className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">{exitoAccion}</p>}

            {!adicionalesFiltrados || adicionalesFiltrados.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">{adicionales?.length ? "Sin resultados para la búsqueda." : "No hay adicionales registrados."}</p>
                        {esAdmin && <p className="text-sm text-muted-foreground mt-1">Cree un adicional para comenzar.</p>}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adicionalesFiltrados.map((adicional) => (
                        <Card key={adicional.id} className="h-full flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-base">{adicional.nombre}</CardTitle>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${adicional.activo ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                                        {adicional.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col gap-3">
                                <p className="text-sm text-muted-foreground line-clamp-3">{adicional.descripcion}</p>
                                <p className="font-semibold">₡{adicional.precio}</p>
                                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                                    <Link to={`/adicionales/${adicional.id}`}>
                                        <Button variant="outline" size="sm">Ver detalle</Button>
                                    </Link>
                                    {esAdmin && (
                                        <>
                                            <Link to={`/adicionales/${adicional.id}/editar`}>
                                                <Button variant="outline" size="sm">Editar</Button>
                                            </Link>
                                            <Button variant={adicional.activo ? "destructive" : "secondary"} size="sm" onClick={() => handleCambiarEstado(adicional)}>
                                                {adicional.activo ? "Desactivar" : "Activar"}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
