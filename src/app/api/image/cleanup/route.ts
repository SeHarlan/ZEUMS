export const runtime = "nodejs";

import { deleteBlob } from "@/server/utils/blobStorage";
import { getStaleImages, removeAccessTracking } from "@/server/utils/kvCache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Cleanup endpoint for stale cached images
 * 
 * Query parameters:
 * - maxAge: Maximum age in days (default: 90)
 * - dryRun: If true, only report what would be deleted (default: false)
 * - limit: Maximum number of images to delete per call (default: 100)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const maxAgeDays = parseInt(searchParams.get("maxAge") || "90", 10);
    const dryRun = searchParams.get("dryRun") === "true";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

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
