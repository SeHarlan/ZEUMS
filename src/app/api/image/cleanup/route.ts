export const runtime = "nodejs";

import { deleteBlob } from "@/server/utils/blobStorage";
import { getStaleImages, removeAccessTracking } from "@/server/utils/kvCache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Cleanup endpoint for stale cached images
 * 
 * Query parameters:
 * - maxAge: Maximum age in days (default: 90, min: 1)
 * - dryRun: If true, only report what would be deleted (default: false)
 * - limit: Maximum number of images to delete per call (default: 100, max: 1000)
 * - apiKey: API key for authentication (alternative to header)
 * 
 * Headers:
 * - x-vercel-cron: Vercel cron secret (for cron jobs)
 * - x-api-key: API key for authentication
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Authentication check
    const vercelCronHeader = req.headers.get("x-vercel-cron");
    const apiKeyHeader = req.headers.get("x-api-key");
    const { searchParams } = new URL(req.url);
    const apiKeyQuery = searchParams.get("apiKey");
    
    const expectedCronSecret = process.env.VERCEL_CRON_SECRET;
    const expectedApiKey = process.env.CLEANUP_API_KEY;
    
    // Check for Vercel cron authentication
    const isVercelCron = vercelCronHeader === expectedCronSecret;
    
    // Check for API key authentication (header or query param)
    const providedApiKey = apiKeyHeader || apiKeyQuery;
    const isApiKeyValid = expectedApiKey && providedApiKey === expectedApiKey;
    
    // Require at least one valid authentication method
    if (!isVercelCron && !isApiKeyValid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Input validation
    const maxAgeParam = searchParams.get("maxAge");
    const dryRunParam = searchParams.get("dryRun");
    const limitParam = searchParams.get("limit");

    // Validate maxAgeDays
    let maxAgeDays: number;
    if (maxAgeParam === null) {
      maxAgeDays = 90; // Default
    } else {
      const parsed = parseInt(maxAgeParam, 10);
      if (isNaN(parsed) || parsed < 1) {
        return NextResponse.json(
          { error: "Invalid maxAge: must be a positive integer >= 1" },
          { status: 400 }
        );
      }
      maxAgeDays = parsed;
    }

    // Validate dryRun flag strictly
    let dryRun: boolean;
    if (dryRunParam === null) {
      dryRun = false; // Default
    } else if (dryRunParam === "true") {
      dryRun = true;
    } else if (dryRunParam === "false") {
      dryRun = false;
    } else {
      return NextResponse.json(
        { error: "Invalid dryRun: must be 'true' or 'false'" },
        { status: 400 }
      );
    }

    // Validate limit
    let limit: number;
    if (limitParam === null) {
      limit = 100; // Default
    } else {
      const parsed = parseInt(limitParam, 10);
      if (isNaN(parsed) || parsed < 1) {
        return NextResponse.json(
          { error: "Invalid limit: must be a positive integer >= 1" },
          { status: 400 }
        );
      }
      // Clamp to maximum of 1000
      limit = Math.min(parsed, 1000);
    }

    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

    // Get stale images
    const staleImages = await getStaleImages(maxAgeMs);

    // Limit the number of images to process
    const imagesToProcess = staleImages.slice(0, limit);

    const results = {
      totalStale: staleImages.length,
      processing: imagesToProcess.length,
      deleted: 0,
      errors: 0,
      dryRun,
    };

    if (dryRun) {
      return NextResponse.json({
        ...results,
        images: imagesToProcess.map((img) => ({
          key: img.key,
          lastAccess: new Date(img.lastAccess).toISOString(),
          ageDays: Math.floor((Date.now() - img.lastAccess) / (24 * 60 * 60 * 1000)),
        })),
      });
    }

    // Delete stale images
    for (const { key } of imagesToProcess) {
      try {
        // Delete from blob storage
        await deleteBlob(key);
        
        // Remove access tracking
        await removeAccessTracking(key);
        
        results.deleted++;
      } catch (error) {
        console.error(`Failed to delete image ${key}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in cleanup endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
