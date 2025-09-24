import { NextRequest } from "next/server";
import { getGalleryByIdHandler } from "@/server/handlers/gallery/getGalleryById";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return getGalleryByIdHandler(resolvedParams.id);
}
