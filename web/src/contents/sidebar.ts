import {
	Home,
	LayoutDashboard,
} from "lucide-react";

export type NavItem = {
	title: string;
	url: string;
	icon: typeof Home;
	roles: ("user" | "admin")[];
	exact?: boolean;
	badge?: string | number | null;
};

export const navigationItems: NavItem[] = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
		roles: ["user", "admin"],
		exact: true,
		badge: null,
	},
];