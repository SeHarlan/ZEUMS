/**
 * Encodes a gallery name for use in URLs.
 * - Spaces become single underscores (_)
 * - Existing underscores become double underscores (__)
 * 
 * Examples:
 * - "my gallery" → "my_gallery"
 * - "my_gallery" → "my__gallery"
 * - "my gallery name" → "my_gallery_name"
 * - "my_gallery name" → "my__gallery_name"
 */
export const encodeGalleryNameForUrl = (galleryName: string): string => {
  // First, escape existing underscores by replacing _ with __
  // Then replace spaces with _
  return galleryName.replaceAll("_", "__").replaceAll(" ", "_");
};

/**
 * Decodes a gallery name from URL format back to the original name.
 * - Double underscores (__) become single underscores (_)
 * - Single underscores (_) become spaces ( )
 * 
 * Examples:
 * - "my_gallery" → "my gallery"
 * - "my__gallery" → "my_gallery"
 * - "my_gallery_name" → "my gallery name"
 * - "my__gallery_name" → "my_gallery name"
 */
export const decodeGalleryNameFromUrl = (encodedName: string): string => {
  // First replace double underscores with a temporary marker
  // Then replace single underscores with spaces
  // Finally replace the temporary marker with single underscores
  return encodedName
    .replaceAll("__", "\0TEMPUNDERSCORE\0")
    .replaceAll("_", " ")
    .replaceAll("\0TEMPUNDERSCORE\0", "_");
};

