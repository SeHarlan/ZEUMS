import { Client } from "@upstash/qstash";
import { generateCacheKey, type ImageFormat } from "./imageCache";

/**
 * QStash client for image processing queue
 */
let qstashClient: Client | null = null;

function getQStashClient(): Client | null {
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    console.warn("QSTASH_TOKEN not set - queue system will be disabled");
    return null;
  }

  if (!qstashClient) {
    qstashClient = new Client({ token });
  }

  return qstashClient;
}

/**
 * Queue item interface
 */
export interface ImageQueueItem {
  src: string;
  width?: number;
  format: ImageFormat;
  quality?: number;
  cacheKey: string;
}

/**
 * Add an image processing job to the queue using QStash
 * 
 * @param item - Image processing parameters
 * @returns true if queued successfully
 */
export async function enqueueImage(item: Omit<ImageQueueItem, "cacheKey">): Promise<boolean> {
  const client = getQStashClient();
  if (!client) {
    return false;
  }

  try {
    const cacheKey = generateCacheKey({
      src: item.src,
      width: item.width,
      format: item.format,
      quality: item.quality,
    });

    const queueItem: ImageQueueItem = {
      ...item,
      cacheKey,
    };

    // Get the worker endpoint URL
    let baseUrl: string;
    if (process.env.NEXTAUTH_URL) {
      baseUrl = process.env.NEXTAUTH_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      baseUrl = "http://localhost:3000";
    }
    
    const workerUrl = `${baseUrl}/api/image/worker`;

    // Publish to QStash - it will call our worker endpoint
    await client.publishJSON({
      url: workerUrl,
      body: queueItem,
      // Retry configuration
      retries: 3,
      // Delay before first retry (exponential backoff)
      delay: 2,
    });

    return true;
  } catch (error) {
    console.error("Failed to enqueue image with QStash:", error);
    return false;
  }
}

/**
 * Check if an image is in the queue
 * Note: With QStash, we can't easily check if something is queued
 * Instead, we rely on the ready flag and blob existence checks
 * 
 * @param cacheKey - Cache key to check
 * @returns false (QStash doesn't expose queue status easily)
 */
export async function isInQueue(cacheKey: string): Promise<boolean> {
  // QStash doesn't provide a simple way to check if a message is queued
  // We rely on the ready flag and blob existence instead
  return false;
}

/**
 * Remove an item from the queue
 * Note: QStash doesn't support removing queued messages easily
 * Messages are automatically removed after processing or expiration
 * 
 * @param cacheKey - Cache key to remove
 */
export async function removeFromQueue(cacheKey: string): Promise<void> {
  // QStash handles message lifecycle automatically
  // No manual removal needed
}
