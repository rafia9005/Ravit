import { Loader2 } from "lucide-react";

export function Spinner({
	size = 24,
	className = "",
}: {
	size?: number;
	className?: string;
}) {
	return (
		<span
			className={`inline-flex items-center justify-center animate-spin ${className}`}
		>
			<Loader2 size={size} strokeWidth={2.2} />
			<span className="sr-only">Loading...</span>
		</span>
	);
}