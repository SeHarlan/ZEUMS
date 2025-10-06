interface VideoMetadataRequest {
  src: string;
  resolve: (ratio: number) => void;
  reject: (error: Error) => void;
  timestamp: number;
  abortController?: AbortController;
}

const VIDEO_METADATA_TIMEOUT = 20_000; // 20 second timeout

class VideoMetadataPool {
  private pool: HTMLVideoElement[] = [];
  private maxPoolSize = 2; // Pool size of 2 for mobile-friendly performance
  private requestQueue: VideoMetadataRequest[] = [];
  private activeRequests = new Map<string, VideoMetadataRequest[]>();
  private cleanupTimeouts = new Map<HTMLVideoElement, NodeJS.Timeout>();

  // Get or create a video element from the pool
  private getVideoElement(): HTMLVideoElement {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.crossOrigin = 'anonymous';
    return video;
  }

  // Return video element to pool after cleanup
  private returnToPool(video: HTMLVideoElement) {
    // Clean up the video element
    video.pause();
    video.src = '';
    video.load();
    
    // Clear any existing timeouts
    const existingTimeout = this.cleanupTimeouts.get(video);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Return to pool if not at capacity
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(video);
    } else {
      // Remove from DOM if pool is full
      video.remove();
    }
  }

  // Process queued requests
  private processQueue() {
    while (this.requestQueue.length > 0 && this.activeRequests.size < this.maxPoolSize) {
      const request = this.requestQueue.shift()!;
      this.processRequest(request);
    }
  }

  // Process a single metadata request
  private processRequest(request: VideoMetadataRequest) {
    const video = this.getVideoElement();
    const { src, abortController } = request;

    // Group requests for the same video source
    if (!this.activeRequests.has(src)) {
      this.activeRequests.set(src, []);
    }
    this.activeRequests.get(src)!.push(request);

    let isProcessed = false;
    const timeout = setTimeout(() => {
      if (!isProcessed) {
        this.handleError(video, src, new Error('Metadata loading timeout'));
      }
    }, VIDEO_METADATA_TIMEOUT);

    // Handle abort signal
    const abortHandler = () => {
      if (!isProcessed) {
        this.handleAbort(video, src, request);
      }
    };
    
    if (abortController) {
      abortController.signal.addEventListener('abort', abortHandler);
    }

    const cleanup = () => {
      if (isProcessed) return;
      isProcessed = true;
      
      clearTimeout(timeout);
      this.cleanupTimeouts.delete(video);
      
      // Remove abort listener
      if (abortController) {
        abortController.signal.removeEventListener('abort', abortHandler);
      }
      
      // Remove from active requests
      const requests = this.activeRequests.get(src);
      if (requests) {
        const index = requests.findIndex(r => r === request);
        if (index > -1) requests.splice(index, 1);
        
        // If no more requests for this src, clean up
        if (requests.length === 0) {
          this.activeRequests.delete(src);
          this.returnToPool(video);
        }
      }
      
      // Process next queued request
      this.processQueue();
    };

    video.onloadedmetadata = () => {
      if (isProcessed) return;
      
      const ratio = video.videoWidth / video.videoHeight;
      
      // Resolve all requests for this video source
      const requests = this.activeRequests.get(src) || [];
      requests.forEach(req => req.resolve(ratio));
      
      cleanup();
    };

    video.onerror = () => {
      if (isProcessed) return;
      this.handleError(video, src, new Error('Video loading failed'));
    };

    video.src = src;
  }

  private handleError(video: HTMLVideoElement, src: string, error: Error) {
    // Reject all requests for this video source
    const requests = this.activeRequests.get(src) || [];
    requests.forEach(req => req.reject(error));
    
    this.activeRequests.delete(src);
    this.returnToPool(video);
    this.processQueue();
  }

  private handleAbort(video: HTMLVideoElement, src: string, abortedRequest: VideoMetadataRequest) {
    // Only reject the specific aborted request
    abortedRequest.reject(new Error('Request aborted'));
    
    // Remove only this request from active requests
    const requests = this.activeRequests.get(src) || [];
    const index = requests.findIndex(r => r === abortedRequest);
    if (index > -1) {
      requests.splice(index, 1);
      
      // If no more requests for this src, clean up
      if (requests.length === 0) {
        this.activeRequests.delete(src);
        this.returnToPool(video);
        this.processQueue();
      }
    }
  }

  // Public API: Get video metadata with cancellation support
  getVideoMetadata(src: string): { promise: Promise<number>; abort: () => void } {
    const abortController = new AbortController();
    
    const promise = new Promise<number>((resolve, reject) => {
      const request: VideoMetadataRequest = {
        src,
        resolve,
        reject,
        timestamp: Date.now(),
        abortController
      };

      // Check if we already have an active request for this src
      if (this.activeRequests.has(src)) {
        this.activeRequests.get(src)!.push(request);
        return;
      }

      // Add to queue or process immediately
      if (this.activeRequests.size < this.maxPoolSize) {
        this.processRequest(request);
      } else {
        this.requestQueue.push(request);
      }
    });

    return {
      promise,
      abort: () => abortController.abort()
    };
  }

  // Cleanup method for app unmount
  destroy() {
    // Clear all timeouts
    this.cleanupTimeouts.forEach(timeout => clearTimeout(timeout));
    this.cleanupTimeouts.clear();
    
    // Clean up pool
    this.pool.forEach(video => {
      video.pause();
      video.src = '';
      video.remove();
    });
    this.pool = [];
    
    // Reject all pending requests
    this.requestQueue.forEach(req => req.reject(new Error('Pool destroyed')));
    this.requestQueue = [];
    
    this.activeRequests.clear();
  }
}

// Singleton instance
export const videoMetadataPool = new VideoMetadataPool();
