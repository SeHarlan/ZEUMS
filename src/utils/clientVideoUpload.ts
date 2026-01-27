import { API_ROUTE } from "@/constants/serverRoutes";
import { UploadCategory } from "@/constants/uploadCategories";
import { upload } from "@vercel/blob/client";

export interface UploadVideoResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

/**
 * Uploads a video file directly from the client to Vercel Blob storage.
 * This performs a direct browser-to-blob upload, bypassing server request size limits.
 * 
 * @param file - The video File object to upload
 * @param key - The desired path/filename in the blob storage (e.g., "user-videos/video-123.mp4")
 * @returns Promise resolving to the upload result with blob URL and metadata
 * @throws Error if upload fails
 */
export async function clientVideoUpload(
  file: File,
  key: string
): Promise<UploadVideoResult> {
  // Validate file type - only allow web-optimized formats
  const allowedTypes = ["video/mp4", "video/webm"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("File must be MP4 or WebM format");
  }

  try {
    const blob = await upload(key, file, {
      access: "public",
      handleUploadUrl: `${API_ROUTE}/video/upload`,
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
        throw new Error("File is too large. Please choose a smaller video.");
      }
      if (error.message.includes("type") || error.message.includes("content")) {
        throw new Error("Invalid file type. Please upload an MP4 or WebM video file.");
      }
      // Return the original error message if it's already user-friendly
      throw error;
    }
    throw new Error("Failed to upload video. Please try again.");
  }
}
