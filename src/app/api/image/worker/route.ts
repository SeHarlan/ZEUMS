export const runtime = "nodejs"; // sharp requires Node.js runtime
export const maxDuration = 60; // 60 seconds for large image processing

import { checkBlobExists, uploadToBlob } from "@/server/utils/blobStorage";
import type { ImageQueueItem } from "@/server/utils/imageQueue";
import { acquireLock, releaseLock, setNegativeCache, setReady } from "@/server/utils/kvCache";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";

const ASYNC_TIMEOUT_MS = 60000;
const MAX_PIXELS = 40 * 1024 * 1024; // 40 megapixels

// Concurrency limit for parallel processing
const MAX_CONCURRENT_PROCESSING = 5;

// Lazy-load Sharp
let sharpPromise: Promise<typeof import("sharp")> | null = null;
let sharpModule: typeof import("sharp") | null = null;

async function getSharp(): Promise<typeof import("sharp")> {
  if (sharpModule) return sharpModule;
  if (sharpPromise) return sharpPromise;

  sharpPromise = import("sharp")
    .then((module) => {
      sharpModule = module.default;
      return sharpModule;
    })
    .catch((error) => {
      sharpPromise = null;
      throw error;
    });

  return sharpPromise;
}

/**
 * Process a single image
 */
async function processImage(item: ImageQueueItem): Promise<{ success: boolean; cacheKey: string }> {
  const { src, width, format, quality, cacheKey } = item;

  // Check if already processed
  const existingBlob = await checkBlobExists(cacheKey);
  if (existingBlob) {
    await setReady(cacheKey);
    // Track access (though this is async processing, not a direct access)
    // We'll track it when the image is actually served to a user
    return { success: true, cacheKey };
  }

  // Acquire lock
  const lockAcquired = await acquireLock(cacheKey);
  if (!lockAcquired) {
    // Another worker is processing this
    return { success: false, cacheKey };
  }

  try {
    // Fetch image with longer timeout for large files
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ASYNC_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(src, { redirect: "follow", signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      await releaseLock(cacheKey);
      await setNegativeCache(cacheKey);
      console.error("Failed to fetch image in worker:", error);
      return { success: false, cacheKey };
    }

    if (!res.ok) {
      await releaseLock(cacheKey);
      await setNegativeCache(cacheKey);
      return { success: false, cacheKey };
    }

    // Stream the response into a buffer
    const buf = Buffer.from(await res.arrayBuffer());

    // Load Sharp
    const sharp = await getSharp();

    // Check pixel count
    try {
      const metadata = await sharp(buf).metadata();
      const pixelCount = (metadata.width || 0) * (metadata.height || 0);
      
      if (pixelCount > MAX_PIXELS) {
        await releaseLock(cacheKey);
        await setNegativeCache(cacheKey);
        console.warn(`Image too large (${pixelCount} pixels): ${src}`);
        return { success: false, cacheKey };
      }
    } catch (error) {
      console.warn("Failed to check pixel count in worker:", error);
    }

    // Process image
    let pipeline = sharp(buf);

    if (width && !isNaN(width)) {
      pipeline = pipeline.resize({
        width,
        withoutEnlargement: true,
      });
    }

    let out: Buffer;
    let type: string;

    if (format === "avif") {
      out = await pipeline.avif({ quality: quality || 50 }).toBuffer();
      type = "image/avif";
    } else if (format === "webp") {
      out = await pipeline.webp({ quality: quality || 60 }).toBuffer();
      type = "image/webp";
    } else if (format === "gif") {
      const metadata = await sharp(buf).metadata();
      if (metadata.format === "gif") {
        // Keep original GIF for animated
        out = buf;
        type = "image/gif";
      } else {
        out = await pipeline.jpeg({ quality: quality || 70, mozjpeg: true }).toBuffer();
        type = "image/jpeg";
      }
    } else {
      out = await pipeline.jpeg({ quality: quality || 70, mozjpeg: true }).toBuffer();
      type = "image/jpeg";
    }

    // Upload to blob storage
    const blobUrl = await uploadToBlob(cacheKey, out, type);
    if (blobUrl) {
      await setReady(cacheKey);
      await releaseLock(cacheKey);
      return { success: true, cacheKey };
    } else {
      await releaseLock(cacheKey);
      console.error("Failed to upload to blob in worker");
      return { success: false, cacheKey };
    }
  } catch (error) {
    await releaseLock(cacheKey);
    await setNegativeCache(cacheKey);
    console.error("Error processing image in worker:", error);
    return { success: false, cacheKey };
  }
}

/**
 * Process multiple images in parallel with concurrency limit
 * Note: With QStash, each message triggers a separate POST request,
 * so parallel processing happens naturally via multiple concurrent requests.
 * This function is available for batch processing if needed.
 */
async function processImagesParallel(
  items: ImageQueueItem[],
  concurrency: number = MAX_CONCURRENT_PROCESSING
): Promise<Array<{ success: boolean; cacheKey: string }>> {
  const results: Array<{ success: boolean; cacheKey: string }> = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const promise = processImage(item).then((result) => {
      results.push(result);
      executing.splice(executing.indexOf(promise), 1);
    });

    executing.push(promise);

    // Wait for a slot to open if we've hit the concurrency limit
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  // Wait for all remaining promises
  await Promise.all(executing);

  return results;
}

/**
 * Worker endpoint to process queued images
 * Called by QStash when messages are published
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify QStash signature (optional but recommended for security)
    // In production, you should verify the signature
    // For now, we'll skip verification in development
    if (process.env.NODE_ENV === "production" && process.env.QSTASH_CURRENT_SIGNING_KEY) {
      try {
        await verifySignatureAppRouter(req);
      } catch (error) {
        console.error("QStash signature verification failed:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Parse the queue item from request body
    const item: ImageQueueItem = await req.json();

    // Process the image
    const result = await processImage(item);

    if (result.success) {
      return NextResponse.json({ success: true, cacheKey: result.cacheKey });
    } else {
      // Return error so QStash can retry
      return NextResponse.json(
        { error: "Processing failed", cacheKey: result.cacheKey },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in worker endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Batch worker endpoint (optional - for processing multiple images at once)
 * Can be called manually or by cron for batch processing
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // This endpoint is kept for manual/batch processing if needed
  // QStash will primarily use POST for individual messages
  
  return NextResponse.json({
    message: "Use POST endpoint for QStash webhooks",
    info: "QStash automatically calls POST when messages are published",
  });
}
