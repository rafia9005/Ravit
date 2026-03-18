import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { getAvatarUrl, getInitials } from "@/lib/avatar"
import { getMediaUrl } from "@/lib/images"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getBottomNavItems, isNavActive } from "@/contents"

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const navItems = getBottomNavItems()

  const handlePostClick = () => {
    if (location.pathname === "/") {
      document.getElementById("post-composer")?.scrollIntoView({ behavior: "smooth" })
    } else {
      navigate("/")
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t z-50 px-2 h-16 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => {
        // Post action button (center FAB)
        if (item.isAction) {
          return (
            <button
              key={`mobile-${item.label.toLowerCase()}`}
              onClick={handlePostClick}
              className="flex items-center justify-center size-12 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 active:scale-90 transition-transform -mt-6 border-4 border-background"
              aria-label={item.label}
            >
              <item.icon className="size-6" />
            </button>
          )
        }

        const active = isNavActive(location.pathname, item.path)
        
        // Profile with avatar
        if (item.path === "/profile") {
          return (
            <Link 
              key={item.label} 
              to={item.path} 
              className="flex flex-col items-center justify-center w-12 h-12 rounded-full active:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "size-7 rounded-full overflow-hidden border-2 transition-all", 
                active ? "border-primary scale-110" : "border-transparent"
              )}>
                <Avatar className="size-full">
                  <AvatarImage
                    src={user?.avatar ? getMediaUrl(user.avatar) : getAvatarUrl(user?.name)}
                    alt={user?.username || "avatar"}
                    className="object-cover aspect-square"
                  />
                  <AvatarFallback className="bg-primary text-white text-[10px]">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          )
        }

        // Regular nav items
        return (
          <Link 
            key={item.label} 
            to={item.path} 
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full active:bg-muted/50 transition-colors relative"
          >
            <item.icon className={cn(
              "size-6 transition-all", 
              active ? "text-primary scale-110 stroke-[2.5px]" : "text-muted-foreground"
            )} />
            {active && (
              <span className="absolute bottom-1 size-1 bg-primary rounded-full animate-in zoom-in duration-300" />
            )}
          </Link>
        )
      })}
    </div>
  )
}
