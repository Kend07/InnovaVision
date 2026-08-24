import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import MainLayout from "@/layouts/MainLayout"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import HomePage from "@/pages/HomePage"
import ProfilePage from "@/pages/ProfilePage"
import ServiciosPage from "@/pages/ServiciosPage"
import ServicioDetallePage from "@/pages/ServicioDetallePage"
import AdicionalesPage from "@/pages/AdicionalesServicePage"
import AdicionalDetailPage from "@/pages/AdicionalDetailPage"
import AdicionalFormPage from "@/pages/AdicionalFormPage"
import EmpleadosPage from "@/pages/empleados/EmpleadosPage"
import EmpleadoFormPage from "@/pages/empleados/EmpleadoFormPage"
import EmpleadoDetallePage from "@/pages/empleados/EmpleadoDetallePage"
import CitasPage from "@/pages/citas/CitasPage"
import CitaDetallePage from "@/pages/citas/CitaDetallePage"
import CitaFormPage from "@/pages/citas/CitaFormPage"
import AgendaDiariaPage from "@/pages/citas/AgendaDiariaPage"
import MiAgendaPage from "@/pages/citas/MiAgendaPage"
import RequireRole from "@/components/RequireRole"
import HorariosPage from "@/pages/HorariosPage"
import HorarioDetailPage from "@/pages/HorarioDetailPage"
import RestriccionesPage from "@/pages/RestriccionesPage"
import RestriccionDetailPage from "@/pages/RestriccionDetailPage"
import NotFoundPage from "@/pages/NotFoundPage"
import ServicioFormPage from "@/pages/ServicioFormPage"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route
              path="/empleados"
              element={
                <RequireRole rol="Administrador">
                  <EmpleadosPage />
                </RequireRole>
              }
            />
            <Route
              path="/empleados/nuevo"
              element={
                <RequireRole rol="Administrador">
                  <EmpleadoFormPage />
                </RequireRole>
              }
            />
            <Route
              path="/empleados/:id"
              element={
                <RequireRole rol="Administrador">
                  <EmpleadoDetallePage />
                </RequireRole>
              }
            />
            <Route
              path="/empleados/:id/editar"
              element={
                <RequireRole rol="Administrador">
                  <EmpleadoFormPage />
                </RequireRole>
              }
            />
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route
              path="/servicios/nuevo"
              element={
                <RequireRole rol="Administrador">
                  <ServicioFormPage />
                </RequireRole>
              }
            />
            <Route
              path="/servicios/:id/editar"
              element={
                <RequireRole rol="Administrador">
                  <ServicioFormPage />
                </RequireRole>
              }
            />
            <Route path="/servicios/:id" element={<ServicioDetallePage />} />
            <Route path="/adicionales" element={<AdicionalesPage />} />
            <Route
              path="/adicionales/nuevo"
              element={
                <RequireRole rol="Administrador">
                  <AdicionalFormPage />
                </RequireRole>
              }
            />
            <Route
              path="/adicionales/:id/editar"
              element={
                <RequireRole rol="Administrador">
                  <AdicionalFormPage />
                </RequireRole>
              }
            />
            <Route path="/adicionales/:id" element={<AdicionalDetailPage />} />
            <Route path="/horarios" element={<HorariosPage />} />
            <Route path="/horarios/:id" element={<HorarioDetailPage />} />
            <Route path="/citas" element={<CitasPage />} />
            <Route path="/restricciones" element={<RestriccionesPage />} />
            <Route path="/restricciones/:id" element={<RestriccionDetailPage />} />
            <Route
              path="/citas/agenda"
              element={
                <RequireRole rol="Administrador">
                  <AgendaDiariaPage />
                </RequireRole>
              }
            />
            <Route
              path="/citas/mi-agenda"
              element={
                <RequireRole rol="Empleado">
                  <MiAgendaPage />
                </RequireRole>
              }
            />
            <Route
              path="/citas/nueva"
              element={
                <RequireRole roles={["Administrador", "Empleado"]}>
                  <CitaFormPage />
                </RequireRole>
              }
            />
            <Route path="/citas/:id" element={<CitaDetallePage />} />
            <Route
              path="/citas/:id/editar"
              element={
                <RequireRole roles={["Administrador", "Empleado"]}>
                  <CitaFormPage />
                </RequireRole>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}