import { z } from "zod"

const emailSchema = z
  .string()
  .trim()
  .email("El correo electrónico no tiene un formato válido")

const nombreSchema = z
  .string()
  .trim()
  .min(2, "Debe contener al menos 2 caracteres")
  .max(100, "No puede superar 100 caracteres")

const segundoApellidoSchema = z
  .union([
    z
      .string()
      .trim()
      .min(2, "Debe contener al menos 2 caracteres")
      .max(100, "No puede superar 100 caracteres"),
    z.literal(""),
  ])
  .optional()

const telefonoSchema = z
  .union([
    z
      .string()
      .trim()
      .min(8, "El teléfono debe contener al menos 8 caracteres")
      .max(25, "El teléfono no puede superar 25 caracteres")
      .regex(/^[0-9+\-()\s]+$/, "El teléfono contiene caracteres no permitidos"),
    z.literal(""),
  ])
  .optional()

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(100, "La contraseña no puede superar 100 caracteres")
  .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "La contraseña debe contener al menos un número")

export const loginSchema = z.object({
  correo: emailSchema,
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .max(100, "La contraseña no puede superar 100 caracteres"),
})

export const registroSchema = z
  .object({
    nombre: nombreSchema,
    primerApellido: nombreSchema,
    segundoApellido: segundoApellidoSchema,
    correo: emailSchema,
    telefono: telefonoSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

  export const empleadoSchema = z
  .object({
    usuarioId: z.coerce.number().int().positive("Seleccione un usuario"),
    especialidadId: z.coerce.number().int().positive("Seleccione una especialidad"),
    codigoEmpleado: z
      .string()
      .trim()
      .min(3, "El código debe contener al menos 3 caracteres")
      .max(30, "El código no puede superar 30 caracteres")
      .regex(/^[A-Za-z0-9_-]+$/, "El código solo puede contener letras, números, guiones y guiones bajos"),
    descripcion: z
      .union([
        z
          .string()
          .trim()
          .min(3, "La descripción debe contener al menos 3 caracteres")
          .max(500, "La descripción no puede superar 500 caracteres"),
        z.literal(""),
      ])
      .optional(),
    servicioIds: z.array(z.coerce.number().int().positive()).min(1, "Debe asignar al menos un servicio"),
  })