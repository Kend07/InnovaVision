import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { crearServicio } from "@/lib/servicios"
import { subirImagen, urlImagen } from "@/lib/images"
import ImageUploadField from "@/components/common/ImageUploadField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const esquemaServicio = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(120),
    descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(500),
    precioBase: z.coerce.number().positive("El precio debe ser mayor a 0"),
    duracionMinutos: z.coerce.number().int().positive("La duración debe ser mayor a 0"),
    especialidadId: z.coerce.number().int().positive("Selecciona una especialidad"),
})

export default function ServicioFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const esEdicion = Boolean(id)

    const [archivoImagen, setArchivoImagen] = useState(null)
    const [enviando, setEnviando] = useState(false)
    const [errorEnvio, setErrorEnvio] = useState(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(esquemaServicio),
    })

    async function alEnviar(datos) {
        setEnviando(true)
        setErrorEnvio(null)
        try {
            let nombreImagen = null

            if (archivoImagen) {
                const respuestaImagen = await subirImagen(archivoImagen)
                nombreImagen = respuestaImagen.data.fileName
            }

            await crearServicio({
                ...datos,
                imagen: nombreImagen,
            })

            navigate("/servicios")
        } catch (error) {
            setErrorEnvio(
                error.response?.data?.message || "Ocurrió un error al guardar el servicio"
            )
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="p-6">
            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>{esEdicion ? "Editar servicio" : "Nuevo servicio"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(alEnviar)} className="space-y-4">
                        <div>
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" {...register("nombre")} />
                            {errors.nombre && (
                                <p className="text-sm text-destructive">{errors.nombre.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Input id="descripcion" {...register("descripcion")} />
                            {errors.descripcion && (
                                <p className="text-sm text-destructive">{errors.descripcion.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="precioBase">Precio base</Label>
                            <Input id="precioBase" type="number" step="0.01" {...register("precioBase")} />
                            {errors.precioBase && (
                                <p className="text-sm text-destructive">{errors.precioBase.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="duracionMinutos">Duración (minutos)</Label>
                            <Input id="duracionMinutos" type="number" {...register("duracionMinutos")} />
                            {errors.duracionMinutos && (
                                <p className="text-sm text-destructive">{errors.duracionMinutos.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="especialidadId">Especialidad (ID)</Label>
                            <Input id="especialidadId" type="number" {...register("especialidadId")} />
                            {errors.especialidadId && (
                                <p className="text-sm text-destructive">{errors.especialidadId.message}</p>
                            )}
                        </div>

                        <ImageUploadField
                            label="Imagen del servicio"
                            onArchivoSeleccionado={setArchivoImagen}
                        />

                        {errorEnvio && <p className="text-sm text-destructive">{errorEnvio}</p>}

                        <div className="flex gap-3">
                            <Button type="submit" disabled={enviando}>
                                {enviando ? "Guardando..." : "Guardar servicio"}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link to="/servicios">volver</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}