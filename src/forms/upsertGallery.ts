import { z } from "zod";

// Form schema with Zod validation for gallery creation
export const upsertGalleryFormSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Title is required.",
    })
    .max(100, {
      message: "Title must not exceed 100 characters.",
    }),
  description: z
    .string()
    .max(1000, {
      message: "Description must not exceed 1000 characters.",
    })
    .or(z.literal(""))
    .optional(),
  hideItemTitles: z.boolean().optional(),
  hideItemDescriptions: z.boolean().optional(),
});

export type UpsertGalleryFormValues = z.infer<typeof upsertGalleryFormSchema>;
