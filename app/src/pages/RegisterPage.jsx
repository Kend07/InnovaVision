import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registroSchema } from "@/lib/schemas"
import { registrarCliente } from "@/lib/auth"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  usePageTitle("Registro de cliente")
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

  function irAtras() {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/")
    }
  }

  function irAdelante() {
    navigate(1)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-4 flex w-full max-w-md justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={irAtras}
          aria-label="Volver a la página anterior"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Atrás
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={irAdelante}
          aria-label="Ir a la página siguiente"
        >
          Adelante
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </div>
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
              <Input
                id="nombre"
                placeholder="María"
                aria-invalid={errors.nombre ? true : undefined}
                aria-describedby={errors.nombre ? "nombre-error" : undefined}
                {...register("nombre")}
              />
              {errors.nombre && <p id="nombre-error" className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="primerApellido">Primer apellido</Label>
              <Input
                id="primerApellido"
                placeholder="López"
                aria-invalid={errors.primerApellido ? true : undefined}
                aria-describedby={errors.primerApellido ? "primerApellido-error" : undefined}
                {...register("primerApellido")}
              />
              {errors.primerApellido && (
                <p id="primerApellido-error" className="text-sm text-destructive">{errors.primerApellido.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="segundoApellido">Segundo apellido (opcional)</Label>
              <Input
                id="segundoApellido"
                placeholder="Mora"
                aria-invalid={errors.segundoApellido ? true : undefined}
                aria-describedby={errors.segundoApellido ? "segundoApellido-error" : undefined}
                {...register("segundoApellido")}
              />
              {errors.segundoApellido && (
                <p id="segundoApellido-error" className="text-sm text-destructive">{errors.segundoApellido.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="maria@example.com"
                aria-invalid={errors.correo ? true : undefined}
                aria-describedby={errors.correo ? "correo-error" : undefined}
                {...register("correo")}
              />
              {errors.correo && <p id="correo-error" className="text-sm text-destructive">{errors.correo.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="telefono">Teléfono (opcional)</Label>
              <Input
                id="telefono"
                placeholder="8888-8888"
                aria-invalid={errors.telefono ? true : undefined}
                aria-describedby={errors.telefono ? "telefono-error" : undefined}
                {...register("telefono")}
              />
              {errors.telefono && <p id="telefono-error" className="text-sm text-destructive">{errors.telefono.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="8+ caracteres con mayúscula, minúscula y número"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
              />
              {errors.password && <p id="password-error" className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                aria-invalid={errors.confirmPassword ? true : undefined}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
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