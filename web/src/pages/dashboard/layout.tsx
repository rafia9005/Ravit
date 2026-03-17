import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import { Helmet } from "react-helmet-async";

export default function Layout() {
	const { user, isLoading, fetchUser, tokens } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	// Fetch user when we have tokens but no user data yet
	useEffect(() => {
		if (!isLoading && tokens && !user) {
			console.log("Tokens exist but user not loaded, fetching user...");
			fetchUser();
		}
	}, [tokens, user, isLoading, fetchUser]);

	// Redirect to login if no tokens available
	useEffect(() => {
		if (!isLoading && !tokens && !user) {
			console.log("No tokens found, redirecting to login");
			navigate("/login");
		}
	}, [tokens, user, isLoading, navigate]);

	const dashboardPath = location.pathname.startsWith("/dashboard")
		? location.pathname.replace(/^\/dashboard\/?/, "")
		: "";

	const crumbs = dashboardPath.split("/").filter(Boolean);

	// Generate page title from breadcrumbs
	const pageTitle = crumbs.length > 0
		? crumbs.map(crumb => decodeURIComponent(crumb).replace(/-/g, " ")).join(" > ")
		: "Dashboard";

	return isLoading ? (
		<div className="flex justify-center items-center min-h-screen bg-background">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
				className="text-center"
			>
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
				<p className="text-sm text-muted-foreground">
					Memuat dashboard...
				</p>
			</motion.div>
		</div>
	) : (
		<>
			<Helmet>
				<title>{`${pageTitle} - Pustaka Karya`}</title>
				<meta
					name="description"
					content="Dashboard untuk Pustaka Karya"
				/>
			</Helmet>
			<SidebarProvider>
				<div className="flex min-h-screen w-full overflow-hidden">
					<AppSidebar />
					<SidebarInset className="flex-1 overflow-x-hidden">
						{/* Desktop Header (h-16) */}
						<header className="hidden md:flex sticky top-0 z-10 h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
							<div className="flex items-center gap-2 px-4 w-full justify-between">
								<div className="flex items-center gap-2 min-w-0">
									<SidebarTrigger className="-ml-1" />
									<Separator
										orientation="vertical"
										className="mr-2 h-4"
									/>
									<Breadcrumb>
										<BreadcrumbList>
											<BreadcrumbItem>
												<BreadcrumbLink href="/dashboard">
													Dashboard
												</BreadcrumbLink>
											</BreadcrumbItem>
											{crumbs.map((crumb, idx) => (
												<React.Fragment key={idx}>
													<BreadcrumbSeparator />
													<BreadcrumbItem>
														{idx ===
														crumbs.length - 1 ? (
															<BreadcrumbPage className="capitalize">
																{decodeURIComponent(
																	crumb,
																).replace(
																	/-/g,
																	" ",
																)}
															</BreadcrumbPage>
														) : (
															<BreadcrumbLink
																href={`/dashboard/${crumbs.slice(0, idx + 1).join("/")}`}
																className="capitalize"
															>
																{decodeURIComponent(
																	crumb,
																).replace(
																	/-/g,
																	" ",
																)}
															</BreadcrumbLink>
														)}
													</BreadcrumbItem>
												</React.Fragment>
											))}
										</BreadcrumbList>
									</Breadcrumb>
								</div>
							</div>
						</header>

						{/* Mobile Header (h-14) */}
						<header className="md:hidden sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
							<div className="flex items-center gap-2 px-4 w-full overflow-x-auto">
								<SidebarTrigger className="-ml-1 shrink-0" />
								<Separator
									orientation="vertical"
									className="mr-1 h-4 shrink-0"
								/>
								{/* Mobile breadcrumb with ChevronRight separators */}
								<div className="flex items-center gap-1 min-w-max text-sm">
									<span className="text-foreground font-medium capitalize">Dashboard</span>
									{crumbs.map((crumb, idx) => (
										<React.Fragment key={idx}>
											<ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
											<span className="text-foreground capitalize whitespace-nowrap">
												{decodeURIComponent(crumb).replace(
													/-/g,
													" ",
												)}
											</span>
										</React.Fragment>
									))}
								</div>
							</div>
						</header>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, ease: "easeOut" }}
							className="flex flex-1 flex-col gap-6 p-6 overflow-x-hidden"
						>
							<Outlet />
						</motion.div>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</>
	);
}
