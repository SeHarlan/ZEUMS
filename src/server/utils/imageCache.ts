import { createHash } from "crypto";

/**
 * Image format types for cache keys
 */
export type ImageFormat = "avif" | "webp" | "jpeg" | "gif";

/**
 * Parameters for generating a cache key
 */
export interface CacheKeyParams {
  src: string;
  width?: number;
  format?: ImageFormat;
  quality?: number;
}

/**
 * Generate a deterministic cache key from image parameters
 * Format: thumb/{hashPrefix}/{hash}.{format}
 * 
 * @param params - Image parameters
 * @returns Cache key string
 */
export function generateCacheKey(params: CacheKeyParams): string {
  const { src, width, format = "jpeg", quality } = params;
  
  // Create a deterministic string from all parameters
  const keyString = `${src}|w:${width ?? "none"}|f:${format}|q:${quality ?? "none"}`;
  
  // Generate SHA-256 hash
  const hash = createHash("sha256").update(keyString).digest("hex");
  
  // Use first 2 chars for directory structure (better distribution)
  const prefix = hash.substring(0, 2);
  const rest = hash.substring(2);
  
  // Return path like: thumb/3f/3f212.../w256.avif
  const widthSuffix = width ? `w${width}` : "original";
  return `thumb/${prefix}/${rest}/${widthSuffix}.${format}`;
}

/**
 * Extract format from Accept header or default
 */
export function getFormatFromAccept(accept: string | null): ImageFormat {
  if (!accept) return "jpeg";
  
  if (accept.includes("image/avif")) return "avif";
  if (accept.includes("image/webp")) return "webp";
  if (accept.includes("image/gif")) return "gif";
  
  return "jpeg";
}

/**
 * Get MIME type from format
 */
export function getMimeType(format: ImageFormat): string {
  switch (format) {
    case "avif":
      return "image/avif";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "jpeg":
    default:
      return "image/jpeg";
  }
}
