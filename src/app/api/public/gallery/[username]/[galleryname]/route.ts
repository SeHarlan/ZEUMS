import { NextRequest } from "next/server";
import { getGalleryByUsernameAndNameHandler } from "@/server/handlers/gallery/getGalleryByUsernameAndName";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; galleryname: string }> }
) {
  const resolvedParams = await params;
  return getGalleryByUsernameAndNameHandler(
    resolvedParams.username,
    resolvedParams.galleryname
  );
}
