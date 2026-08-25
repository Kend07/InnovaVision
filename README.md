# InnovaVision - Gestion de Citas

## Contexto
Proyecto basado en React para un sistema gestion de citas en general. El backend, base de datos y API ya fueron dados. Este repositorio consume la API existente y respeta reglas de negocio definidas en el enunciado. Stack: React 19, React Router 7, Tailwind 4, shadcn/ui new-york, axios, zod, react-hook-form.

## Stack
- Frontend: React 19, Vite 8, Tailwind 4 + @tailwindcss/vite, shadcn/ui, axios, zod
- Backend: Express 5, Prisma 7, MySQL/MariaDB, JWT, Passport, Multer, Winston, Swagger
- Base de datos: MySQL con Prisma, modelos Rol, Usuario, Especialidad, Servicio, ServicioAdicional, Empleado, EstadoCita, DiaSemana, HorarioAtencion, RestriccionHorario, Cita

## Estructura
InnovaVision/
  app/src/          # Frontend (vite root = app)
    components/     # ui, citas, common
    pages/          # Login, Register, Servicios, Adicionales, empleados, citas, Horarios, Restricciones
    lib/            # api.js y servicios por modulo
    layouts/        # MainLayout con Navbar, Breadcrumb, Footer
    context/        # AuthContext
    hooks/
  api/              # Backend Express
    src/            # controllers, services, routes, middlewares, dtos
    prisma/         # schema.prisma, seed.ts, migrations
  vite.config.js    # alias @ -> app/src, proxy /api -> localhost:3000
  components.json   # shadcn new-york

## Requisitos previos
- Node 20+
- MySQL corriendo local
- npm 10+

## Instalacion

### 1. Clonar y dependencias
npm install
cd api && npm install

### 2. Variables de entorno
Crear `api/.env`:
DATABASE_URL="mysql://root:123456@localhost:3306/citas"
JWT_SECRET="citas_utn_2026"
PORT=3000

### 3. Base de datos y seed base
cd api
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
# Usuario admin inicial: admin@citas.com / Admin12345

Para datos demo completos (requeridos por enunciado):
# pendiente seed-demo con 3 empleados, 2 clientes, 3 especialidades, 8 adicionales, horarios y restricciones

## Como correr

### Desarrollo
Terminal 1 - API:
cd api
npm run server   # nodemon en puerto 3000, docs en /api-docs
npm run init si es la primera vez corriendo la API

Terminal 2 - Frontend:
npm run dev      # vite en http://localhost:5173 con proxy /api

### Produccion
npm run build    # genera app/dist
cd api && npm run build && npm start

### Otros scripts
npm run lint            # frontend
npm run preview         # preview vite
api: npm run reset      # migrate reset + seed
api: npm run clean:images

## Features

### Autenticacion y usuarios
- Login con correo y contrasena, logout, registro publico solo Cliente, perfil, control por rol

### Catalogos solo lectura
- Roles, Especialidades, Estados de cita consumidos desde API sin CRUD, badges con color por estado

### Servicios
- Listar grid con imagen miniatura, detalle, crear/editar con zod, preview imagen, upload via POST /images/upload con previousFileName, activar/desactivar con validacion de citas pendientes

### Servicios adicionales
- Listar, detalle, crear/editar, activar/desactivar, seleccion multiple en cita

### Empleados
- Listar con orden A-Z y buscador, detalle con servicios/citas/restricciones, crear/editar con usuario/especialidad/codigo/desc y asignacion servicios filtrada por especialidad, codigo solo letras/numeros/guion, agenda por fecha

### Horarios y restricciones
- Horarios: listado tabla y detalle por id, solo lectura
- Restricciones: listado y detalle, indica si aplica a establecimiento o empleado, consulta automatica en cita

### Citas - proceso principal
- Listado filtrado por rol (Admin todas, Empleado asignadas, Cliente propias), buscador, filtro fecha/estado, orden cronologico
- Crear/editar con seleccion cliente/servicio/adicionales/empleado/fecha/hora, calculo automatico duracion/horaFin/costoTotal, validacion disponibilidad via POST /citas/disponibilidad, EmployeeSchedule y AvailabilityGrid slots 15min, restricciones y citas existentes visibles
- Cancelar con motivo, cambiar estado, bloqueo de edicion si Finalizada o Cancelada, traslapes y horario validado

### Agendas
- Agenda diaria establecimiento solo Admin por fecha con empleados/citas/restricciones, detalle cita desde agenda
- Mi agenda solo Empleado

## Flujos principales

### Flujo gestion de citas
1. Seleccionar cliente
2. Seleccionar servicio principal (muestra precio y duracion)
3. Seleccionar adicionales (recalcula costo)
4. Seleccionar empleado (filtrado por servicio y activo)
5. Seleccionar fecha
6. Mostrar horario establecimiento
7. Mostrar agenda empleado y restricciones y citas del dia
8. Seleccionar hora inicio (solo slots disponibles)
9. Calcular hora fin y validar disponibilidad completa
10. Registrar cita y actualizar agenda

### Flujo servicios
Consultar listado -> crear con imagen -> ver detalle -> editar o activar/desactivar -> usar solo activos en citas

### Flujo empleados
Consultar -> crear con usuario/especialidad/codigo/servicios -> ver detalle y agenda -> editar o activar/desactivar

## Validaciones frontend
- zod en todos los formularios, campos obligatorios con *, mensajes por campo con aria-invalid, bloqueo de doble submit via disabled isSubmitting/guardando, manejo de validationErrors del API, fechas pasadas bloqueadas con min hoyISO, horarios con regex, duplicados mostrados tras error 409

## Matriz de permisos resumida
- Admin: todo excepto registro cliente duplicado
- Empleado: citas asignadas, crear/editar citas, ver servicios/adicionales/horarios/restricciones, mi agenda
- Cliente: solo propias citas, consultar y cancelar si permiteCancelacionCliente

## Acceso demo
- Admin: admin@citas.com / Admin12345
- Empleados y clientes via seed-demo

## Validacion y calidad
- Componentes reutilizables button/card/table/dialog/badge/alert/skeleton
- Servicios dedicados por modulo en lib/
- Layout principal con Navbar adaptativa por rol, Breadcrumb, Footer, skip link a11y, pagina 404
- Loading Skeleton, Alert error, estado vacio Card
- useState, useEffect, props, hooks personalizados useFetch/usePageTitle, Context Auth
