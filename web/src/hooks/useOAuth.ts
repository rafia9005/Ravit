import { useState } from "react";
import Fetch from "../lib/fetch";

interface OAuthLoginResponse {
  url: string;
}

type OAuthProvider = "google" | "github";
type OAuthMode = "login" | "register";

export const useOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider, mode: OAuthMode = "login") => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`[useOAuth] Fetching ${provider} OAuth URL for mode: ${mode}`);

      // Fetch OAuth URL from backend with mode parameter
      const response = await Fetch.get<OAuthLoginResponse>(
        `/oauth/${provider}/login?mode=${mode}`
      );

      const oauthUrl = response.data.url;
      console.log(`[useOAuth] Received ${provider} OAuth URL, redirecting...`);

      // Redirect to OAuth provider
      window.location.href = oauthUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${provider} login gagal`;
      console.error(`[useOAuth] ${provider} login error:`, errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const loginWithGoogle = (mode: OAuthMode = "login") => handleOAuthLogin("google", mode);
  const loginWithGitHub = (mode: OAuthMode = "login") => handleOAuthLogin("github", mode);

  return {
    loginWithGoogle,
    loginWithGitHub,
    isLoading,
    error,
  };
};
