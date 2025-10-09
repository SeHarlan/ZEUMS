"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";


//matches tailwind default breakpoints
export const SM_BREAKPOINT = 640 as const;
export const MD_BREAKPOINT = 768 as const;
export const LG_BREAKPOINT = 1024 as const;
export const XL_BREAKPOINT = 1280 as const;
export const TWO_XL_BREAKPOINT = 1536 as const;

const breakpoints = {
  isSm: `(min-width: ${SM_BREAKPOINT}px)`,
  isMd: `(min-width: ${MD_BREAKPOINT}px)`,
  isLg: `(min-width: ${LG_BREAKPOINT}px)`,
  isXl: `(min-width: ${XL_BREAKPOINT}px)`,
  is2Xl: `(min-width: ${TWO_XL_BREAKPOINT}px)`,
} as const;

const initialBreakpoints = typeof window == "undefined" ? {
  isSm: false,
  isMd: false,
  isLg: false,
  isXl: false,
  is2Xl: false,
} : {
  isSm: window.matchMedia(breakpoints.isSm).matches,
  isMd: window.matchMedia(breakpoints.isMd).matches,
  isLg: window.matchMedia(breakpoints.isLg).matches,
  isXl: window.matchMedia(breakpoints.isXl).matches,
  is2Xl: window.matchMedia(breakpoints.is2Xl).matches,
}

type ResponsiveContextType = {
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;
};

const ResponsiveContext = createContext<ResponsiveContextType>(initialBreakpoints);

export function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  const [bp, setBp] = useState<ResponsiveContextType>(initialBreakpoints);
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mediaQueries = Object.entries(breakpoints).map(([key, breakpoint]) => {
      return {
        key,
        mq: window.matchMedia(breakpoint),
      };
    });

    const handlers = mediaQueries.map(({ key, mq }) => {
      return {
        mq,
        handler: () => {
          setBp((prevBp) => ({ ...prevBp, [key]: mq.matches }));
        },
      };
    });

    handlers.forEach(({ mq, handler }) => {
      mq.addEventListener("change", handler);
    });

    return () => {
      handlers.forEach(({ mq, handler }) => {
        mq.removeEventListener("change", handler);
      });
    };
  }, []);

  const value = useMemo(() => bp, [bp]);
  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useBreakpoints() {
  const context = useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error("useBreakpoints must be used within a ResponsiveProvider");
  }
  return context;
}
