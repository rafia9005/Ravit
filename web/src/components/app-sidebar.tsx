import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  Settings,
  User,
  ChevronUp,
  Home as HomeIcon,
} from "lucide-react";
import { ThemeButton } from "./elements/theme-button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { navigationItems, type NavItem } from "@/contents/sidebar";
import { system } from "@/contents";
import { getAvatarUrl, getInitials } from "@/lib/avatar";

const items = navigationItems;

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Filter menu items based on user role
  const filteredItems: NavItem[] = items.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role as "user" | "admin");
  });

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HomeIcon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {system.shortName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {system.description}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Navigasi</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item: NavItem) => {
                let isActive = false;
                if (item.url === "/dashboard") {
                  isActive = currentPath === "/dashboard";
                } else {
                  isActive =
                    currentPath === item.url ||
                    currentPath.startsWith(item.url + "/");
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                    >
                      <Link
                        to={item.url}
                        className="flex items-center gap-3"
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getAvatarUrl(user?.avatar)}
                        alt={user?.name || user?.email}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {user?.name ? (
                          <span className="inline-block leading-none">
                            {getInitials(user.name)}
                          </span>
                        ) : (
                          <User className="size-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name || user?.email}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email || null}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg z-50"
                side="top"
                align="end"
                sideOffset={8}
              >
                {/* Profile Header */}
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getAvatarUrl(user?.avatar)}
                        alt={
                          user?.name || user?.email
                        }
                      />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {user?.name ? (
                        <span className="inline-block leading-none">
                          {getInitials(user.name)}
                        </span>
                      ) : (
                        <User className="size-4" />
                      )}
                    </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name || user?.email}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email ||
                          "user@example.com"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Profile Menu Items */}
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2"
                  >
                    <User className="size-4" />
                    Profil Saya
                  </Link>
                </DropdownMenuItem>

                {/* <DropdownMenuSeparator /> */}

                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-2"
                  >
                    <Settings className="size-4" />
                    Pengaturan
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm text-muted-foreground">
                    Tema
                  </span>
                  <ThemeButton variant="rounded" />
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
