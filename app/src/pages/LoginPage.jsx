import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/lib/schemas"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
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
              <Input id="correo" type="email" placeholder="usuario@correo.com" {...register("correo")} />
              {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
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