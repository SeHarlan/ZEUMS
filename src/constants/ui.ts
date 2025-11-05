import { LG_BREAKPOINT, MD_BREAKPOINT, SM_BREAKPOINT, TWO_XL_BREAKPOINT, XL_BREAKPOINT } from "@/context/ResponsiveProvider";

export const BANNER_RATIO = 3 / 1;
export const BANNER_RATIO_MOBILE = 3/2;
export const imageSizing = {
  xs: 420,
  sm: SM_BREAKPOINT,
  md: MD_BREAKPOINT,
  lg: LG_BREAKPOINT,
  xl: XL_BREAKPOINT,
  "2xl": TWO_XL_BREAKPOINT,
} as const;
export type ImageSizing = keyof typeof imageSizing;

export const MAIN_SCROLL_AREA_ID = "main-scroll-area";

export const NON_MEDIA_ASPECT_RATIO = 1;
