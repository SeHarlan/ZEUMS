import { getPublicGalleriesHandler } from "@/server/handlers/gallery/getPublicGalleries";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest): Promise<NextResponse> {
  return getPublicGalleriesHandler(req);
}
