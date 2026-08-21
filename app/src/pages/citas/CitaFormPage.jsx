import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { usePageTitle } from "@/hooks/usePageTitle"
import {
  obtenerCitaPorId,
  crearCita,
  actualizarCita,
  consultarDisponibilidad,
  obtenerAgendaEmpleadoPorCita,
} from "@/lib/citas"
import { obtenerServicios } from "@/lib/servicios"
import { obtenerAdicionales } from "@/lib/adicionales"
import { obtenerEmpleados } from "@/lib/empleados"
import { obtenerEstadosCita } from "@/lib/estadosCita"
import { obtenerClientes } from "@/lib/usuarios"
import { obtenerHorarios } from "@/lib/horarios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AppointmentSummary from "@/components/citas/AppointmentSummary"
import AvailabilityGrid from "@/components/citas/AvailabilityGrid"
import EmployeeSchedule from "@/components/citas/EmployeeSchedule"
import { hoyISO, sumarMinutosAHora, generarSlotsDisponibles, esFechaPasada } from "@/lib/citasUtils"

export default function CitaFormPage() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const rol = usuario?.rol?.nombre

  usePageTitle(esEdicion ? "Editar cita" : "Nueva cita")

  // catálogos
  const [clientes, setClientes] = useState([])
  const [servicios, setServicios] = useState([])
  const [adicionalesCatalogo, setAdicionalesCatalogo] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [estados, setEstados] = useState([])
  const [horariosGenerales, setHorariosGenerales] = useState([])

  const [cargandoCatalogos, setCargandoCatalogos] = useState(true)
  const [errorCatalogos, setErrorCatalogos] = useState("")

  // cita existente
  const [citaExistente, setCitaExistente] = useState(null)
  const [cargandoCita, setCargandoCita] = useState(esEdicion)

  // formulario state
  const [clienteId, setClienteId] = useState("")
  const [servicioId, setServicioId] = useState("")
  const [adicionalIds, setAdicionalIds] = useState([])
  const [empleadoId, setEmpleadoId] = useState("")
  const [fecha, setFecha] = useState(hoyISO())
  const [horaInicio, setHoraInicio] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [estadoCitaId, setEstadoCitaId] = useState("")

  // validaciones visibles
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState("")
  const [erroresApi, setErroresApi] = useState([])
  const [guardando, setGuardando] = useState(false)

  // agenda y disponibilidad
  const [agenda, setAgenda] = useState(null)
  const [cargandoAgenda, setCargandoAgenda] = useState(false)
  const [errorAgenda, setErrorAgenda] = useState("")
  const [disponibilidad, setDisponibilidad] = useState(null) // {disponible, motivo}
  const [verificandoDisp, setVerificandoDisp] = useState(false)

  // cargar catálogos
  useEffect(() => {
    let activo = true
    async function cargar() {
      setCargandoCatalogos(true)
      setErrorCatalogos("")
      try {
        const [resClientes, resServicios, resAdicionales, resEmpleados, resEstados, resHorarios] = await Promise.all([
          obtenerClientes(),
          obtenerServicios(),
          obtenerAdicionales(),
          obtenerEmpleados(),
          obtenerEstadosCita(),
          obtenerHorarios(),
        ])
        if (!activo) return
        setClientes(resClientes.data.data || [])
        // servicios solo activos (el API devuelve todos, filtramos si tiene activo)
        const servs = (resServicios.data.data || []).filter((s) => s.activo !== false)
        setServicios(servs)
        const adics = (resAdicionales.data.data || []).filter((a) => a.activo !== false)
        setAdicionalesCatalogo(adics)
        const emps = resEmpleados.data.data || []
        setEmpleados(emps)
        setEstados(resEstados.data.data || [])
        setHorariosGenerales(resHorarios.data.data || [])
        // preseleccionar estado inicial "Pendiente" si existe
        const pendiente = (resEstados.data.data || []).find((e) => e.nombre === "Pendiente")
        if (pendiente && !esEdicion) setEstadoCitaId(String(pendiente.id))
      } catch (err) {
        if (!activo) return
        setErrorCatalogos(err.response?.data?.message || "No se pudieron cargar los catálogos")
      } finally {
        if (activo) setCargandoCatalogos(false)
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [esEdicion])

  // cargar cita existente
  useEffect(() => {
    if (!esEdicion) return
    let activo = true
    async function cargarCita() {
      setCargandoCita(true)
      try {
        const res = await obtenerCitaPorId(id)
        const data = res.data.data
        if (!activo) return
        // permisos: verificar empleado/cliente
        if (rol === "Empleado" && usuario?.empleado?.id && data.empleadoId !== usuario.empleado.id) {
          setErrorGeneral("No tiene permiso para editar esta cita")
          return
        }
        if (rol === "Cliente") {
          setErrorGeneral("Los clientes no pueden editar citas")
          return
        }
        if (data.estadoCita?.permiteEdicion === false) {
          setErrorGeneral(`No se puede editar una cita con estado ${data.estadoCita?.nombre}`)
        }
        setCitaExistente(data)
        setClienteId(String(data.clienteId))
        setServicioId(String(data.servicioId))
        setAdicionalIds((data.adicionales || []).map((a) => String(a.id)))
        setEmpleadoId(String(data.empleadoId))
        setFecha(String(data.fecha).slice(0, 10))
        setHoraInicio(String(data.horaInicio).slice(0, 5))
        setObservaciones(data.observaciones || "")
        // estado no se edita
      } catch (err) {
        if (!activo) return
        setErrorGeneral(err.response?.data?.message || "No se pudo cargar la cita")
      } finally {
        if (activo) setCargandoCita(false)
      }
    }
    cargarCita()
    return () => {
      activo = false
    }
  }, [esEdicion, id, rol, usuario])

  // derivados
  const servicioSeleccionado = useMemo(() => servicios.find((s) => String(s.id) === String(servicioId)) || null, [servicios, servicioId])
  const duracionMinutos = servicioSeleccionado?.duracionMinutos || 0
  const precioServicio = Number(servicioSeleccionado?.precioBase || 0)
  const adicionalesSeleccionados = useMemo(
    () => adicionalesCatalogo.filter((a) => adicionalIds.includes(String(a.id))),
    [adicionalesCatalogo, adicionalIds]
  )
  const costoAdicionales = adicionalesSeleccionados.reduce((acc, a) => acc + Number(a.precio || 0), 0)
  const costoTotal = precioServicio + costoAdicionales
  const horaFin = horaInicio && duracionMinutos ? sumarMinutosAHora(horaInicio, duracionMinutos) : ""

  // empleados filtrados por servicio y activos
  const empleadosFiltrados = useMemo(() => {
    let lista = empleados.filter((e) => e.activo !== false && e.usuario?.activo !== false)
    if (servicioId) {
      const sid = Number(servicioId)
      lista = lista.filter((e) => (e.servicios || []).some((s) => s.id === sid))
    }
    return lista
  }, [empleados, servicioId])

  const empleadoSeleccionado = useMemo(() => empleados.find((e) => String(e.id) === String(empleadoId)) || null, [empleados, empleadoId])
  const servicioAsignadoAlEmpleado = useMemo(() => {
    if (!servicioId || !empleadoSeleccionado) return true // no validar aún
    const sid = Number(servicioId)
    return (empleadoSeleccionado.servicios || []).some((s) => s.id === sid)
  }, [servicioId, empleadoSeleccionado])

  // cargar agenda cuando cambian empleado y fecha
  useEffect(() => {
    if (!empleadoId || !fecha) {
      setAgenda(null)
      return
    }
    let activo = true
    async function cargarAgenda() {
      setCargandoAgenda(true)
      setErrorAgenda("")
      try {
        const res = await obtenerAgendaEmpleadoPorCita(empleadoId, fecha)
        if (!activo) return
        setAgenda(res.data.data)
      } catch (err) {
        if (!activo) return
        setErrorAgenda(err.response?.data?.message || "No se pudo cargar la agenda")
        setAgenda(null)
      } finally {
        if (activo) setCargandoAgenda(false)
      }
    }
    cargarAgenda()
    return () => {
      activo = false
    }
  }, [empleadoId, fecha])

  // generar slots disponibles
  const slots = useMemo(() => {
    if (!agenda) return []
    if (!duracionMinutos) return []
    const horariosDelDia = agenda.horarios || []
    const restricciones = agenda.restricciones || []
    const citas = (agenda.citas || []).filter((c) => {
      // excluir la cita actual en edición para no contar su propio traslape
      if (esEdicion && String(c.id) === String(id)) return false
      return true
    })
    return generarSlotsDisponibles({ horariosDelDia, restricciones, citas, duracionMinutos, pasoMinutos: 15 })
  }, [agenda, duracionMinutos, esEdicion, id])

  // verificar disponibilidad cuando hay datos completos
  useEffect(() => {
    if (!empleadoId || !servicioId || !fecha || !horaInicio || !horaFin) {
      setDisponibilidad(null)
      return
    }
    // validaciones previas rápidas
    if (esFechaPasada(fecha)) {
      setDisponibilidad({ disponible: false, motivo: "La fecha no puede ser pasada" })
      return
    }
    if (!servicioAsignadoAlEmpleado) {
      setDisponibilidad({ disponible: false, motivo: "El servicio no está asignado al empleado" })
      return
    }
    if (!duracionMinutos) {
      setDisponibilidad({ disponible: false, motivo: "Seleccione un servicio válido" })
      return
    }

    let activo = true
    async function verificar() {
      setVerificandoDisp(true)
      try {
        const res = await consultarDisponibilidad({
          empleadoId: Number(empleadoId),
          servicioId: Number(servicioId),
          fecha,
          horaInicio,
          horaFin,
          citaIdExcluir: esEdicion ? Number(id) : null,
        })
        if (!activo) return
        setDisponibilidad(res.data.data)
      } catch (err) {
        if (!activo) return
        setDisponibilidad({ disponible: false, motivo: err.response?.data?.message || "No se pudo verificar disponibilidad" })
      } finally {
        if (activo) setVerificandoDisp(false)
      }
    }
    const t = setTimeout(verificar, 500)
    return () => {
      activo = false
      clearTimeout(t)
    }
  }, [empleadoId, servicioId, fecha, horaInicio, horaFin, esEdicion, id, duracionMinutos, servicioAsignadoAlEmpleado])

  function validarFormulario() {
    const nuevosErrores = {}
    if (!clienteId) nuevosErrores.clienteId = "Seleccione un cliente"
    if (!servicioId) nuevosErrores.servicioId = "Seleccione un servicio"
    else if (!servicioSeleccionado) nuevosErrores.servicioId = "Servicio no válido"
    else if (servicioSeleccionado.activo === false) nuevosErrores.servicioId = "El servicio se encuentra inactivo"
    if (!empleadoId) nuevosErrores.empleadoId = "Seleccione un empleado"
    else if (!empleadoSeleccionado) nuevosErrores.empleadoId = "Empleado no válido"
    else if (empleadoSeleccionado.activo === false || empleadoSeleccionado.usuario?.activo === false) nuevosErrores.empleadoId = "El empleado se encuentra inactivo"
    else if (!servicioAsignadoAlEmpleado) nuevosErrores.empleadoId = "El servicio no está asignado al empleado"
    if (!fecha) nuevosErrores.fecha = "Seleccione una fecha"
    else if (esFechaPasada(fecha)) nuevosErrores.fecha = "La fecha no puede ser pasada"
    if (!horaInicio) nuevosErrores.horaInicio = "Seleccione una hora de inicio"
    else if (!/^\d{2}:\d{2}$/.test(horaInicio)) nuevosErrores.horaInicio = "Hora inválida"
    if (!horaFin) nuevosErrores.horaFin = "La hora final no pudo calcularse"
    if (adicionalIds.length !== new Set(adicionalIds).size) nuevosErrores.adicionalIds = "No se permiten adicionales duplicados"
    // validar adicionales activos
    const adicionalesInactivos = adicionalesSeleccionados.filter((a) => a.activo === false)
    if (adicionalesInactivos.length) nuevosErrores.adicionalIds = "Uno o más adicionales se encuentran inactivos"
    if (!esEdicion && !estadoCitaId) nuevosErrores.estadoCitaId = "Seleccione un estado"
    if (observaciones && observaciones.trim().length > 0 && observaciones.trim().length < 3) {
      nuevosErrores.observaciones = "Las observaciones deben contener al menos 3 caracteres"
    }
    if (observaciones && observaciones.length > 500) nuevosErrores.observaciones = "Las observaciones no pueden superar 500 caracteres"
    // disponibilidad
    if (disponibilidad && disponibilidad.disponible === false) {
      nuevosErrores.disponibilidad = disponibilidad.motivo || "Horario no disponible"
    }
    // horario general: verificar que no sea día cerrado
    if (agenda && (agenda.horarios || []).length === 0) nuevosErrores.fecha = "El establecimiento no atiende en la fecha seleccionada"
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function handleToggleAdicional(adicionalId) {
    const sid = String(adicionalId)
    setAdicionalIds((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErrorGeneral("")
    setErroresApi([])
    if (!validarFormulario()) return

    // verificar disponibilidad nuevamente antes de guardar
    setGuardando(true)
    try {
      const dispRes = await consultarDisponibilidad({
        empleadoId: Number(empleadoId),
        servicioId: Number(servicioId),
        fecha,
        horaInicio,
        horaFin,
        citaIdExcluir: esEdicion ? Number(id) : null,
      })
      if (!dispRes.data.data.disponible) {
        setErrorGeneral(dispRes.data.data.motivo || "El horario ya no está disponible")
        setDisponibilidad(dispRes.data.data)
        setGuardando(false)
        return
      }

      const payloadBase = {
        clienteId: Number(clienteId),
        empleadoId: Number(empleadoId),
        servicioId: Number(servicioId),
        fecha,
        horaInicio,
        horaFin,
        duracionMinutos: Number(duracionMinutos),
        precioServicio: Number(precioServicio),
        costoAdicionales: Number(costoAdicionales),
        costoTotal: Number(costoTotal),
        observaciones: observaciones?.trim() ? observaciones.trim() : null,
        adicionalIds: adicionalIds.map(Number),
      }

      if (esEdicion) {
        await actualizarCita(id, payloadBase)
      } else {
        const payloadCrear = {
          ...payloadBase,
          estadoCitaId: Number(estadoCitaId),
          creadoPorUsuarioId: Number(usuario.id),
        }
        await crearCita(payloadCrear)
      }
      navigate("/citas")
    } catch (err) {
      const data = err.response?.data
      if (data?.validationErrors?.length) {
        setErroresApi(data.validationErrors.map((v) => `${v.field}: ${v.message}`))
      }
      setErrorGeneral(data?.message || err.message || "No se pudo guardar la cita")
    } finally {
      setGuardando(false)
    }
  }

  if (cargandoCatalogos || cargandoCita) {
    return <p className="p-6 text-muted-foreground">Cargando formulario...</p>
  }

  if (errorCatalogos) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{errorCatalogos}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // clientes no pueden acceder a formulario
  if (rol === "Cliente") {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>No tiene permiso para crear o editar citas. Los clientes solo pueden consultar sus citas.</AlertDescription>
        </Alert>
        <Link to="/citas" className="mt-4 inline-block">
          <Button variant="outline">Volver a citas</Button>
        </Link>
      </div>
    )
  }

  // si es edición y cita no permite edición
  const bloqueadaPorEstado = citaExistente && citaExistente.estadoCita?.permiteEdicion === false

  return (
    <div className="p-6">
      <Link to={esEdicion ? `/citas/${id}` : "/citas"} className="mb-4 inline-block text-sm text-primary underline">
        &larr; {esEdicion ? "Volver al detalle" : "Volver a citas"}
      </Link>

      <h1 className="text-2xl font-bold mb-2">{esEdicion ? "Editar cita" : "Nueva cita"}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Complete todos los campos. La duración, hora final y costo se calculan automáticamente. La disponibilidad se verifica en tiempo real.
      </p>

      {bloqueadaPorEstado && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>No se puede modificar una cita con estado {citaExistente.estadoCita.nombre}</AlertDescription>
        </Alert>
      )}
      {errorGeneral && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorGeneral}</AlertDescription>
        </Alert>
      )}
      {erroresApi.length > 0 && (
        <ul className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erroresApi.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}
      {errores.disponibilidad && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errores.disponibilidad}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos de la cita</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Cliente */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="clienteId">Cliente *</Label>
                <select
                  id="clienteId"
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  disabled={bloqueadaPorEstado}
                  aria-invalid={errores.clienteId ? true : undefined}
                >
                  <option value="">Seleccione un cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.primerApellido} {c.segundoApellido} — {c.correo} {c.activo === false ? "(inactivo)" : ""}
                    </option>
                  ))}
                </select>
                {errores.clienteId && <p className="text-sm text-destructive">{errores.clienteId}</p>}
              </div>

              {/* Servicio */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="servicioId">Servicio principal *</Label>
                <select
                  id="servicioId"
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                  value={servicioId}
                  onChange={(e) => {
                    setServicioId(e.target.value)
                    // limpiar empleado si ya no es compatible
                    const emp = empleados.find((x) => String(x.id) === String(empleadoId))
                    if (emp && e.target.value) {
                      const ok = (emp.servicios || []).some((s) => String(s.id) === String(e.target.value))
                      if (!ok) setEmpleadoId("")
                    }
                  }}
                  disabled={bloqueadaPorEstado}
                  aria-invalid={errores.servicioId ? true : undefined}
                >
                  <option value="">Seleccione un servicio</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} — {s.duracionMinutos} min · ₡{s.precioBase}
                    </option>
                  ))}
                </select>
                {errores.servicioId && <p className="text-sm text-destructive">{errores.servicioId}</p>}
                {servicioSeleccionado && (
                  <p className="text-xs text-muted-foreground">
                    Duración: {duracionMinutos} min · Precio base: ₡{precioServicio}
                  </p>
                )}
              </div>

              {/* Adicionales */}
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium">Servicios adicionales (opcional)</legend>
                <p className="text-xs text-muted-foreground">Los adicionales aumentan el costo pero no la duración.</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {adicionalesCatalogo.map((ad) => (
                    <label key={ad.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={adicionalIds.includes(String(ad.id))}
                        onChange={() => handleToggleAdicional(ad.id)}
                        disabled={bloqueadaPorEstado}
                      />
                      <span className="flex flex-col">
                        <span>{ad.nombre}</span>
                        <span className="text-xs text-muted-foreground">₡{ad.precio}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {errores.adicionalIds && <p className="text-sm text-destructive">{errores.adicionalIds}</p>}
              </fieldset>

              {/* Empleado */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="empleadoId">Empleado *</Label>
                <select
                  id="empleadoId"
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                  value={empleadoId}
                  onChange={(e) => setEmpleadoId(e.target.value)}
                  disabled={bloqueadaPorEstado}
                  aria-invalid={errores.empleadoId ? true : undefined}
                >
                  <option value="">Seleccione un empleado</option>
                  {empleadosFiltrados.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.usuario?.nombre} {e.usuario?.primerApellido} — {e.codigoEmpleado} ({e.especialidad?.nombre})
                    </option>
                  ))}
                </select>
                {servicioId && empleadosFiltrados.length === 0 && (
                  <p className="text-sm text-amber-700">Ningún empleado activo realiza este servicio.</p>
                )}
                {errores.empleadoId && <p className="text-sm text-destructive">{errores.empleadoId}</p>}
                {!servicioAsignadoAlEmpleado && empleadoId && servicioId && (
                  <p className="text-sm text-destructive">El empleado seleccionado no realiza el servicio elegido.</p>
                )}
              </div>

              {/* Fecha y hora */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} min={hoyISO()} disabled={bloqueadaPorEstado} aria-invalid={errores.fecha ? true : undefined} />
                  {errores.fecha && <p className="text-sm text-destructive">{errores.fecha}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="horaInicio">Hora de inicio *</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    step="900"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    disabled={bloqueadaPorEstado}
                    aria-invalid={errores.horaInicio ? true : undefined}
                  />
                  {errores.horaInicio && <p className="text-sm text-destructive">{errores.horaInicio}</p>}
                  {horaFin && <p className="text-xs text-muted-foreground">Hora final calculada: {horaFin} (duración {duracionMinutos} min)</p>}
                </div>
              </div>

              {!esEdicion && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="estadoCitaId">Estado inicial *</Label>
                  <select
                    id="estadoCitaId"
                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                    value={estadoCitaId}
                    onChange={(e) => setEstadoCitaId(e.target.value)}
                    disabled={bloqueadaPorEstado}
                  >
                    <option value="">Seleccione un estado</option>
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.estadoCitaId && <p className="text-sm text-destructive">{errores.estadoCitaId}</p>}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                <textarea
                  id="observaciones"
                  rows={3}
                  className="border-input flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                  placeholder="Cliente solicita atención puntual..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={bloqueadaPorEstado}
                />
                {errores.observaciones && <p className="text-sm text-destructive">{errores.observaciones}</p>}
              </div>

              {/* Validaciones visibles resumen */}
              {disponibilidad && (
                <div
                  className={`rounded-md border px-3 py-2 text-sm ${disponibilidad.disponible ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-destructive/10 border-destructive/20 text-destructive"}`}
                >
                  {verificandoDisp ? "Verificando disponibilidad..." : disponibilidad.disponible ? `✓ ${disponibilidad.motivo}` : `✗ ${disponibilidad.motivo}`}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={guardando || bloqueadaPorEstado || verificandoDisp}>
                  {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear cita"}
                </Button>
                <Link to={esEdicion ? `/citas/${id}` : "/citas"}>
                  <Button type="button" variant="outline" disabled={guardando}>
                    Cancelar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <EmployeeSchedule agenda={agenda} fecha={fecha} />
          {errorAgenda && <p className="text-sm text-destructive">{errorAgenda}</p>}
        </div>

        <div className="space-y-4">
          <AppointmentSummary
            servicio={servicioSeleccionado}
            adicionales={adicionalesSeleccionados}
            duracion={duracionMinutos}
            horaInicio={horaInicio}
            horaFin={horaFin}
            costoTotal={costoTotal}
            costoAdicionales={costoAdicionales}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disponibilidad del empleado</CardTitle>
            </CardHeader>
            <CardContent>
              {!empleadoId || !fecha ? (
                <p className="text-sm text-muted-foreground">Seleccione empleado y fecha para ver horarios.</p>
              ) : !servicioId ? (
                <p className="text-sm text-muted-foreground">Seleccione un servicio para calcular la duración y ver disponibilidad.</p>
              ) : (
                <AvailabilityGrid slots={slots} horaSeleccionada={horaInicio} onSelect={setHoraInicio} cargando={cargandoAgenda} error={errorAgenda} vacioMensaje="No hay horarios para mostrar." />
              )}
              {agenda && (
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <p>Horario general del día: {agenda.horarios?.length ? agenda.horarios.map((h) => `${h.horaInicio}-${h.horaFin}`).join(", ") : "Cerrado"}</p>
                  <p>Restricciones: {agenda.restricciones?.length || 0} · Citas que bloquean: {agenda.citas?.length || 0}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Horario general del establecimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {horariosGenerales.length ? (
                horariosGenerales.map((h) => (
                  <p key={h.id} className="text-muted-foreground">
                    {h.diaSemana?.nombre || `Día ${h.diaSemanaId}`} {h.horaInicio?.slice(0, 5)} - {h.horaFin?.slice(0, 5)}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">No se pudo cargar el horario.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
