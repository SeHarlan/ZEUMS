import { EntrySource } from "@/types/entry";
import { z } from "zod";

const backgroundTintHexSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color like #112233");

const googleFontNameSchema = z
  .string()
  .max(100, "Font name must be 100 characters or less")
  .optional()
  .or(z.literal(""));

export const timelineSettingsFormSchema = z.object({
  primaryTimeline: z.nativeEnum(EntrySource),
  hideCreatorDates: z.boolean().optional(),
  hideCollectorDates: z.boolean().optional(),
  timelineTheme: z.enum(["light", "dark"]).optional(),
  backgroundTintHex: backgroundTintHexSchema,
  backgroundTintOpacity: z.number().min(0).max(1),
  backgroundBlur: z.number().min(0).max(40),
  backgroundTileCount: z.string(),
  timelineHeadingFont: googleFontNameSchema,
  timelineBodyFont: googleFontNameSchema,
}).strict();

export type TimelineSettingsFormValues = z.infer<typeof timelineSettingsFormSchema>;

