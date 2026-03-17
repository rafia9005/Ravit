import { useState, useEffect, useCallback } from "react";
import { Cookies } from "react-cookie";
import { AuthContext, type AuthContextType } from "./AuthContext";
import type { AuthUser, AuthTokens } from "../services/auth.service";
import authService from "../services/auth.service";
import { setTokenUpdateCallback } from "@/lib/fetch";

interface AuthProviderProps {
  children: React.ReactNode;
}

const cookies = new Cookies();
const COOKIE_OPTIONS = { path: "/" };

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [tokens, setTokens] = useState<AuthTokens | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Sync tokens from cookies (called when tokens are refreshed externally)
	const syncTokensFromCookies = useCallback(() => {
		try {
			const accessToken = cookies.get("accessToken");
			const refreshToken = cookies.get("refreshToken");
			const tokenType = cookies.get("tokenType");
			const expiresIn = cookies.get("expiresIn");

			if (accessToken && refreshToken) {
				const tokensData: AuthTokens = {
					access_token: accessToken,
					refresh_token: refreshToken,
					token_type: tokenType || "Bearer",
					expires_in: expiresIn || 3600,
				};
				setTokens(tokensData);
				return true;
			}
			return false;
		} catch (err) {
			console.error("Failed to sync tokens from cookies:", err);
			return false;
		}
	}, []);

	// Fetch user data from server
	const fetchUser = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await authService.getCurrentUser();
			setUser(response.data);
			setError(null);
		} catch (err) {
			console.error("Failed to fetch user:", err);
			setUser(null);
			setError(err instanceof Error ? err.message : "Failed to fetch user");
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Initialize auth state from cookies on mount
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				// Sync tokens from cookies
				const hasTokens = syncTokensFromCookies();
				
				if (hasTokens) {
					// Fetch user data after tokens are loaded
					await fetchUser();
				} else {
					setIsLoading(false);
				}
			} catch (err) {
				console.error("Failed to initialize auth:", err);
				setIsLoading(false);
			}
		};

		initializeAuth();

		// Setup callback for when tokens are refreshed externally
		setTokenUpdateCallback((updatedTokens) => {
			console.log("[AuthProvider] Tokens refreshed externally, updating state");
			setTokens({
				...updatedTokens,
				token_type: "Bearer",
				expires_in: 900, // Default 15 minutes
			});
		});

		// Only run once on mount - empty dependency array
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Monitor for token changes (e.g., from token refresh in interceptor)
	useEffect(() => {
		const checkTokenUpdates = () => {
			const cookieAccessToken = cookies.get("accessToken");
			const stateAccessToken = tokens?.access_token;

			// If tokens in cookies differ from state, sync them
			if (cookieAccessToken && cookieAccessToken !== stateAccessToken) {
				console.log("[AuthProvider] Tokens updated externally, syncing from cookies");
				syncTokensFromCookies();
			}
		};

		// Check for token updates every 1 second (faster detection)
		const interval = setInterval(checkTokenUpdates, 1000);
		return () => clearInterval(interval);
	}, [tokens?.access_token, syncTokensFromCookies]);

	const login = useCallback((newUser: AuthUser, newTokens: AuthTokens) => {
		setUser(newUser);
		setTokens(newTokens);
		setError(null);

		// Persist tokens to cookies (httpOnly would be ideal, but we're on frontend)
		cookies.set("accessToken", newTokens.access_token, COOKIE_OPTIONS);
		cookies.set("refreshToken", newTokens.refresh_token, COOKIE_OPTIONS);
		cookies.set("tokenType", newTokens.token_type, COOKIE_OPTIONS);
		cookies.set("expiresIn", newTokens.expires_in, COOKIE_OPTIONS);
	}, []);

	const logout = useCallback(async () => {
		try {
			setIsLoading(true);
			// Call logout endpoint (non-critical - logout continues even if it fails)
			try {
				await authService.logout();
			} catch (err) {
				// Silently ignore logout endpoint errors - tokens will be cleared locally anyway
				console.debug("Logout endpoint error (non-critical):", err);
			}
		} finally {
			setUser(null);
			setTokens(null);
			setError(null);
			setIsLoading(false);

			// Clear cookies
			cookies.remove("accessToken", COOKIE_OPTIONS);
			cookies.remove("refreshToken", COOKIE_OPTIONS);
			cookies.remove("tokenType", COOKIE_OPTIONS);
			cookies.remove("expiresIn", COOKIE_OPTIONS);
		}
	}, []);

	const value: AuthContextType = {
		user,
		tokens,
		isLoading,
		error,
		login,
		logout,
		fetchUser,
		setError,
		setIsLoading,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};
