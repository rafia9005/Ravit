import { useState } from "react";
import { useAuth } from "./useAuth";
import authService from "../services/auth.service";
import type { LoginInput } from "../validations/auth";

export const useLogin = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await authService.login(data);
      
      // Set success message dari API response
      if (response.message) {
        console.log("[useLogin] Setting success message:", response.message);
        setSuccessMessage(response.message);
      }
      
      console.log("[useLogin] Calling login() to update auth context");
      login(response.data.user, response.data.token);
      return response;
    } catch (err) {
      // Set error message dari API response
      const errorMessage = err instanceof Error ? err.message : "Login gagal";
      setError(errorMessage);
      throw err;
    } finally {
      console.log("[useLogin] Setting isLoading to false");
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error, successMessage };
};
