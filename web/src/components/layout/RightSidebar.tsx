import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
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
      <Card className="rounded-xl bg-card border shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b bg-muted/20">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Trending Communities</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col">
          {trends.map((trend, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors group relative cursor-pointer border-b last:border-0">
              <div className="flex flex-col">
                <span className="font-bold text-[14px] group-hover:underline text-primary">r/{trend.topic.replace("#", "").toLowerCase()}</span>
                <span className="text-xs text-muted-foreground">{trend.posts} members</span>
              </div>
              <Button size="sm" variant="outline" className="rounded-full h-8 px-4 font-bold border-primary text-primary hover:bg-primary/5">
                Join
              </Button>
            </div>
          ))}
          <Button variant="ghost" className="text-muted-foreground justify-center p-3 hover:no-underline hover:bg-muted/50 h-auto rounded-none text-xs font-bold">
            VIEW ALL
          </Button>
        </CardContent>
      </Card>

      {/* Who to follow */}
      <Card className="rounded-xl bg-card border shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b bg-muted/20">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Suggested Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col">
          <div className="p-4 flex items-center gap-3 group cursor-pointer border-b last:border-0 hover:bg-muted/50 transition-colors">
            <div className="size-8 rounded shadow-sm bg-muted border overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-bold text-sm truncate hover:underline">Sarah Jones</span>
              <span className="text-muted-foreground text-xs truncate">u/sarah_codes</span>
            </div>
            <Button size="sm" className="rounded-full h-8 font-bold px-4">
              Follow
            </Button>
          </div>
          <Button variant="ghost" className="text-muted-foreground justify-center p-3 hover:no-underline hover:bg-muted/50 h-auto rounded-none text-xs font-bold">
            SHOW MORE
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
