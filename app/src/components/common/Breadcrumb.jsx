import { Link, useLocation } from "react-router-dom"

const MAPA = {
  "": "Inicio",
  "perfil": "Mi perfil",
  "servicios": "Servicios",
  "nuevo": "Nuevo",
  "editar": "Editar",
  "adicionales": "Adicionales",
  "empleados": "Empleados",
  "horarios": "Horarios",
  "restricciones": "Restricciones",
  "citas": "Citas",
  "agenda": "Agenda diaria",
  "mi-agenda": "Mi agenda",
  "nueva": "Nueva cita",
}

export default function Breadcrumb() {
  const { pathname } = useLocation()
  if (pathname === "/" ) return null
  const partes = pathname.split("/").filter(Boolean)
  let acum = ""
  return (
    <nav aria-label="Miga de pan" className="mx-auto max-w-5xl px-6 pt-4 text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        <li><Link to="/" className="hover:text-foreground hover:underline">Inicio</Link></li>
        {partes.map((p, i) => {
          acum += `/${p}`
          const esUltimo = i === partes.length - 1
          const esId = /^\d+$/.test(p)
          const texto = MAPA[p] || (esId ? `#${p}` : p)
          return (
            <li key={acum} className="flex items-center gap-1">
              <span aria-hidden="true">/</span>
              {esUltimo ? <span className="font-medium text-foreground">{texto}</span> : <Link to={acum} className="hover:text-foreground hover:underline">{texto}</Link>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
