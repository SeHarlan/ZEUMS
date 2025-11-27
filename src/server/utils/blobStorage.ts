import { del, head, put } from "@vercel/blob";

const BLOB_STORE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_STORE_TOKEN) {
  console.warn("BLOB_READ_WRITE_TOKEN not set - blob storage will be disabled");
}

/**
 * Cache-Control header for immutable cached images
 */
const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";

/**
 * Upload processed image to Vercel Blob storage
 * 
 * @param key - Cache key (path in blob storage)
 * @param buffer - Image buffer to upload
 * @param contentType - MIME type of the image
 * @returns Blob URL or null if upload fails
 */
export async function uploadToBlob(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string | null> {
  if (!BLOB_STORE_TOKEN) {
    return null;
  }

  try {
    const blob = await put(key, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false, // Use deterministic keys
      cacheControlMaxAge: 31536000, // 1 year
    });

    return blob.url;
  } catch (error) {
    console.error("Failed to upload to blob storage:", error);
    return null;
  }
}

/**
 * Check if a blob exists in storage
 * 
 * @param key - Cache key to check
 * @returns Blob URL if exists, null otherwise
 */
export async function checkBlobExists(key: string): Promise<string | null> {
  if (!BLOB_STORE_TOKEN) {
    return null;
  }

  try {
    // Use head to check existence without downloading
    const blob = await head(key);
    return blob.url;
  } catch (error) {
    // Blob doesn't exist or error occurred
    return null;
  }
}

/**
 * Delete a blob from storage (for cache invalidation)
 * 
 * @param key - Cache key to delete
 */
export async function deleteBlob(key: string): Promise<void> {
  if (!BLOB_STORE_TOKEN) {
    return;
  }

  try {
    await del(key);
  } catch (error) {
    // Ignore errors for deletion (blob might not exist)
    console.error("Failed to delete blob:", error);
  }
}

/**
 * Get cache headers for blob URLs
 */
export function getBlobCacheHeaders(): Record<string, string> {
  return {
    "Cache-Control": IMMUTABLE_CACHE_CONTROL,
  };
}
