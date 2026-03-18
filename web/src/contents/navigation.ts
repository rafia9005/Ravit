import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  Bookmark, 
  User, 
  Feather,
  type LucideIcon 
} from "lucide-react"

/**
 * Navigation item type
 */
export interface NavItem {
  icon: LucideIcon
  label: string
  path: string
  /** Only show in sidebar (desktop) */
  sidebarOnly?: boolean
  /** Only show in bottom nav (mobile) */
  mobileOnly?: boolean
  /** Is this an action button (like Post) */
  isAction?: boolean
}

/**
 * Main navigation items used by both Sidebar and BottomNav
 * Order matters - items will be displayed in this order
 */
export const mainNavItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Mail, label: "Messages", path: "/messages", sidebarOnly: true },
  { icon: Bookmark, label: "Bookmarks", path: "/bookmarks", sidebarOnly: true },
  { icon: User, label: "Profile", path: "/profile" },
]

/**
 * Post/Compose action button
 */
export const postAction: NavItem = {
  icon: Feather,
  label: "Post",
  path: "/compose",
  isAction: true,
}

/**
 * Get navigation items for sidebar (desktop)
 */
export function getSidebarNavItems(): NavItem[] {
  return mainNavItems.filter(item => !item.mobileOnly)
}

/**
 * Get navigation items for bottom nav (mobile)
 * Returns: Home, Explore, [Post Action], Notifications, Profile
 */
export function getBottomNavItems(): NavItem[] {
  const mobileItems = mainNavItems.filter(item => !item.sidebarOnly)
  
  // Insert post action in the middle
  const middleIndex = Math.floor(mobileItems.length / 2)
  return [
    ...mobileItems.slice(0, middleIndex),
    postAction,
    ...mobileItems.slice(middleIndex),
  ]
}

/**
 * Helper to check if a path is active
 */
export function isNavActive(currentPath: string, itemPath: string): boolean {
  if (itemPath === "/") return currentPath === "/"
  return currentPath === itemPath || currentPath.startsWith(itemPath + "/")
}
