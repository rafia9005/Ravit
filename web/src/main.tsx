import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "@/context/AuthProvider.tsx"
import { HelmetProvider } from "react-helmet-async"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Index from "./pages"
import Register from "./pages/auth/register"
import Login from "./pages/auth/login"
import OAuthCallback from "./pages/auth/oauth-callback"
import { ProtectedRoute } from "./components/ProtectedRoute"
import Layout from "./pages/dashboard/layout"
import Dashboard from "./pages/dashboard/dashboard"
import Logout from "./pages/auth/logout"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="" element={<Index />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="auth/oauth-callback" element={<OAuthCallback />} />
              <Route path="logout" element={<Logout />} />

              {/* Protected Dashboard Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
)
