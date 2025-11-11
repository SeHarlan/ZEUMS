import { EntryTypes } from "@/types/entry";
import { z } from "zod";
import { urlSchema } from "./urlSchema";

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
        url: urlSchema,
      })
    )
    .max(3, {
      message: "You can add up to 3 buttons.",
    }),
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;