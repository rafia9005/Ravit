import { MoreHorizontal, Feather, LogOut, User } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { getAvatarUrl, getInitials } from "@/lib/avatar"
import { getMediaUrl } from "@/lib/images"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { getSidebarNavItems, isNavActive, system } from "@/contents"

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navItems = getSidebarNavItems()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const handlePostClick = () => {
    // Scroll to post composer on home page
    if (location.pathname === "/") {
      document.getElementById("post-composer")?.scrollIntoView({ behavior: "smooth" })
    } else {
      navigate("/")
    }
  }

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <div className="hidden md:flex flex-col h-screen sticky top-0 px-2 lg:px-4 py-3 justify-between">
        <div className="flex flex-col gap-2">
          {/* Logo */}
          <Link to="/" className="p-3 mb-2 flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center rotate-[-10deg] shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-xl leading-none">
                {system.shortName[0]}
              </span>
            </div>
            <span className="hidden lg:inline text-xl font-black tracking-tight italic">
              {system.shortName.toLowerCase()}
            </span>
          </Link>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isNavActive(location.pathname, item.path)
              return (
                <Link key={item.label} to={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-4 text-lg font-medium h-11 rounded-lg px-4 hover:bg-muted/80 transition-all",
                      active && "bg-muted font-bold text-primary"
                    )}
                  >
                    <item.icon className={cn("size-5", active && "stroke-[2.5px]")} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Post Button */}
          <Button
            className="mt-4 w-full h-11 rounded-lg text-base font-bold shadow-sm lg:px-4 flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handlePostClick}
          >
            <Feather className="size-5 lg:hidden" />
            <span className="hidden lg:inline text-primary-foreground">Post</span>
          </Button>
        </div>

        {/* User Menu */}
        <div className="flex flex-col gap-4 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 rounded-lg px-2 hover:bg-muted/80 transition-all border border-transparent hover:border-border"
              >
                <div className="size-8 rounded shadow-sm bg-muted flex items-center justify-center overflow-hidden border">
                  <Avatar>
                    <AvatarImage
                      src={user?.avatar ? getMediaUrl(user.avatar) : getAvatarUrl(user?.name)}
                      alt={user?.username || "avatar"}
                      className="w-full h-full object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.name ? (
                        getInitials(user.name)
                      ) : (
                        <User className="size-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="hidden lg:flex flex-col items-start text-xs">
                  <span className="font-bold truncate max-w-[120px]">
                    {user?.name || user?.username || "User"}
                  </span>
                  <span className="text-muted-foreground truncate max-w-[120px]">
                    u/{user?.username || user?.email?.split("@")[0] || "user"}
                  </span>
                </div>
                <MoreHorizontal className="hidden lg:block ml-auto size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}
