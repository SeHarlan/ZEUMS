import { checkBlobExists, getBlobCacheHeaders, uploadToBlob } from "@/server/utils/blobStorage";
import { generateCacheKey, getFormatFromAccept, type ImageFormat } from "@/server/utils/imageCache";
import { enqueueImage } from "@/server/utils/imageQueue";
import { acquireLock, isNegativelyCached, isReady, releaseLock, setNegativeCache, trackAccess } from "@/server/utils/kvCache";
import { NextRequest, NextResponse } from "next/server";

const LONG_CACHE_CONTROL =
  "public, max-age=7776000, immutable, s-maxage=31536000, stale-while-revalidate=86400, stale-if-error=604800";

const SHORT_CACHE_CONTROL = "public, max-age=86400, s-maxage=604800";

const ZEUM_DOMAIN = process.env.NEXTAUTH_URL || "https://www.zeums.art";

/** default loader quality is 70 */
const HIGH_QUALITY_THRESHOLD = 70;
const TIMEOUT_MS = 10000;

/** Maximum size for synchronous processing (15 MB) */
const MAX_SYNC_BYTES = 15 * 1024 * 1024;

/** Maximum pixel count for processing (40 MP) */
const MAX_PIXELS = 40 * 1024 * 1024; // 40 megapixels

/** Profile image quality (85) */
const PROFILE_QUALITY = 85;

/** Banner image quality (90) */
const BANNER_QUALITY = 90;

/** Timeout for async worker processing (60 seconds) */
const ASYNC_TIMEOUT_MS = 60000;


// Lazy-load Sharp with module-level caching
let sharpPromise: Promise<typeof import("sharp")> | null = null;
let sharpModule: typeof import("sharp") | null = null;

async function getSharp(): Promise<typeof import("sharp")> {
  // If already loaded, return synchronously
  if (sharpModule) {
    return sharpModule;
  }

  // If already loading, wait for it
  if (sharpPromise) {
    return sharpPromise;
  }

  // Start loading
  sharpPromise = import("sharp")
    .then((module) => {
      sharpModule = module.default;
      return sharpModule;
    })
    .catch((error) => {
      // Reset on error so we can retry
      sharpPromise = null;
      throw error;
    });

  return sharpPromise;
}

/**
 * Checks if the request has been aborted and returns a 499 response if so
 */
function checkAborted(req: NextRequest): NextResponse | null {
  if (req.signal.aborted) {
    return new NextResponse(null, { status: 499 });
  }
  return null;
}

/**
 * Validates that the request is coming from zeum domain or localhost (will be in next auth url)
 */
