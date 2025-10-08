import { parseSolanaAssets } from "@/server/services/helpers/parseSolanaAssets";
import { getSingleSolanaAsset } from "@/server/services/singleSolanaAsset";
import { standardErrorResponses } from "@/utils/server";
import { NextResponse } from "next/server";

export async function getSingleSolanaAssetHandler(
  mintAddress: string
): Promise<NextResponse> {
  try {
    if (!mintAddress) {
      return NextResponse.json({ error: "Mint address is required" }, { status: 400 });
    }

    const rawAsset = await getSingleSolanaAsset(mintAddress);
    const asset = parseSolanaAssets([rawAsset])[0];

    return NextResponse.json({ asset }, { status: 200 });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-getSingleSolanaAsset",
      report: true,
    });
  }
}
