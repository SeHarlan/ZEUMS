import { z } from "zod";
// Form schema with Zod validation
export const profileDisplayFormSchema = z.object({
  // profilePicture: z.string().optional(),
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
    x: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    instagram: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    tiktok: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    facebook: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    telegram: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    discord: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
  }),
  // websites: z.array(z.string().url()).optional().transform((val) => (val === "" ? undefined : val)),
});

export type ProfileDisplayFormValues = z.infer<typeof profileDisplayFormSchema>;
