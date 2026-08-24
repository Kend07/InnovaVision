import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { crearAdicional, obtenerAdicionalPorId, actualizarAdicional } from "@/lib/adicionales"
import { useFetch } from "@/hooks/useFetch"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

const esquemaAdicional = z.object({
    nombre: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(120, "Máximo 120 caracteres"),
    descripcion: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres").max(500, "Máximo 500 caracteres"),
    precio: z.coerce.number().min(0, "El precio no puede ser negativo").max(99999999.99, "Precio máximo excedido"),
})

export default function AdicionalFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const esEdicion = Boolean(id)
    usePageTitle(esEdicion ? "Editar adicional" : "Nuevo adicional")

    const [errorGeneral, setErrorGeneral] = useState("")
    const [erroresApi, setErroresApi] = useState([])

    const { data: adicional, cargando: cargandoAdicional } = useFetch(
        () => (esEdicion ? obtenerAdicionalPorId(id) : Promise.resolve({ data: { data: null } })),
        [id, esEdicion]
    )

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(esquemaAdicional),
        defaultValues: {
            nombre: "",
            descripcion: "",
            precio: "",
        },
    })

    useEffect(() => {
        if (!adicional) return
        setValue("nombre", adicional.nombre || "")
        setValue("descripcion", adicional.descripcion || "")
        setValue("precio", adicional.precio ?? "")
    }, [adicional, setValue])

    async function alEnviar(datos) {
        setErrorGeneral("")
        setErroresApi([])
        const payload = {
            nombre: datos.nombre.trim(),
            descripcion: datos.descripcion.trim(),
            precio: Number(datos.precio),
        }
        try {
            if (esEdicion) {
                await actualizarAdicional(id, payload)
            } else {
                await crearAdicional(payload)
            }
            navigate("/adicionales")
        } catch (error) {
            const data = error.response?.data
            if (data?.validationErrors?.length) {
                setErroresApi(data.validationErrors.map((item) => `${item.field}: ${item.message}`))
            }
            setErrorGeneral(data?.message || "Ocurrió un error al guardar el adicional")
        }
    }

    if (esEdicion && cargandoAdicional) {
        return <p className="p-6 text-muted-foreground">Cargando adicional...</p>
    }

    if (esEdicion && !adicional) {
        return <p className="p-6 text-muted-foreground">Adicional no encontrado.</p>
    }

    return (
        <div className="p-6">
            <Link to="/adicionales" className="mb-4 inline-block text-sm text-primary underline">
                &larr; Volver a adicionales
            </Link>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>{esEdicion ? "Editar adicional" : "Nuevo adicional"}</CardTitle>
                    <p className="text-sm text-muted-foreground">Los adicionales aumentan el costo pero no la duración de la cita.</p>
                </CardHeader>
                <form onSubmit={handleSubmit(alEnviar)} noValidate>
                    <CardContent className="flex flex-col gap-4">
                        {errorGeneral && (
                            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorGeneral}</p>
                        )}
                        {erroresApi.length > 0 && (
                            <ul className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {erroresApi.map((msg, idx) => (
                                    <li key={idx}>{msg}</li>
                                ))}
                            </ul>
                        )}

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input id="nombre" placeholder="Lavado especial" aria-invalid={errors.nombre ? true : undefined} aria-describedby={errors.nombre ? "nombre-error" : undefined} {...register("nombre")} />
                            {errors.nombre && <p id="nombre-error" className="text-sm text-destructive">{errors.nombre.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="descripcion">Descripción *</Label>
                            <textarea
                                id="descripcion"
                                rows={3}
                                placeholder="Servicio adicional de lavado especial..."
                                className="border-input flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                aria-invalid={errors.descripcion ? true : undefined}
                                aria-describedby={errors.descripcion ? "descripcion-error" : undefined}
                                {...register("descripcion")}
                            />
                            {errors.descripcion && <p id="descripcion-error" className="text-sm text-destructive">{errors.descripcion.message}</p>}
                            <p className="text-xs text-muted-foreground">10 a 500 caracteres.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="precio">Precio (₡) *</Label>
                            <Input id="precio" type="number" step="0.01" min="0" placeholder="3000" aria-invalid={errors.precio ? true : undefined} {...register("precio")} />
                            {errors.precio && <p className="text-sm text-destructive">{errors.precio.message}</p>}
                            <p className="text-xs text-muted-foreground">Puede ser 0 para adicionales gratuitos. Máx. 99,999,999.99</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear adicional"}
                        </Button>
                        <Link to="/adicionales">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
