import { getAuthSessionUser } from "@/utils/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * Token exchange endpoint for client-side Vercel Blob video uploads.
 * This endpoint generates a secure token that allows the client to upload directly to Vercel Blob.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Require authentication for uploads
    await getAuthSessionUser(request);

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate that it's a video path - only allow web-optimized formats
        const isVideo = /\.(mp4|webm)$/i.test(pathname);
        if (!isVideo) {
          throw new Error("Only MP4 and WebM video files are allowed");
        }

        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
          ],
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Optional: Add any post-upload logic here (e.g., save to database)
        console.log(`Video upload completed: ${blob.url}`);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate upload token" },
      { status: 500 }
    );
  }
}
