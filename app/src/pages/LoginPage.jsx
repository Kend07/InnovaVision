import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/lib/schemas"
import { useAuth } from "@/context/AuthContext"
import { usePageTitle } from "@/hooks/usePageTitle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  usePageTitle("Iniciar sesión")
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorGeneral, setErrorGeneral] = useState("")
  const registrado = location.state?.registrado

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: "", password: "" },
  })

  async function onSubmit(datos) {
    setErrorGeneral("")
    try {
      await login(datos.correo, datos.password)
      navigate("/", { replace: true })
    } catch (error) {
      setErrorGeneral(error.response?.data?.message || "No se pudo iniciar sesión")
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
            aria-hidden="true"      //IGNORA TECNOLOGIAS DE ASISTENCIA, YA QUE EL TEXTO "ATRÁS" PROPORCIONA EL CONTEXTO NECESARIO
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
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="flex flex-col gap-4">
            {registrado && (
              <p className="rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                Cliente registrado correctamente. Ahora puedes iniciar sesión.
              </p>
            )}
            {errorGeneral && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorGeneral}</p>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="usuario@correo.com"
                aria-invalid={errors.correo ? true : undefined} //DETERMINA SI EL CAMPO ES INVÁLIDO PARA TECNOLOGÍAS DE ASISTENCIA
                aria-describedby={errors.correo ? "correo-error" : undefined} //PROPORCIONA UNA DESCRIPCIÓN DEL ERROR PARA TECNOLOGÍAS DE ASISTENCIA
                {...register("correo")}
              />
              {errors.correo && (
                <p id="correo-error" className="text-sm text-destructive">
                  {errors.correo.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="text-primary underline-offset-4 hover:underline">
                Regístrate como cliente
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}