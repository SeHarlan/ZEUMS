"use client";

import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/ui-utils";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { FC, useEffect, useMemo, useRef, useState } from "react";

interface GoogleFont {
  family: string;
  category: string;
}

interface GoogleFontsResponse {
  items: GoogleFont[];
}

interface FontPickerInlineProps {
  value: string;
  onChange: (font: string) => void;
  label: string;
  description?: string;
  defaultFont?: string;
}

const GOOGLE_FONTS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY || "";

const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily) return;

  const encodedFont = encodeURIComponent(fontFamily);
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700&display=swap`;
  const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
  if (existingLink) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = fontUrl;
  document.head.appendChild(link);
};

const FontPickerInline: FC<FontPickerInlineProps> = ({
  value,
  onChange,
  label,
  description,
  defaultFont = "Default",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayValue = value || defaultFont;

  useEffect(() => {
    loadGoogleFont(displayValue);
  }, [displayValue]);

  useEffect(() => {
    const fetchFonts = async () => {
      if (fonts.length > 0) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch fonts");
        }

        const data: GoogleFontsResponse = await response.json();
        setFonts(data.items);
      } catch (err) {
        console.error("Error fetching fonts:", err);
        setError("Failed to load fonts. Please check your API key.");
      } finally {
        setLoading(false);
      }
    };

    if (open && GOOGLE_FONTS_API_KEY) {
      fetchFonts();
    }
  }, [open, fonts.length]);

  const filteredFonts = useMemo(() => {
    if (!search) return fonts.slice(0, 100);
    return fonts
      .filter((font) =>
        font.family.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 50);
  }, [fonts, search]);

  const loadedFontsRef = useRef(new Set<string>());
  useEffect(() => {
    if (!open || loading || filteredFonts.length === 0) return;

    const fontsToLoad = filteredFonts.filter(
      (f) => !loadedFontsRef.current.has(f.family)
    );
    if (fontsToLoad.length === 0) return;

    const batchSize = 20;
    for (let i = 0; i < fontsToLoad.length; i += batchSize) {
      const batch = fontsToLoad.slice(i, i + batchSize);
      const families = batch
        .map((f) => `family=${encodeURIComponent(f.family)}:wght@400`)
        .join("&");

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
      document.head.appendChild(link);

      batch.forEach((f) => loadedFontsRef.current.add(f.family));
    }
  }, [open, loading, filteredFonts]);

  return (
    <div className="w-full min-w-0 space-y-2 overflow-x-hidden">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium leading-none">{label}</label>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() => onChange("")}
          disabled={!value}
          aria-label={`Clear ${label}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full min-w-0 justify-between font-normal"
      >
        <span className="truncate text-left" style={{ fontFamily: displayValue }}>
          {displayValue}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 opacity-60 transition-transform", open && "rotate-180")}
        />
      </Button>

      {description && <P className="text-sm text-muted-foreground">{description}</P>}

      {open && (
        <div className="w-full min-w-0 space-y-2 rounded-md border p-2 overflow-x-hidden">
          <Input
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {error && (
            <div className="p-2 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="max-h-[min(38dvh,16rem)] overflow-y-auto overflow-x-hidden space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <P className="ml-2 text-muted-foreground">Loading fonts...</P>
              </div>
            ) : filteredFonts.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No fonts found.
              </div>
            ) : (
              filteredFonts.map((font) => (
                <button
                  type="button"
                  key={font.family}
                  onClick={() => {
                    onChange(font.family);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full min-w-0 rounded-sm px-2 py-1.5 text-left text-sm flex items-center gap-2",
                    "hover:bg-accent hover:text-accent-foreground",
                    value === font.family && "bg-accent text-accent-foreground"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === font.family ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1 truncate" style={{ fontFamily: font.family }}>
                    {font.family}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 max-w-20 truncate">
                    {font.category}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontPickerInline;
