import axios, { type AxiosInstance } from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

// Event handler for token updates
let tokenUpdateCallback: ((tokens: { access_token: string; refresh_token: string }) => void) | null = null;

export function setTokenUpdateCallback(
	callback: (tokens: { access_token: string; refresh_token: string }) => void
) {
	tokenUpdateCallback = callback;
}

const Fetch = axios.create({
	baseURL: `${import.meta.env.VITE_API}/api/v1`,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
}) as AxiosInstance;

// Request interceptor to add access token
Fetch.interceptors.request.use(
	(config) => {
		const token = cookies.get("accessToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor to handle token refresh
Fetch.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;
		console.log("[Fetch interceptor] Error response:", {
			status: error.response?.status,
			url: originalRequest?.url,
			hasRetry: originalRequest?._retry
		});

		// Skip token refresh for auth endpoints (login, register, refresh)
		const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
		const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest?.url?.includes(endpoint));
		
		if (isAuthEndpoint) {
			console.log("[Fetch interceptor] Auth endpoint error, skipping token refresh");
			return Promise.reject(error);
		}

		// If error is 401 and not already retried
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = cookies.get("refreshToken");
				if (!refreshToken) {
					// No refresh token available, redirect to login
					window.location.href = "/login";
					return Promise.reject(error);
				}

				// Call refresh token endpoint
				const response = await axios.post(
					`${import.meta.env.VITE_API}/api/v1/auth/refresh`,
					{
						refresh_token: refreshToken,
					}
				);

				// Extract tokens from response
				// Response format: { data: { token: { access_token, refresh_token } }, message, error }
				const { token } = response.data.data;

				if (!token?.access_token) {
					throw new Error("Invalid token response format");
				}

			// Update cookies with new tokens
			cookies.set("accessToken", token.access_token, { path: "/" });
			cookies.set("refreshToken", token.refresh_token, { path: "/" });
			cookies.set("tokenType", token.token_type, { path: "/" });
			cookies.set("expiresIn", token.expires_in, { path: "/" });

			// Notify AuthProvider about token update
			if (tokenUpdateCallback) {
				tokenUpdateCallback({
					access_token: token.access_token,
					refresh_token: token.refresh_token,
				});
			}

			// Retry original request with new token
			originalRequest.headers.Authorization = `Bearer ${token.access_token}`;
			return Fetch(originalRequest);
			} catch (refreshError) {
				// Refresh failed, redirect to login
				console.log("[Fetch interceptor] Token refresh failed, redirecting to login");
				cookies.remove("accessToken", { path: "/" });
				cookies.remove("refreshToken", { path: "/" });
				window.location.href = "/login";
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	},
);

export default Fetch;