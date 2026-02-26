"use client";

import { FC, useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { P } from "@/components/typography/Typography";
import { Check, Loader2, XIcon } from "lucide-react";
import { cn } from "@/utils/ui-utils";

interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
}

interface GoogleFontsResponse {
  items: GoogleFont[];
}

interface FontPickerDialogProps {
  value: string;
  onChange: (font: string) => void;
  label: string;
  description?: string;
}

const GOOGLE_FONTS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY || "";

// Helper to load a Google Font dynamically
const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily) return;

  const encodedFont = encodeURIComponent(fontFamily);
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700&display=swap`;

  // Check if font is already loaded
  const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
  if (existingLink) return;

  // Create and append link tag
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = fontUrl;
  document.head.appendChild(link);
};

const FontPickerDialog: FC<FontPickerDialogProps> = ({
  value,
  onChange,
  label,
  description,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local preview state - only updates form on Select
  const [previewFont, setPreviewFont] = useState(value || "Open Sans");

  const displayValue = value || "Open Sans";

  // Reset preview font when dialog opens
  useEffect(() => {
    if (open) {
      setPreviewFont(displayValue);
    }
  }, [open, displayValue]);

  // Load the preview font when it changes
  useEffect(() => {
    if (previewFont) {
      loadGoogleFont(previewFont);
    }
  }, [previewFont]);

  // Fetch fonts from Google Fonts API
  useEffect(() => {
    const fetchFonts = async () => {
      if (fonts.length > 0) return; // Already loaded

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
    if (!search) return fonts.slice(0, 100); // Show first 100 by default
    return fonts
      .filter((font) =>
        font.family.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 50); // Limit search results to 50
  }, [fonts, search]);

  // Batch-load font CSS for list preview (each font name shown in its typeface)
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

  const handleSelect = () => {
    onChange(previewFont);
    setOpen(false);
  };

  const handleCancel = () => {
    setPreviewFont(displayValue); // Reset to original value
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        <div className="flex gap-2">
          <DialogTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            >
              <span style={{ fontFamily: displayValue }}>{displayValue}</span>
            </Button>
          </DialogTrigger>
          {value && (
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => onChange("")}
              aria-label={`Clear ${label}`}
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
        {description && (
          <P className="text-sm text-muted-foreground">{description}</P>
        )}
      </div>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select {label}</DialogTitle>
          <DialogDescription>
            Choose from Google Fonts library
            {!loading && fonts.length > 0 && ` (${fonts.length} fonts available)`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <P className="ml-2 text-muted-foreground">Loading fonts...</P>
          </div>
        ) : (
          <>
            <Command className="border rounded-md">
              <CommandInput
                placeholder="Search fonts..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList className="max-h-[40vh] sm:max-h-[300px]">
                <CommandEmpty>No fonts found.</CommandEmpty>
                <CommandGroup>
                  {filteredFonts.map((font) => (
                    <CommandItem
                      key={font.family}
                      value={font.family}
                      onSelect={() => {
                        setPreviewFont(font.family);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          previewFont === font.family ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 flex items-baseline gap-2">
                        <span style={{ fontFamily: font.family }}>
                          {font.family}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {font.category}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <P className="text-xs text-muted-foreground font-medium">Preview:</P>
                <P className="text-xs text-muted-foreground">{previewFont}</P>
              </div>
              <div
                style={{ fontFamily: previewFont }}
                className="p-4 rounded-md border bg-muted/50 space-y-2"
              >
                <P className="text-2xl font-medium">The quick brown fox jumps</P>
                <P className="text-base">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                </P>
                <P className="text-base">
                  abcdefghijklmnopqrstuvwxyz 0123456789
                </P>
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={loading}>
            Select Font
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FontPickerDialog;
