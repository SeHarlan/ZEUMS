import { useState, useCallback } from "react";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { useDebounce } from "./useDebounce";
import axios from "axios";
import { USER_USERNAME_ROUTE } from "@/constants/serverRoutes";
import { handleClientError } from "@/utils/handleError";
import { isUsernameBanned } from "@/constants/bannedUsernames";

const DEBOUNCE_TIME = 500;

const usernameSchema = z
  .string()
  .min(2, {
    message: "Username must be at least 2 characters.",
  })
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message:
      "Username can only contain letters, numbers, underscores, and hyphens.",
  })
  .superRefine((val, ctx) => { 
    // Check if username is banned
    if (isUsernameBanned(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "This username is reserved and cannot be used. Please choose a different username.",
      });
      return;
    }

    if (val.length > 30) {
      let isWalletAddress = false;
      try { 
        //allow default username (wallet address)
        isWalletAddress = PublicKey.isOnCurve(val);
      } catch {
        isWalletAddress = false;
      }

      if (!isWalletAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 30,
          type: "string",
          inclusive: true,
          message: "Username must not exceed 30 characters.",
        });
      }
    }
  });

export const useUsernameValidation = (initUsername?: string) => {
  const [username, setUsername] = useState(initUsername || "");
  const [error, setError] = useState<string | null>(null);

  const checkUsernameUniqueness = useCallback(async (value: string) => {
    try {
      const response = await axios.post<{ isUnique: boolean; error?: string }>(USER_USERNAME_ROUTE, {
        username: value.toLowerCase(), // Normalize to lowercase for consistency
      });
      
      if (!response.data.isUnique) {
        // Use server error message if available, otherwise default message
        setError(response.data.error || "Username is already taken");
        return false;
      } else {
        // Clear error if username is unique and no other validation errors
        setError(null);
        return true;
      }
    } catch (err) {
      handleClientError({
        error: err,
        location: "useUsernameValidation_checkUsernameUniqueness",
      });
      setError("Failed to check username availability");
      return false;
    }
  }, []);

  const debouncedCheckUniqueness = useDebounce(checkUsernameUniqueness, DEBOUNCE_TIME);

  const validateUsername = (value: string) => {
    try {
      usernameSchema.parse(value);
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (value) {
      const isValidFormat = validateUsername(value);
      // Only check uniqueness if basic validation passes
      if (isValidFormat) {
        debouncedCheckUniqueness(value);
      }
    } else {
      setError(null);
    }
  };

  const isValid = !error && username.length > 0;

  return {
    username,
    setUsername: handleUsernameChange,
    error,
    isValid,
    validateUsername,
    checkUsernameUniqueness
  };
};
