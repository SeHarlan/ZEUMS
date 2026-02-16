import { z } from "zod";

const backgroundTintHexSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color like #112233");

const googleFontNameSchema = z
  .string()
  .max(100, "Font name must be 100 characters or less")
  .optional()
  .or(z.literal(""));

// Form schema with Zod validation for gallery creation and settings
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
  useCustomBackgroundSettings: z.boolean().optional(),
  galleryTheme: z.enum(["light", "dark"]).optional(),
  backgroundTintHex: backgroundTintHexSchema.optional(),
  backgroundTintOpacity: z.number().min(0).max(1).optional(),
  backgroundBlur: z.number().min(0).max(40).optional(),
  backgroundTileCount: z.string().optional(),
  galleryHeadingFont: googleFontNameSchema,
  galleryBodyFont: googleFontNameSchema,
});

export type UpsertGalleryFormValues = z.infer<typeof upsertGalleryFormSchema>;
