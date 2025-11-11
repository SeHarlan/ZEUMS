import { EntrySource } from "@/types/entry";
import { z } from "zod";
import { optionalUrlSchema } from "./urlSchema";

// Helper function to validate social media handles (not URLs)
const validateSocialHandle = (value: string | undefined) => {
  if (!value || value === "") return true; // Allow empty values
  
  // Check for common domain extensions
  const domainExtensions = ['.com', '.org', '.net', '.io', '.gg', '.me', '.co'];
  if (domainExtensions.some(ext => value.toLowerCase().includes(ext))) {
    return false;
  }
  
  // Check for characters that wouldn't be in usernames
  const invalidChars = ['/', '\\', ':', '?', '#', '&', '=', '+', '@', ' '];
  if (invalidChars.some(char => value.includes(char))) {
    return false;
  }
  
  return true;
};

// Reusable social media handle schema
const socialHandleSchema = z
  .string()
  .optional()
  .refine(validateSocialHandle, {
    message: "Please enter just the handle (e.g., 'username'). No URLs, domains, or special characters like /, :, @",
  })
  .transform((val) => (val === "" ? undefined : val));

// Form schema with Zod validation
export const profileDisplayFormSchema = z.object({
  displayName: z
    .string()
    .min(2, {
      message: "Display name must be at least 2 characters.",
    })
    .or(z.literal(""))
    .optional(),
  bio: z
    .string()
    .max(500, {
      message: "Bio must not exceed 500 characters.",
    })
    .or(z.literal(""))
    .optional(),
  socialHandles: z.object({
    x: socialHandleSchema,
    instagram: socialHandleSchema,
    tiktok: socialHandleSchema,
    telegram: socialHandleSchema,
    discord: socialHandleSchema,
    website: optionalUrlSchema,
    // facebook: socialHandleSchema,
  }),
  primaryTimeline: z.nativeEnum(EntrySource),
  hideCreatorDates: z.boolean().optional(),
  hideCollectorDates: z.boolean().optional(),
  // websites: z.array(z.string().url()).optional().transform((val) => (val === "" ? undefined : val)),
});

export type ProfileDisplayFormValues = z.infer<typeof profileDisplayFormSchema>;
