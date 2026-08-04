import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registroSchema } from "@/lib/schemas"
import { registrarCliente } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [errorGeneral, setErrorGeneral] = useState("")
  const [erroresApi, setErroresApi] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nombre: "",
      primerApellido: "",
      segundoApellido: "",
      correo: "",
      telefono: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(datos) {
    setErrorGeneral("")
    setErroresApi([])
    const { confirmPassword: _ignorado, ...payload } = datos
    try {
      await registrarCliente(payload)
      navigate("/login", { state: { registrado: true } })
    } catch (error) {
      const data = error.response?.data
      if (data?.validationErrors?.length) {
        setErroresApi(data.validationErrors.map((errorItem) => `${errorItem.field}: ${errorItem.message}`))
      }
      setErrorGeneral(data?.message || "No se pudo completar el registro")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registro de cliente</CardTitle>
          <CardDescription>
            Crea tu cuenta como cliente. El rol Cliente es asignado automáticamente por el sistema.
          </CardDescription>
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
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" placeholder="María" {...register("nombre")} />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="primerApellido">Primer apellido</Label>
              <Input id="primerApellido" placeholder="López" {...register("primerApellido")} />
              {errors.primerApellido && <p className="text-sm text-destructive">{errors.primerApellido.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="segundoApellido">Segundo apellido (opcional)</Label>
              <Input id="segundoApellido" placeholder="Mora" {...register("segundoApellido")} />
              {errors.segundoApellido && <p className="text-sm text-destructive">{errors.segundoApellido.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input id="correo" type="email" placeholder="maria@example.com" {...register("correo")} />
              {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="telefono">Teléfono (opcional)</Label>
              <Input id="telefono" placeholder="8888-8888" {...register("telefono")} />
              {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="8+ caracteres con mayúscula, minúscula y número" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}