import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { crearServicio, obtenerServicioPorId, actualizarServicio } from "@/lib/servicios"
import { obtenerEspecialidades } from "@/lib/empleados"
import { subirImagen, urlImagen } from "@/lib/images"
import ImageUploadField from "@/components/common/ImageUploadField"
import { useFetch } from "@/hooks/useFetch"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

const esquemaServicio = z.object({
    nombre: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(120, "Máximo 120 caracteres"),
    descripcion: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres").max(500, "Máximo 500 caracteres"),
    precioBase: z.coerce.number().min(0.01, "El precio debe ser mayor a 0").max(99999999.99, "Precio máximo excedido"),
    duracionMinutos: z.coerce.number().int("Debe ser entero").min(15, "Mínimo 15 minutos").max(480, "Máximo 480 minutos (8 horas)"),
    especialidadId: z.coerce.number().int().positive("Seleccione una especialidad"),
})

export default function ServicioFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const esEdicion = Boolean(id)
    usePageTitle(esEdicion ? "Editar servicio" : "Nuevo servicio")

    const [archivoImagen, setArchivoImagen] = useState(null)
    const [errorGeneral, setErrorGeneral] = useState("")
    const [erroresApi, setErroresApi] = useState([])
    const [errorImagen, setErrorImagen] = useState("")

    const { data: servicio, cargando: cargandoServicio } = useFetch(
        () => (esEdicion ? obtenerServicioPorId(id) : Promise.resolve({ data: { data: null } })),
        [id, esEdicion]
    )
    const { data: especialidades } = useFetch(obtenerEspecialidades)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(esquemaServicio),
        defaultValues: {
            nombre: "",
            descripcion: "",
            precioBase: "",
            duracionMinutos: "",
            especialidadId: "",
        },
    })

    useEffect(() => {
        if (!servicio) return
        setValue("nombre", servicio.nombre || "")
        setValue("descripcion", servicio.descripcion || "")
        setValue("precioBase", servicio.precioBase ?? "")
        setValue("duracionMinutos", servicio.duracionMinutos ?? "")
        setValue("especialidadId", servicio.especialidadId ? String(servicio.especialidadId) : "")
    }, [servicio, setValue])

    async function alEnviar(datos) {
        setErrorGeneral("")
        setErroresApi([])
        setErrorImagen("")
        if (!esEdicion && !archivoImagen) {
            setErrorImagen("La imagen es obligatoria para crear un servicio")
            return
        }
        try {
            let nombreImagen = servicio?.imagen ?? null

            if (archivoImagen) {
                const respuestaImagen = await subirImagen(archivoImagen, esEdicion ? servicio?.imagen : undefined)
                nombreImagen = respuestaImagen.data.fileName
            }

            const payload = {
                nombre: datos.nombre.trim(),
                descripcion: datos.descripcion.trim(),
                precioBase: Number(datos.precioBase),
                duracionMinutos: Number(datos.duracionMinutos),
                especialidadId: Number(datos.especialidadId),
                imagen: nombreImagen,
            }

            if (esEdicion) {
                await actualizarServicio(id, payload)
            } else {
                // crear: si no hay imagen, enviar null (API default)
                await crearServicio(payload)
            }

            navigate("/servicios")
        } catch (error) {
            const data = error.response?.data
            if (data?.validationErrors?.length) {
                setErroresApi(data.validationErrors.map((item) => `${item.field}: ${item.message}`))
            }
            setErrorGeneral(data?.message || "Ocurrió un error al guardar el servicio")
        }
    }

    if (esEdicion && cargandoServicio) {
        return <p className="p-6 text-muted-foreground">Cargando servicio...</p>
    }

    if (esEdicion && !servicio) {
        return <p className="p-6 text-muted-foreground">Servicio no encontrado.</p>
    }

    const previewInicial = servicio?.imagen ? urlImagen(servicio.imagen) : null

    return (
        <div className="p-6">
            <Link to="/servicios" className="mb-4 inline-block text-sm text-primary underline">
                &larr; Volver a servicios
            </Link>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>{esEdicion ? "Editar servicio" : "Nuevo servicio"}</CardTitle>
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
                            <Input id="nombre" placeholder="Corte de cabello" aria-invalid={errors.nombre ? true : undefined} aria-describedby={errors.nombre ? "nombre-error" : undefined} {...register("nombre")} />
                            {errors.nombre && <p id="nombre-error" className="text-sm text-destructive">{errors.nombre.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="descripcion">Descripción *</Label>
                            <textarea
                                id="descripcion"
                                rows={3}
                                placeholder="Servicio profesional de corte de cabello..."
                                className="border-input flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                aria-invalid={errors.descripcion ? true : undefined}
                                aria-describedby={errors.descripcion ? "descripcion-error" : undefined}
                                {...register("descripcion")}
                            />
                            {errors.descripcion && <p id="descripcion-error" className="text-sm text-destructive">{errors.descripcion.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="precioBase">Precio base (₡) *</Label>
                                <Input id="precioBase" type="number" step="0.01" min="0" placeholder="8000" aria-invalid={errors.precioBase ? true : undefined} {...register("precioBase")} />
                                {errors.precioBase && <p className="text-sm text-destructive">{errors.precioBase.message}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="duracionMinutos">Duración (minutos) *</Label>
                                <Input id="duracionMinutos" type="number" min="15" max="480" placeholder="45" aria-invalid={errors.duracionMinutos ? true : undefined} {...register("duracionMinutos")} />
                                {errors.duracionMinutos && <p className="text-sm text-destructive">{errors.duracionMinutos.message}</p>}
                                <p className="text-xs text-muted-foreground">Mín. 15, máx. 480</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="especialidadId">Especialidad *</Label>
                            <select
                                id="especialidadId"
                                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                aria-invalid={errors.especialidadId ? true : undefined}
                                aria-describedby={errors.especialidadId ? "especialidadId-error" : undefined}
                                {...register("especialidadId")}
                            >
                                <option value="">Seleccione una especialidad</option>
                                {(especialidades || []).map((esp) => (
                                    <option key={esp.id} value={esp.id}>
                                        {esp.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.especialidadId && <p id="especialidadId-error" className="text-sm text-destructive">{errors.especialidadId.message}</p>}
                        </div>

                        <ImageUploadField label={esEdicion ? "Imagen del servicio (opcional, deja la actual si no cambias)" : "Imagen del servicio *"} previewUrlInicial={previewInicial} onArchivoSeleccionado={(f) => { setArchivoImagen(f); setErrorImagen("") }} errorExterno={errorImagen} />
                        <p className="text-xs text-muted-foreground">Formatos: JPG, PNG, WEBP. Máx. 2MB. {esEdicion ? "Si no selecciona nueva imagen, se conserva la actual." : "Obligatoria al crear."}</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear servicio"}
                        </Button>
                        <Link to="/servicios">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
