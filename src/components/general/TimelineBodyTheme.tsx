"use client";

import { useEffect } from "react";

const BODY_DARK_CLASS = "dark";

export type TimelineTheme = "light" | "dark" | undefined;

interface TimelineBodyThemeProps {
  /** When "dark", adds .dark to document.body; otherwise removes it. On unmount (navigate away), removes .dark. */
  theme: TimelineTheme;
}

/**
 * Syncs timeline theme to body level. Mount only on pages where timeline theme applies
 * (public timeline, dashboard timeline). On unmount, restores default (light) theme.
 */
export function TimelineBodyTheme({ theme }: TimelineBodyThemeProps) {
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add(BODY_DARK_CLASS);
    } else {
      document.body.classList.remove(BODY_DARK_CLASS);
    }
    return () => {
      document.body.classList.remove(BODY_DARK_CLASS);
    };
  }, [theme]);

  return null;
}
