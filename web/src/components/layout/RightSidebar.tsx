import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const trends = [
  { category: "Technology · Trending", topic: "#ReactJS", posts: "24.5K" },
  { category: "Business · Trending", topic: "#TailwindCSS", posts: "12.2K" },
  { category: "Social · Trending", topic: "Ravit UI", posts: "8.4K" },
  { category: "Sports · Trending", topic: "#ModernWeb", posts: "32.1K" },
]

export function RightSidebar() {
  return (
    <aside className="hidden xl:flex flex-col gap-4 p-4 sticky top-0 h-screen overflow-y-auto w-[350px]">
      {/* Search */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md pb-2 z-10">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-10 h-10 rounded-full bg-muted/50 border-none focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary transition-all shadow-none" 
            placeholder="Search Ravit"
          />
        </div>
      </div>

      {/* Trends Card */}
      <Card className="rounded-2xl bg-muted/30 border-none shadow-none overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-xl font-extrabold tracking-tight">Trends for you</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-3 flex flex-col">
          {trends.map((trend, i) => (
            <div key={i} className="px-4 py-3 flex flex-col hover:bg-muted/50 transition-colors group relative cursor-pointer">
              <span className="text-xs text-muted-foreground">{trend.category}</span>
              <span className="font-bold text-[15px] group-hover:underline">{trend.topic}</span>
              <span className="text-xs text-muted-foreground">{trend.posts} Posts</span>
              <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="link" className="text-primary justify-start p-4 hover:no-underline hover:bg-muted/50 h-auto rounded-none">
            Show more
          </Button>
        </CardContent>
      </Card>

      {/* Who to follow */}
      <Card className="rounded-2xl bg-muted/30 border-none shadow-none overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-xl font-extrabold tracking-tight">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-3 flex flex-col gap-4 px-4 pb-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="size-10 rounded-full bg-muted border overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-bold text-sm truncate hover:underline">Sarah Jones</span>
              <span className="text-muted-foreground text-xs truncate">@sarah_codes</span>
            </div>
            <Button size="sm" className="rounded-full font-bold px-4 bg-foreground text-background hover:bg-foreground/90">
              Follow
            </Button>
          </div>
          <Button variant="link" className="text-primary justify-start p-0 hover:no-underline h-auto font-normal">
            Show more
          </Button>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="px-4 text-[13px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
        <span className="hover:underline cursor-pointer">Terms of Service</span>
        <span className="hover:underline cursor-pointer">Privacy Policy</span>
        <span className="hover:underline cursor-pointer">Cookie Policy</span>
        <span className="hover:underline cursor-pointer">Accessibility</span>
        <span className="hover:underline cursor-pointer">Ads info</span>
        <span>© 2026 Ravit Corp.</span>
      </footer>
    </aside>
  )
}
