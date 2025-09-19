import { z } from "zod";

export const urlSchema = z
  .string()
  .min(1, {
    message: "URL is required.",
  })
  .refine(
    (value) => {
      // Check if it has a domain (contains at least one dot)
      if (!value.includes(".")) {
        return false;
      }

      // Add https:// if no protocol is specified
      const urlWithProtocol =
        value.startsWith("http://") || value.startsWith("https://")
          ? value
          : `https://${value}`;

      // Use URL constructor to validate the complete URL structure
      try {
        const url = new URL(urlWithProtocol);
        // We already checked for domain above, just ensure URL is valid
        return url.hostname.length > 0;
      } catch {
        return false;
      }
    },
    {
      message: "Please enter a valid URL with a domain (e.g., example.com).",
    }
  );
  