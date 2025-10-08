interface VideoMetadataRequest {
  src: string;
  resolve: (ratio: number) => void;
  reject: (error: Error) => void;
  timestamp: number;
  abortController?: AbortController;
}
export const REQUEST_ABORTED_ERROR = "Request aborted";
export const REQUEST_FULL_ERROR = "Queue full";
const VIDEO_METADATA_TIMEOUT = 30_000; // 30 second timeout
const MAX_QUEUE_SIZE = 20;
class VideoMetadataQueue {
  private videoElement: HTMLVideoElement | null = null;
  private currentRequest: VideoMetadataRequest | null = null;
  private requestQueue: VideoMetadataRequest[] = [];
  private eventListeners = new Map<string, () => void>(); // Track event listeners for current video

  // Get or create the single video element
  private getVideoElement(): HTMLVideoElement {
    if (!this.videoElement) {
      this.videoElement = document.createElement("video");
      this.videoElement.preload = "metadata";
      this.videoElement.muted = true;
      this.videoElement.crossOrigin = "anonymous";
    }
    return this.videoElement;
  }

  // Remove all event listeners
  private removeAllEventListeners() {
    this.eventListeners.forEach((cleanup, eventType) => {
      this.videoElement?.removeEventListener(eventType, cleanup);
    });
    this.eventListeners.clear();
  }

  // Add event listener with cleanup tracking
  private addEventListener(eventType: string, handler: () => void) {
    if (this.videoElement) {
      this.videoElement.addEventListener(eventType, handler);
      this.eventListeners.set(eventType, handler);
    }
  }

  // Clean up the current video element
  private cleanupVideoElement() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = "";
      this.videoElement.load();
      this.removeAllEventListeners();
    }
  }

  // Process the next request in queue
  private processNextRequest() {
    // Early return if already processing a request
    if (this.currentRequest) {
      return;
    }

    if (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      this.processRequest(request);
    } else {
      // Queue is empty - perform final cleanup
      this.performFinalCleanup();
    }
  }
  // Add final cleanup method
  private performFinalCleanup() {
    if (this.videoElement) {
      this.cleanupVideoElement();
      // Optionally remove from DOM to free memory
      this.videoElement.remove();
      this.videoElement = null;
    }
  }

  // Process a single metadata request
  private processRequest(request: VideoMetadataRequest) {
    const video = this.getVideoElement();
    const { src, abortController } = request;

    this.currentRequest = request;

    let isProcessed = false;
    const timeout = setTimeout(() => {
      if (!isProcessed) {
        this.handleError(new Error("Metadata loading timeout"));
      }
    }, VIDEO_METADATA_TIMEOUT);

    // Handle abort signal
    const abortHandler = () => {
      if (!isProcessed) {
        this.handleAbort(request);
      }
    };

    if (abortController) {
      abortController.signal.addEventListener("abort", abortHandler);
    }

    const cleanup = () => {
      if (isProcessed) return;
      isProcessed = true;

      clearTimeout(timeout);

      // Remove abort listener
      if (abortController) {
        abortController.signal.removeEventListener("abort", abortHandler);
      }

      this.currentRequest = null;
      this.cleanupVideoElement();

      // Process next queued request
      this.processNextRequest();
    };

    // Use tracked event listeners
    this.addEventListener("loadedmetadata", () => {
      if (isProcessed) return;

      const ratio = video.videoWidth / video.videoHeight;
      request.resolve(ratio);
      cleanup();
    });

    this.addEventListener("error", () => {
      if (isProcessed) return;
      this.handleError(new Error("Video loading failed"));
    });

    video.src = src;
    video.load(); // Force loading of the new source
  }

  private handleError(error: Error) {
    if (this.currentRequest) {
      this.currentRequest.reject(error);
      this.currentRequest = null;
      this.cleanupVideoElement();
      this.processNextRequest();
    }
  }

  private handleAbort(abortedRequest: VideoMetadataRequest) {
    abortedRequest.reject(new Error(REQUEST_ABORTED_ERROR));
    this.currentRequest = null;
    this.cleanupVideoElement();
    this.processNextRequest();
  }

  // Public API: Get video metadata with cancellation support
  getVideoMetadata(src: string): {
    promise: Promise<number>;
    abort: () => void;
  } {
    const abortController = new AbortController();

    const promise = new Promise<number>((resolve, reject) => {
      const request: VideoMetadataRequest = {
        src,
        resolve,
        reject,
        timestamp: Date.now(),
        abortController,
      };

      // Add to queue or process immediately
      if (!this.currentRequest) {
        this.processRequest(request);
      } else {
        // Prevent queue from growing too large
        if (this.requestQueue.length < MAX_QUEUE_SIZE) {
          this.requestQueue.push(request);
        } else {
          request.reject(new Error(REQUEST_FULL_ERROR));
        }
      }
    });

    return {
      promise,
      abort: () => abortController.abort(),
    };
  }

  // Cleanup method for app unmount
  destroy() {
    // Clean up current video element
    this.cleanupVideoElement();

    // Reject current request if any
    if (this.currentRequest) {
      this.currentRequest.reject(new Error("Pool destroyed"));
      this.currentRequest = null;
    }

    // Reject all pending requests
    this.requestQueue.forEach((req) => req.reject(new Error("Pool destroyed")));
    this.requestQueue = [];

    // Remove video element from DOM
    if (this.videoElement) {
      this.videoElement.remove();
      this.videoElement = null;
    }
  }
}

// Singleton instance
export const videoMetadataQueue = new VideoMetadataQueue();
