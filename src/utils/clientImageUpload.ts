import { API_ROUTE } from "@/constants/serverRoutes";
import { UploadCategory } from "@/constants/uploadCategories";
import { upload } from "@vercel/blob/client";

export interface UploadImageResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

/**
 * Uploads an image file directly from the client to Vercel Blob storage.
 * This performs a direct browser-to-blob upload, bypassing server request size limits.
 * 
 * @param file - The image File object to upload
 * @param key - The desired path/filename in the blob storage (e.g., "user-images/profile-123.jpg")
 * @returns Promise resolving to the upload result with blob URL and metadata
 * @throws Error if upload fails
 */
export async function clientImageUpload(
  file: File,
  key: string
): Promise<UploadImageResult> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  try {
    const blob = await upload(key, file, {
      access: "public",
      handleUploadUrl: `${API_ROUTE}/image/upload`,
    });

    // Get size from the File object
    // Note: blob.size is not available in PutBlobResult
    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: file.size,
    };
  } catch (error) {
    // Provide user-friendly error messages
    if (error instanceof Error) {
      // Check for common error scenarios
      if (error.message.includes("network") || error.message.includes("fetch")) {
        throw new Error("Network error. Please check your connection and try again.");
      }
      if (error.message.includes("unauthorized") || error.message.includes("401")) {
        throw new Error("Authentication required. Please log in and try again.");
      }
      if (error.message.includes("forbidden") || error.message.includes("403")) {
        throw new Error("You don't have permission to upload files.");
      }
      if (error.message.includes("size") || error.message.includes("too large")) {
        throw new Error("File is too large. Please choose a smaller image.");
      }
      if (error.message.includes("type") || error.message.includes("content")) {
        throw new Error("Invalid file type. Please upload an image file.");
      }
      // Return the original error message if it's already user-friendly
      throw error;
    }
    throw new Error("Failed to upload image. Please try again.");
  }
}

/**
 * Default Vercel Blob storage base URL.
 * Can be overridden via environment variable if needed.
 */
const DEFAULT_BLOB_BASE_URL = "https://p1v6uvkvzbjkuo1l.public.blob.vercel-storage.com";

/**
 * Gets the file extension from a File object, falling back to MIME type if filename doesn't have an extension.
 * 
 * @param file - The File object
 * @returns The file extension including the dot (e.g., ".jpg", ".png")
 */
export const getFileExtension = (file: File): string => {
  const fileName = file.name;
  const lastDotIndex = fileName.lastIndexOf(".");
  
  if (lastDotIndex > 0) {
    return fileName.substring(lastDotIndex);
  }
  
  // Fallback to MIME type
  if (file.type === "image/png") return ".png";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/svg+xml") return ".svg";
  if (file.type === "image/jpeg" || file.type === "image/jpg") return ".jpg";
  
  // Default to .jpg
  return ".jpg";
};

/**
 * Sanitizes a filename to prevent path traversal and other security issues.
 * Only sanitizes the filename part, not full paths.
 * 
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/^\//, "") // Remove leading slash
    .replace(/\.\./g, "") // Remove path traversal attempts (../)
    .replace(/[\/\\]/g, "-"); // Replace slashes with hyphens (prevents directory traversal)
};

/**
 * Constructs a Vercel Blob URL from a blob key.
 * 
 * @param blobKey - The full blob key (e.g., "userId/profile/filename.jpg")
 * @param baseUrl - Optional base URL. If not provided, uses default Vercel Blob domain
 * @returns The full URL to the blob
 */
export const constructVercelBlobUrl = (
  blobKey: string,
  baseUrl = DEFAULT_BLOB_BASE_URL
): string => {
  return `${baseUrl}/${blobKey}`;
};

/**
 * Constructs a blob key for user images.
 * Format: {userId}/{category}/{filename}
 * 
 * @param userId - User ID
 * @param category - Image category: "profile", "banner", "assets", etc.
 * @param filename - The filename (cdnId) - will be sanitized
 * @returns The blob key
 */
export const makeUserImageBlobKey = (
  userId: string,
  category: UploadCategory,
  filename: string
): string => {
  // Sanitize filename to prevent path traversal (userId and category are controlled)
  const sanitized = sanitizeFilename(filename);
  return `${userId}/${category}/${sanitized}`;
};

/**
 * Constructs a Vercel Blob URL for user images.
 * 
 * Option 1: If cdnId is a full URL (http://, https://, or blob:), return it as-is.
 * Option 2: If cdnId contains the full blob key (userId/category/filename), use it directly.
 * Option 3: If cdnId is just the filename, provide userId and category.
 * 
 * @param cdnId - Either a full URL, full blob key, OR just the filename
 * @param userId - User ID (required if cdnId is just a filename)
 * @param category - enum UploadCategory (required if cdnId is just a filename)
 * @param baseUrl - Optional base URL
 * @returns The full URL to the blob
 */
export const constructVercelBlobUserImageUrl = (
  cdnId: string,
  userId?: string,
  category?: UploadCategory,
  baseUrl?: string
): string => {
  // If cdnId is already a full URL (http://, https://, or blob:), return it as-is
  if (cdnId.startsWith("http://") || cdnId.startsWith("https://") || cdnId.startsWith("blob:")) {
    return cdnId;
  }
  
  // If cdnId already contains slashes, assume it's the full key
  const isFullKey = cdnId.includes("/");
  
  if (isFullKey) {
    // cdnId is the full blob key (e.g., "userId/profile/filename.jpg")
    return constructVercelBlobUrl(cdnId, baseUrl);
  }
  
  // cdnId is just the filename, need userId and category
  if (!userId || !category) {
    throw new Error(
      "userId and category are required when cdnId is just a filename"
    );
  }
  
  const key = makeUserImageBlobKey(userId, category, cdnId);
  return constructVercelBlobUrl(key, baseUrl);
};