function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  try {
    // Check origin header
    if (origin) {
      const originUrl = new URL(origin);
      if (originUrl.origin === new URL(ZEUM_DOMAIN).origin) {
        return true;
      }
    }

    // Check referer header
    if (referer) {
      const refererUrl = new URL(referer);
      if (refererUrl.origin === new URL(ZEUM_DOMAIN).origin) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Basic URL validation - ensures it's a valid http/https URL and blocks unsafe hosts
 */
function validateUrl(src: string): boolean {
  try {
    const url = new URL(src);

    // Must be http or https
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    const hostname = url.hostname.toLowerCase();

    // Block localhost variants
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("127.")
    ) {
      return false;
    }

    // Block private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
    if (hostname.startsWith("10.") || hostname.startsWith("192.168.")) {
      return false;
    }
    // Block 172.16.0.0/12 (172.16-31.x.x)
    if (hostname.startsWith("172.")) {
      const parts = hostname.split(".");
      const secondOctet = parseInt(parts[1] || "0", 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return false;
      }
    }

    // Block link-local and metadata service IPs
    if (hostname.startsWith("169.254.")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Determine if image should be cached in blob storage
 * Cache public-facing images (quality > 70) and profile/banner images
 */
function shouldCache(q: number | undefined): boolean {
  if (!q) return false;
  // Cache high quality images (public facing) and profile/banner images
  return q > HIGH_QUALITY_THRESHOLD || q === PROFILE_QUALITY || q === BANNER_QUALITY;
}

export async function resizeImageHandler(
  req: NextRequest
): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src");
  const qParam = searchParams.get("q");
  const wParam = searchParams.get("w");
  const fParam = searchParams.get("f"); // Optional format parameter
  const w = wParam ? parseInt(wParam, 10) : undefined;
  const q = qParam ? parseInt(qParam, 10) : undefined;

  //high quality assets will generally be public facing so we should present the best/optimized version
  //default in loader is 70 so these will be false by default
  const serverCache = shouldCache(q);
  const animateGif = q && q > HIGH_QUALITY_THRESHOLD;

  if (!src) return NextResponse.json({ error: "Missing src" }, { status: 400 });

  // Validate request origin
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
  }

  // Basic URL validation
  if (!validateUrl(src)) {
    return NextResponse.json(
      { error: "Invalid or unsafe src" },
      { status: 400 }
    );
  }

  // Determine output format
  const accept = req.headers.get("accept") || "";
  const format: ImageFormat = (fParam as ImageFormat) || getFormatFromAccept(accept);

  // Check blob cache for public-facing images
  if (serverCache) {
    const cacheKey = generateCacheKey({ src, width: w, format, quality: q });
    
    // Check negative cache first
    const isNegCached = await isNegativelyCached(cacheKey);
    if (isNegCached) {
      return NextResponse.json(
        { error: "Image not available" },
        {
          status: 404,
          headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" },
        }
      );
    }

    // Check if blob exists
    const blobUrl = await checkBlobExists(cacheKey);
    if (blobUrl) {
      // Track access time for cache management
      await trackAccess(cacheKey);
      
      // Redirect to blob URL (CDN will handle it)
      return NextResponse.redirect(blobUrl, {
        headers: getBlobCacheHeaders(),
      });
    }
  }

  // Generate cache key early for queue checks
  const cacheKey = serverCache ? generateCacheKey({ src, width: w, format, quality: q }) : null;

  // Preflight check for large images (HEAD request to get Content-Length)
  let contentLength: number | null = null;
  let shouldQueue = false;
  
  if (serverCache && cacheKey) {
    // Check if already processed (QStash may have already completed it)
    const ready = await isReady(cacheKey);
    if (ready) {
      const blobUrl = await checkBlobExists(cacheKey);
      if (blobUrl) {
        // Track access time for cache management
        await trackAccess(cacheKey);
        
        return NextResponse.redirect(blobUrl, {
          headers: getBlobCacheHeaders(),
        });
      }
    }

    try {
      // Try HEAD first for size check
      const headRes = await fetch(src, { method: "HEAD", redirect: "follow" });
      const clHeader = headRes.headers.get("content-length");
      if (clHeader) {
        contentLength = parseInt(clHeader, 10);
        
        // If too large, queue it
        if (contentLength > MAX_SYNC_BYTES) {
          shouldQueue = true;
        }
      } else {
        // No Content-Length header, try fetching first chunk to check metadata
        const rangeRes = await fetch(src, {
          method: "GET",
          headers: { Range: "bytes=0-262143" }, // First 256 KB
          redirect: "follow",
        });
        
        if (rangeRes.ok) {
          const chunk = await rangeRes.arrayBuffer();
          // Try to read image metadata from chunk
          try {
            const sharp = await getSharp();
            const metadata = await sharp(Buffer.from(chunk)).metadata();
            const pixelCount = (metadata.width || 0) * (metadata.height || 0);
            
            if (pixelCount > MAX_PIXELS) {
              shouldQueue = true;
            }
          } catch {
            // Can't read metadata from chunk, proceed with sync processing
          }
        }
      }
    } catch (error) {
      // Ignore preflight errors, proceed with normal fetch
      console.warn("Preflight check failed:", error);
    }

    // Queue large images for async processing
    if (shouldQueue) {
      const queued = await enqueueImage({
        src,
        width: w,
        format,
        quality: q,
      });
      
      if (queued) {
        // QStash will process this asynchronously
        // Return 202 so client can retry
        return NextResponse.json(
          { message: "Image queued for processing", retryAfter: 2 },
          {
            status: 202,
            headers: {
              "Retry-After": "2",
              "Cache-Control": SHORT_CACHE_CONTROL,
            },
          }
        );
      }
      // If queuing fails, proceed with sync processing (fallback)
      console.warn("Failed to queue image, falling back to sync processing");
    }
  }

  // Acquire lock for caching operations
  let lockAcquired = false;
  
  if (serverCache && cacheKey) {
    lockAcquired = await acquireLock(cacheKey);
    if (!lockAcquired) {
      // Another request is processing this, wait a bit and check blob again
      await new Promise((resolve) => setTimeout(resolve, 500));
      const blobUrl = await checkBlobExists(cacheKey);
      if (blobUrl) {
        // Track access time for cache management
        await trackAccess(cacheKey);
        
        return NextResponse.redirect(blobUrl, {
          headers: getBlobCacheHeaders(),
        });
      }
      // If still not ready, proceed with processing (lock might have been released)
    }
  }

  // Combine client abort signal with timeout
  const controller = new AbortController();
  const timeoutMs = TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Check if already aborted (can happen if client cancelled before handler started)
  if (req.signal.aborted) {
    console.log("Aborting request!!!!!!!");
    
    clearTimeout(timeoutId);
    if (lockAcquired && cacheKey) {
      await releaseLock(cacheKey);
    }
    return new NextResponse(null, { status: 499 });
  }

  req.signal.addEventListener("abort", () => {
    console.log("!!!!!!!Aborting request");
    controller.abort();
    clearTimeout(timeoutId);
    if (lockAcquired && cacheKey) {
      releaseLock(cacheKey).catch(console.error);
    }
  });

  let res: Response;
  try {
    res = await fetch(src, { redirect: "follow", signal: controller.signal });
    clearTimeout(timeoutId);
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    if (lockAcquired && cacheKey) {
      await releaseLock(cacheKey);
      // Set negative cache for failed requests
      await setNegativeCache(cacheKey);
    }
        
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Aborted by client or timeout" },
        {
          status: 504,
          headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" },
        }
      );
    }
    return NextResponse.json(
      { error: "Bad upstream" },
      {
        status: 500,
        headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" },
      }
    );
  }

  if (!res.ok) {
    if (lockAcquired && cacheKey) {
      await releaseLock(cacheKey);
      await setNegativeCache(cacheKey);
    }
    return NextResponse.json(
      { error: "Bad upstream" },
      {
        status: 502,
        headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" },
      }
    );
  }
  
  const buf = Buffer.from(await res.arrayBuffer());
  const abortResponseAfterBuffer = checkAborted(req);
  if (abortResponseAfterBuffer) return abortResponseAfterBuffer;

  // Load Sharp (cached after first load)
  let sharp: typeof import("sharp");
  try {
    sharp = await getSharp();
  } catch (error: unknown) {
    console.error("Failed to load sharp module:", error);
    return NextResponse.json(
      { error: "Image processing unavailable" },
      {
        status: 503,
        headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" },
      }
    );
  }

  // Check pixel count guardrail (if not already checked in preflight)
  if (!shouldQueue) {
    try {
      const metadata = await sharp(buf).metadata();
      const pixelCount = (metadata.width || 0) * (metadata.height || 0);
      
      if (pixelCount > MAX_PIXELS) {
        // Too large, queue it if caching
        if (serverCache && cacheKey) {
          const queued = await enqueueImage({
            src,
            width: w,
            format,
            quality: q,
          });
          
          if (queued) {
            if (lockAcquired) {
              await releaseLock(cacheKey);
            }
            return NextResponse.json(
              { message: "Image queued for processing", retryAfter: 2 },
              {
                status: 202,
                headers: {
                  "Retry-After": "2",
                  "Cache-Control": SHORT_CACHE_CONTROL,
                },
              }
            );
          }
        }
        // If queuing fails or not caching, reject the request
        if (lockAcquired && cacheKey) {
          await releaseLock(cacheKey);
          await setNegativeCache(cacheKey);
        }
        return NextResponse.json(
          { error: "Image too large" },
          {
            status: 413,
            headers: { "Cache-Control": SHORT_CACHE_CONTROL, Vary: "Accept" },
          }
        );
      }
    } catch (error) {
      // If metadata check fails, proceed (might be invalid image, will fail later)
      console.warn("Failed to check pixel count:", error);
    }
  }

  if (animateGif) {
    let metadata;
    try {
      metadata = await sharp(buf).metadata();
    } catch (error: unknown) {
      console.error(error);
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }

    // If GIF , return original (Sharp can't preserve animation when resizing/converting)
    if (metadata.format === "gif") {
      const contentType = res.headers.get("content-type") || "image/gif";
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": LONG_CACHE_CONTROL,
          Vary: "Accept",
        },
      });
    }
  }

  // Process image based on format
  let out: Buffer;
  let type: string;
  try {
    let pipeline = sharp(buf);

    // only resize if width defined
    if (w && !isNaN(w)) {
      // optionally still enforce a max cap
      pipeline = pipeline.resize({
        width: w,
        withoutEnlargement: true,
      });
    }

    // Check for abort before expensive operations
    const abortResponseBeforeProcessing = checkAborted(req);
    if (abortResponseBeforeProcessing) {
      if (lockAcquired && cacheKey) {
        await releaseLock(cacheKey);
      }
      return abortResponseBeforeProcessing;
    }

    // Use format from parameter or Accept header
    if (format === "avif") {
      out = await pipeline.avif({ quality: q || 50 }).toBuffer();
      type = "image/avif";
    } else if (format === "webp") {
      out = await pipeline.webp({ quality: q || 60 }).toBuffer();
      type = "image/webp";
    } else if (format === "gif") {
      // For GIFs, return original if animated, otherwise convert
      const metadata = await sharp(buf).metadata();
      if (metadata.format === "gif" && animateGif) {
        out = buf;
        type = "image/gif";
      } else {
        out = await pipeline.jpeg({ quality: q || 70, mozjpeg: true }).toBuffer();
        type = "image/jpeg";
      }
    } else {
      out = await pipeline.jpeg({ quality: q || 70, mozjpeg: true }).toBuffer();
      type = "image/jpeg";
    }

    // Upload to blob storage if caching
    if (serverCache && cacheKey && lockAcquired) {
      try {
        const blobUrl = await uploadToBlob(cacheKey, out, type);
        if (blobUrl) {
          // Release lock after successful upload
          await releaseLock(cacheKey);
          
          // Track access time for cache management (first access)
          await trackAccess(cacheKey);
          
          // Redirect to blob URL
          return NextResponse.redirect(blobUrl, {
            headers: getBlobCacheHeaders(),
          });
        }
      } catch (error) {
        console.error("Failed to upload to blob storage:", error);
        // Continue to serve directly if blob upload fails
      }
    }
  } catch (error: unknown) {
    // Don't log errors for aborted requests
    const abortResponse = checkAborted(req);
    if (abortResponse) {
      if (lockAcquired && cacheKey) {
        await releaseLock(cacheKey);
      }
      return abortResponse;
    }
    
    // Set negative cache on processing errors
    if (lockAcquired && cacheKey) {
      await releaseLock(cacheKey);
      await setNegativeCache(cacheKey);
    }
    
    console.error("Image processing failed:", error);
    return new NextResponse("Image processing error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": SHORT_CACHE_CONTROL,
        Vary: "Accept",
      },
    });
  }

  // Release lock if still held (shouldn't happen, but safety)
  if (lockAcquired && cacheKey) {
    await releaseLock(cacheKey);
  }

  return new NextResponse(new Uint8Array(out), {
    headers: {
      "Content-Type": type,
      "Cache-Control": LONG_CACHE_CONTROL,
      Vary: "Accept",
    },
  });
}
