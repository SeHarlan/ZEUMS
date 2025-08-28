import { getSingleSolanaAssetHandler } from "@/server/handlers/assets/getSingleSolanaAsset";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return getSingleSolanaAssetHandler(resolvedParams.id);
}
