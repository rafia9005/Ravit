import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/elements/spinner";

export default function Logout() {
	const navigate = useNavigate();

	useEffect(() => {
		const timeout = setTimeout(() => {
			navigate("/login");
		}, 2000);

		return () => clearTimeout(timeout);
	}, [navigate]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<Spinner size={32} />
		</div>
	);
}