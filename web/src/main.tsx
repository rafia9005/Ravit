import { StrictMode, lazy, Suspense } from "react"
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
import Logout from "./pages/auth/logout"

// Lazy load pages for better performance
const ExplorePage = lazy(() => import("./pages/explore"))
const NotificationsPage = lazy(() => import("./pages/notifications"))
const BookmarksPage = lazy(() => import("./pages/bookmarks"))
const ProfilePage = lazy(() => import("./pages/profile"))
const PostPage = lazy(() => import("./pages/post"))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="auth/oauth-callback" element={<OAuthCallback />} />
                <Route path="logout" element={<Logout />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="" element={<Index />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="bookmarks" element={<BookmarksPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="profile/:userId" element={<ProfilePage />} />
                  <Route path="post/:postId" element={<PostPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
)
