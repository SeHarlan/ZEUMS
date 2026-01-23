import { getUserAssetEntryHandler } from "@/server/handlers/user/getUserAssetEntry";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const resolvedParams = await params;
  return getUserAssetEntryHandler(resolvedParams.assetId);
}
