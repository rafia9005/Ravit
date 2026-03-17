import { Sidebar } from "@/components/layout/Sidebar"
import { Feed } from "@/components/layout/Feed"
import { RightSidebar } from "@/components/layout/RightSidebar"

/**
 * Modern Twitter-like Home Page for Ravit
 * Layout: Left Sidebar (Nav) | Center (Feed) | Right Sidebar (Trends)
 */
export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center selection:bg-primary/20">
      <div className="flex w-full max-w-7xl">
        {/* Left Sidebar - Navigation */}
        <aside className="w-16 lg:w-[275px] shrink-0">
          <Sidebar />
        </aside>

        {/* Main Feed Area */}
        <main className="flex-1 max-w-[600px] border-x min-h-screen">
          <Feed />
        </main>

        {/* Right Sidebar - Trends and Recommendations */}
        <aside className="hidden xl:block w-[350px] shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  )
}
