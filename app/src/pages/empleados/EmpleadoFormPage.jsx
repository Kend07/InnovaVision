import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFetch } from "@/hooks/useFetch"
import { empleadoSchema } from "@/lib/schemas"
import {
  crearEmpleado,
  actualizarEmpleado,
  obtenerEmpleadoPorId,
  obtenerUsuariosEmpleados,
  obtenerEspecialidades,
  obtenerServicios,
} from "@/lib/empleados"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EmpleadoFormPage() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const navigate = useNavigate()
  const [errorGeneral, setErrorGeneral] = useState("")
  const [erroresApi, setErroresApi] = useState([])

  const { data: empleado, cargando: cargandoEmpleado } = useFetch(
    () => (esEdicion ? obtenerEmpleadoPorId(id) : Promise.resolve({ data: { data: null } })),
    [id, esEdicion]
  )
  const { data: usuarios, cargando: cargandoUsuarios } = useFetch(obtenerUsuariosEmpleados)
  const { data: especialidades } = useFetch(obtenerEspecialidades)
  const { data: servicios } = useFetch(obtenerServicios)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(empleadoSchema),
    defaultValues: {
      usuarioId: "",
      especialidadId: "",
      codigoEmpleado: "",
      descripcion: "",
      servicioIds: [],
    },
  })

  const especialidadId = watch("especialidadId")
  const serviciosDeEspecialidad = (servicios || []).filter(
    (servicio) => servicio.especialidadId === Number(especialidadId)
  )

  useEffect(() => {
    if (!empleado) return
    setValue("usuarioId", String(empleado.usuarioId))
    setValue("especialidadId", String(empleado.especialidadId))
    setValue("codigoEmpleado", empleado.codigoEmpleado)
    setValue("descripcion", empleado.descripcion || "")
    setValue("servicioIds", empleado.servicios.map((servicio) => servicio.id))
  }, [empleado, setValue])

  const usuariosDisponibles = (usuarios || []).filter(
    (usuario) => !usuario.empleado || usuario.id === empleado?.usuarioId
  )

  function alCambiarEspecialidad(evento) {
    setValue("especialidadId", evento.target.value)
    const serviciosDeNueva = (servicios || []).filter(
      (servicio) => servicio.especialidadId === Number(evento.target.value)
    )
    setValue(
      "servicioIds",
      (watch("servicioIds") || []).filter((servicioId) =>
        serviciosDeNueva.some((servicio) => servicio.id === servicioId)
      )
    )
  }

  async function onSubmit(datos) {
    setErrorGeneral("")
    setErroresApi([])
    const payload = {
      usuarioId: Number(datos.usuarioId),
      especialidadId: Number(datos.especialidadId),
      codigoEmpleado: datos.codigoEmpleado,
      descripcion: datos.descripcion?.trim() ? datos.descripcion : null,
      servicioIds: datos.servicioIds.map(Number),
    }
    try {
      if (esEdicion) {
        await actualizarEmpleado(id, payload)
      } else {
        await crearEmpleado(payload)
      }
      navigate("/empleados")
    } catch (error) {
      const data = error.response?.data
      if (data?.validationErrors?.length) {
        setErroresApi(data.validationErrors.map((item) => `${item.field}: ${item.message}`))
      }
      setErrorGeneral(data?.message || "No se pudo guardar el empleado")
    }
  }

  if (esEdicion && cargandoEmpleado) {
    return <p className="p-6 text-muted-foreground">Cargando empleado...</p>
  }

  if (esEdicion && !empleado) {
    return <p className="p-6 text-muted-foreground">Empleado no encontrado.</p>
  }

  return (
    <div className="p-6">
      <Link to="/empleados" className="mb-4 inline-block text-sm text-primary underline">
        &larr; Volver a empleados
      </Link>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{esEdicion ? "Editar empleado" : "Nuevo empleado"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="flex flex-col gap-4">
            {errorGeneral && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorGeneral}</p>
            )}
            {erroresApi.length > 0 && (
              <ul className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {erroresApi.map((mensaje, index) => (
                  <li key={index}>{mensaje}</li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="usuarioId">Usuario</Label>
              <select
                id="usuarioId"
                className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                {...register("usuarioId")}
              >
                <option value="">Seleccione un usuario</option>
                {cargandoUsuarios && <option disabled>Cargando usuarios...</option>}
                {usuariosDisponibles.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.primerApellido} {usuario.segundoApellido} — {usuario.correo}
                  </option>
                ))}
              </select>
              {errors.usuarioId && <p className="text-sm text-destructive">{errors.usuarioId.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="especialidadId">Especialidad</Label>
              <select
                id="especialidadId"
                className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                {...register("especialidadId")}
                onChange={alCambiarEspecialidad}
              >
                <option value="">Seleccione una especialidad</option>
                {(especialidades || []).map((especialidad) => (
                  <option key={especialidad.id} value={especialidad.id}>
                    {especialidad.nombre}
                  </option>
                ))}
              </select>
              {errors.especialidadId && <p className="text-sm text-destructive">{errors.especialidadId.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="codigoEmpleado">Código de empleado</Label>
              <Input id="codigoEmpleado" placeholder="EMP-001" {...register("codigoEmpleado")} />
              <p className="text-xs text-muted-foreground">Solo letras, números, guiones y guiones bajos.</p>
              {errors.codigoEmpleado && <p className="text-sm text-destructive">{errors.codigoEmpleado.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <textarea
                id="descripcion"
                rows={3}
                className="border-input flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                {...register("descripcion")}
              />
              {errors.descripcion && <p className="text-sm text-destructive">{errors.descripcion.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Servicios que puede realizar</Label>
              {!especialidadId ? (
                <p className="text-sm text-muted-foreground">Seleccione una especialidad para ver sus servicios.</p>
              ) : serviciosDeEspecialidad.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay servicios en esta especialidad.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {serviciosDeEspecialidad.map((servicio) => (
                    <label key={servicio.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                      <input type="checkbox" value={servicio.id} {...register("servicioIds")} />
                      {servicio.nombre}
                    </label>
                  ))}
                </div>
              )}
              {errors.servicioIds && <p className="text-sm text-destructive">{errors.servicioIds.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear empleado"}
            </Button>
            <Link to="/empleados">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}