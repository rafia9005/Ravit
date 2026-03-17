import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ThemeButtonProps {
	variant?: "default" | "rounded";
}

export function ThemeButton({ variant = "default" }: ThemeButtonProps) {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const isDarkMode = document.documentElement.classList.contains("dark");
		setIsDark(isDarkMode);
	}, []);

	const toggleTheme = () => {
		const html = document.documentElement;
		if (html.classList.contains("dark")) {
			html.classList.remove("dark");
			localStorage.setItem("theme", "light");
			setIsDark(false);
		} else {
			html.classList.add("dark");
			localStorage.setItem("theme", "dark");
			setIsDark(true);
		}
	};

	if (variant === "rounded") {
		return (
			<button
				onClick={toggleTheme}
				className="h-9 w-9 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
				title="Toggle theme"
			>
				{isDark ? (
					<Sun className="h-4 w-4" />
				) : (
					<Moon className="h-4 w-4" />
				)}
			</button>
		);
	}

	return (
		<Button
			onClick={toggleTheme}
			variant="outline"
			size="icon"
			title="Toggle theme"
		>
			{isDark ? (
				<Sun className="h-4 w-4" />
			) : (
				<Moon className="h-4 w-4" />
			)}
		</Button>
	);
}
