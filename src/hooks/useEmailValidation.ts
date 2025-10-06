import { useState, useCallback } from "react";
import { z } from "zod";
import axios from "axios";
import { USER_EMAIL_ROUTE } from "@/constants/serverRoutes";
import { handleClientError } from "@/utils/handleError";
import { useDebounce } from "./useDebounce";

const emailSchema = z.string().email("Invalid email address");
const DEBOUNCE_TIME = 500;

interface UseEmailValidationOptions { 
  /** optional check for uniqueness in the AuthUser or User collection */
  uniquenessCheck?: "AuthUser" | "User"
}

export const useEmailValidation = (
  initEmail?: string,
  options: UseEmailValidationOptions = {}
) => {
  const [email, setEmail] = useState(initEmail || "");
  const [error, setError] = useState<string | null>(null);

  const { uniquenessCheck } = options;

  const checkEmailUniqueness = useCallback(async (value: string) => {
    if (!uniquenessCheck) return true;

    try {
      const response = await axios.post<{ isUnique: boolean }>(USER_EMAIL_ROUTE, {
        email: value,
        collection: uniquenessCheck,
      });
      
      if (!response.data.isUnique) {
        setError("Email is already associated with another account");
        return false;
      } else {
        // Clear error if email is unique and no other validation errors
        setError(null);
        return true;
      }
    } catch (err) {
      handleClientError({
        error: err,
        location: "useEmailValidation_checkEmailUniqueness",
      });
      setError("Failed to check email availability");
      return false;
    }
  }, [uniquenessCheck]);

  const debouncedCheckUniqueness = useDebounce(checkEmailUniqueness, DEBOUNCE_TIME);

  const validateEmail = (value: string) => {
    try {
      emailSchema.parse(value);
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      const isValidFormat = validateEmail(value);
      // Only check uniqueness if basic validation passes and uniqueness check is enabled
      if (isValidFormat && uniquenessCheck) {
        debouncedCheckUniqueness(value);
      }
    } else {
      setError(null);
    }
  };

  return {
    email,
    setEmail: handleEmailChange,
    error,
    isValid: !error && email.length > 0,
    validateEmail,
    checkEmailUniqueness
  };
};
