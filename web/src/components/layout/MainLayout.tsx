import { Sidebar } from "@/components/layout/Sidebar"
import { RightSidebar } from "@/components/layout/RightSidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { Toaster } from "@/components/ui/toaster"

interface MainLayoutProps {
  children: React.ReactNode
  showRightSidebar?: boolean
}

/**
 * Main Layout Component
 * Wraps all protected pages with Sidebar (desktop) and BottomNav (mobile)
 * Layout: Left Sidebar (Nav) | Center (Content) | Right Sidebar (optional)
 */
export function MainLayout({ children, showRightSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center selection:bg-primary/20">
      <div className="flex w-full max-w-7xl">
        <aside className="hidden md:block w-16 lg:w-[275px] shrink-0">
          <Sidebar />
        </aside>

        <main className="flex-1 max-w-[600px] border-x min-h-screen pb-16 md:pb-0">
          {children}
        </main>

        {showRightSidebar && (
          <aside className="hidden xl:block w-[350px] shrink-0">
            <RightSidebar />
          </aside>
        )}

        <BottomNav />
      </div>
      <Toaster />
    </div>
  )
}
