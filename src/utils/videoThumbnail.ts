/**
 * Extracts the first frame from a video file as a thumbnail image.
 * Uses HTML5 video element and canvas to capture the frame.
 * 
 * @param file - The video File object
 * @returns Promise resolving to a File object containing the thumbnail image, or null if extraction fails
 */
export async function extractVideoThumbnail(file: File): Promise<File | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.warn("Canvas context not available for thumbnail extraction");
      resolve(null);
      return;
    }

    // Create object URL for video
    const videoUrl = URL.createObjectURL(file);

    // Set up video element
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    let hasResolved = false;

    const cleanup = () => {
      URL.revokeObjectURL(videoUrl);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
    };

    const captureFrame = () => {
      if (hasResolved) return;
      
      try {
        // Ensure we have valid dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.warn("Video has invalid dimensions");
          if (!hasResolved) {
            hasResolved = true;
            cleanup();
            resolve(null);
          }
          return;
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (hasResolved) return;
            hasResolved = true;
            cleanup();

            if (blob) {
              // Create a File from the blob
              const thumbnailFile = new File(
                [blob],
                `thumbnail-${Date.now()}.jpg`,
                { type: "image/jpeg" }
              );
              resolve(thumbnailFile);
            } else {
              console.warn("Failed to create blob from canvas");
              resolve(null);
            }
          },
          "image/jpeg",
          0.9 // Quality
        );
      } catch (error) {
        console.warn("Error extracting video thumbnail:", error);
        if (!hasResolved) {
          hasResolved = true;
          cleanup();
          resolve(null);
        }
      }
    };

    // Wait for metadata to load, then seek to first frame
    const handleLoadedMetadata = () => {
      // Seek to a small time (0.1s) to ensure we're past any potential black frames
      // Some videos have black frames at exactly 0.0
      video.currentTime = 0.1;
    };

    // When seek completes, the frame is ready to capture
    const handleSeeked = () => {
      captureFrame();
    };

    // Handle errors
    const handleError = () => {
      console.warn("Video failed to load for thumbnail extraction");
      if (!hasResolved) {
        hasResolved = true;
        cleanup();
        resolve(null);
      }
    };

    // Set up event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
    video.addEventListener("seeked", handleSeeked, { once: true });
    video.addEventListener("error", handleError, { once: true });

    // Load the video
    video.load();

    // Fallback timeout in case events don't fire
    setTimeout(() => {
      if (!hasResolved && video.readyState >= 2) {
        // Video has loaded enough data, try to capture
        video.currentTime = 0.1;
        // Wait a bit for seek to complete
        setTimeout(() => {
          if (!hasResolved) {
            captureFrame();
          }
        }, 100);
      } else if (!hasResolved) {
        hasResolved = true;
        cleanup();
        resolve(null);
      }
    }, 5000); // 5 second timeout
  });
}
