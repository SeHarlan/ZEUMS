import { getGalleryByUsernameAndNameHandler } from "@/server/handlers/gallery/getGalleryByUsernameAndName";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; galleryName: string }> }
) {
  const resolvedParams = await params;

  return getGalleryByUsernameAndNameHandler(
    resolvedParams.username,
    resolvedParams.galleryName
  );
}
