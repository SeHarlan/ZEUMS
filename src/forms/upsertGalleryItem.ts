import { GalleryItemTypes } from "@/types/galleryItem";
import { z } from "zod";
import { urlSchema } from "./urlSchema";

// Form schema with Zod validation
export const galleryItemFormSchema = z.object({
  itemType: z.nativeEnum(GalleryItemTypes),
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
  buttons: z
    .array(
      z.object({
        text: z.string().min(1, {
          message: "Button text is required.",
        }),
        url: urlSchema
      })
    )
    .max(3, {
      message: "You can add up to 3 buttons.",
    }),
});

export type GalleryItemFormValues = z.infer<typeof galleryItemFormSchema>;