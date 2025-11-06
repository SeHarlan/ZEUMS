//matches tailwind default breakpoints
export const SM_BREAKPOINT = 640 as const;
export const MD_BREAKPOINT = 768 as const;
export const LG_BREAKPOINT = 1024 as const;
export const XL_BREAKPOINT = 1280 as const;
export const TWO_XL_BREAKPOINT = 1536 as const;

export const MAX_SIZE_DIVISOR = 4 as const;


export const BANNER_RATIO = 3 / 1;
export const BANNER_RATIO_MOBILE = 3/2;
export const imageSizing = {
  thumbnail: 180,
  sm: SM_BREAKPOINT,
  md: MD_BREAKPOINT,
  lg: LG_BREAKPOINT,
  xl: XL_BREAKPOINT,
  "2xl": TWO_XL_BREAKPOINT,
} as const;
export type ImageSizing = keyof typeof imageSizing;

export const MAIN_SCROLL_AREA_ID = "main-scroll-area";

export const NON_MEDIA_ASPECT_RATIO = 1;
