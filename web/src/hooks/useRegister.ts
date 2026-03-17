import { useState } from "react";
import authService from "../services/auth.service";
import type { RegisterInput } from "../validations/auth";

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (data: Omit<RegisterInput, "confirmPassword">) => {
    try {
      console.log("[useRegister] Starting registration request");
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await authService.register(data);
      
      // Set success message dari API response
      if (response.message) {
        console.log("[useRegister] Setting success message:", response.message);
        setSuccessMessage(response.message);
      }
      
      // Don't auto-login - user needs to login manually
      return response;
    } catch (err) {
      // Set error message dari API response
      const errorMessage = err instanceof Error ? err.message : "Registrasi gagal";
      setError(errorMessage);
      throw err;
    } finally {
      console.log("[useRegister] Setting isLoading to false");
      setIsLoading(false);
    }
  };

  return { handleRegister, isLoading, error, successMessage };
};
