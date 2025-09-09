import { useState } from "react";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");

export const useEmailValidation = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

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
      validateEmail(value);
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
  };
};
