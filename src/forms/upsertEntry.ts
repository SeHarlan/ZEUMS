import { EntryTypes } from "@/types/entry";
import { z } from "zod";

// Form schema with Zod validation
export const entryFormSchema = z.object({
  entryType: z.nativeEnum(EntryTypes),
  title: z
    .string()
    .max(100, {
      message: "Title must not exceed 100 characters.",
    })
    .or(z.literal(""))
    .optional(),
  description: z
    .string()
    .max(1000, {
      message: "Description must not exceed 1000 characters.",
    })
    .or(z.literal(""))
    .optional(),
  date: z.date({
    message: "Please enter a valid date.",
  }),
  buttons: z
    .array(
      z.object({
        text: z.string().min(1, {
          message: "Button text is required.",
        }),
        url: z
          .string()
          .min(1, {
            message: "URL is required.",
          })
          .refine(
            (value) => {
              // Check if it has a domain (contains at least one dot)
              if (!value.includes('.')) {
                return false;
              }
              
              // Add https:// if no protocol is specified
              const urlWithProtocol = value.startsWith('http://') || value.startsWith('https://') 
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
          ),
      })
    )
    .max(3, {
      message: "You can add up to 3 buttons.",
    })
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;