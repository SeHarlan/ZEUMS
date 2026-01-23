import { getAuthSessionUser } from "@/utils/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * Token exchange endpoint for client-side Vercel Blob uploads.
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
        // Validate that it's an image path
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pathname);
        if (!isImage) {
          throw new Error("Only image files are allowed");
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",
          ],
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Optional: Add any post-upload logic here (e.g., save to database)
        console.log(`Upload completed: ${blob.url}`);
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
