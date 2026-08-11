import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
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
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route path="/servicios/:id" element={<ServicioDetallePage />} />
            <Route path="/adicionales" element={<AdicionalesPage />} />
            <Route path="/adicionales/:id" element={<AdicionalDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}