import { Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal, Feather, LogOut } from "lucide-react"
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

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Mail, label: "Messages", path: "/messages" },
  { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
  { icon: User, label: "Profile", path: "/profile" },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div className="flex flex-col h-screen sticky top-0 px-2 lg:px-4 py-3 justify-between">
      <div className="flex flex-col gap-2">
        {/* Logo */}
        <Link to="/" className="p-3 mb-2">
          <div className="size-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold italic text-lg">R</span>
          </div>
        </Link>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link key={item.label} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 text-xl font-normal h-12 rounded-full px-4 hover:bg-muted/80",
                    active && "font-bold"
                  )}
                >
                  <item.icon className={cn("size-6", active && "stroke-[2.5px]")} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Post Button */}
        <Button
          className="mt-4 w-full h-12 rounded-full text-lg font-bold shadow-md lg:px-4 flex items-center justify-center"
          onClick={() => {
            // Scroll to post composer on home page
            if (location.pathname === "/") {
              document.getElementById("post-composer")?.scrollIntoView({ behavior: "smooth" })
            } else {
              navigate("/")
            }
          }}
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
              className="w-full justify-start gap-3 h-14 rounded-full px-3 hover:bg-muted/80"
            >
              <div className="size-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
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
              <div className="hidden lg:flex flex-col items-start text-sm">
                <span className="font-bold truncate max-w-[120px]">
                  {user?.name || user?.username || "User"}
                </span>
                <span className="text-muted-foreground truncate max-w-[120px]">
                  @{user?.username || user?.email?.split("@")[0] || "user"}
                </span>
              </div>
              <MoreHorizontal className="hidden lg:block ml-auto size-4 text-muted-foreground" />
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
  )
}
