"use client";

import { useEffect } from "react";

/**
 * DynamicFontLoader
 *
 * Loads Google Fonts dynamically and applies them to timeline and gallery content areas.
 *
 * - Heading font applies to elements with .font-serif class (H1-H4 headings)
 * - Body font applies to all other text within .timeline-content and .gallery-content containers
 *
 * To exclude UI elements from custom fonts, add the .no-custom-font class:
 * @example
 * <button className="no-custom-font">This button keeps default fonts</button>
 */

interface DynamicFontLoaderProps {
  headingFont?: string | null;
  bodyFont?: string | null;
}

export function DynamicFontLoader({ headingFont, bodyFont }: DynamicFontLoaderProps) {
  useEffect(() => {
    const loadFont = async (fontFamily: string, weights: number[]) => {
      // Create link tag for the font
      const linkId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
      let link = document.getElementById(linkId) as HTMLLinkElement;

      if (!link) {
        const weightsParam = weights.join(';');
        const encodedFont = encodeURIComponent(fontFamily);
        const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@${weightsParam}&display=swap`;

        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);

        // Wait for font to load using CSS Font Loading API
        try {
          await Promise.all(
            weights.map(weight =>
              document.fonts.load(`${weight} 1em "${fontFamily}"`)
            )
          );
        } catch (error) {
          console.warn(`Failed to load font: ${fontFamily}`, error);
        }
      }
    };

    const applyStyles = () => {
      // Remove existing style tag
      const existingStyle = document.getElementById('dynamic-fonts-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const style = document.createElement('style');
      style.id = 'dynamic-fonts-style';

      let cssContent = '';

      // Apply body font as the base font for all content areas
      if (bodyFont && bodyFont.trim() !== "") {
        cssContent += `
          .timeline-content,
          .gallery-content {
            font-family: "${bodyFont}", ui-sans-serif, system-ui, sans-serif !important;
          }
        `;
      }

      // Apply heading font to elements with .font-serif class (H1-H4 components use this)
      if (headingFont && headingFont.trim() !== "") {
        cssContent += `
          .timeline-content .font-serif,
          .gallery-content .font-serif {
            font-family: "${headingFont}", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
          }
        `;
      }

      // Reset rule for excluded elements - MUST come last for cascade priority
      // High specificity selectors to override both body and heading fonts
      cssContent += `
        .no-custom-font,
        .no-custom-font *,
        .timeline-content .no-custom-font,
        .timeline-content .no-custom-font *,
        .gallery-content .no-custom-font,
        .gallery-content .no-custom-font *,
        .timeline-content .no-custom-font.font-serif,
        .timeline-content .no-custom-font .font-serif,
        .gallery-content .no-custom-font.font-serif,
        .gallery-content .no-custom-font .font-serif {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }
      `;

      if (cssContent) {
        style.textContent = cssContent;
        document.head.appendChild(style);
      }
    };

    // Load fonts and then apply styles
    const loadFonts = async () => {
      const promises: Promise<void>[] = [];

      if (headingFont && headingFont.trim() !== "") {
        promises.push(loadFont(headingFont.trim(), [400, 500, 600, 700]));
      }

      if (bodyFont && bodyFont.trim() !== "") {
        promises.push(loadFont(bodyFont.trim(), [300, 400, 500]));
      }

      await Promise.all(promises);
      applyStyles();
    };

    loadFonts();

    return () => {
      const styleToRemove = document.getElementById('dynamic-fonts-style');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [headingFont, bodyFont]);

  return null;
}
