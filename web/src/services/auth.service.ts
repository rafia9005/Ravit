import Fetch from "../lib/fetch";
import type { LoginInput, RegisterInput } from "../validations/auth";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  message: string;
  error: string;
  data: {
    user: AuthUser;
    token: AuthTokens;
  };
}

export interface RegisterResponse {
  message: string;
  error: string;
  data: {
    user: AuthUser;
  };
}

export interface RefreshTokenResponse {
  message: string;
  error: string;
  data: {
    token: AuthTokens;
  };
}

export interface OAuthLoginResponse {
  url: string;
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const response = await Fetch.post<AuthResponse>("/auth/login", {
        email: input.email,
        password: input.password,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user
   */
  async register(input: Omit<RegisterInput, "confirmPassword">): Promise<RegisterResponse> {
    try {
      const response = await Fetch.post<RegisterResponse>("/auth/register", {
        name: input.name,
        email: input.email,
        password: input.password,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await Fetch.post<RefreshTokenResponse>("/auth/refresh", {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await Fetch.post<{ success: boolean; message: string }>(
        "/auth/logout",
        {}
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile from server
   */
  async getCurrentUser(): Promise<{ message: string; error: string; data: AuthUser }> {
    try {
      const response = await Fetch.get<{ message: string; error: string; data: AuthUser }>("/users/me");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get OAuth login URL for Google
   */
  async getGoogleOAuthURL(): Promise<OAuthLoginResponse> {
    try {
      const response = await Fetch.get<OAuthLoginResponse>("/oauth/google/login");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get OAuth login URL for GitHub
   */
  async getGitHubOAuthURL(): Promise<OAuthLoginResponse> {
    try {
      const response = await Fetch.get<OAuthLoginResponse>("/oauth/github/login");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): Error {
    // Handle axios error responses
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as any).response;
      
      // Try to get error message from different response fields
       const message =
         response?.data?.error || // First try error field from backend
         response?.data?.message || // Then try message field
         (response as any)?.statusText || // Then try statusText
         "An error occurred";
      
      return new Error(message);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error("An unknown error occurred");
  }
}

export default new AuthService();
