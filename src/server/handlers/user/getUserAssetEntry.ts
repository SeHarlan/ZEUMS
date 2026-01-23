import { EntryTypes, UserAssetEntry } from "@/types/entry";
import { standardErrorResponses } from "@/utils/server";
import { NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import Entry from "../../models/Entry/Entry";

export async function getUserAssetEntryHandler(
  assetId: string
): Promise<NextResponse> {
  try {
    await connectToDatabase();

    if (!assetId) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    // Find the entry by ID and ensure it's a UserAssetEntry
    const entry = await Entry.findOne<UserAssetEntry>({
      _id: assetId,
      entryType: EntryTypes.UserAsset,
    }).exec();

    if (!entry) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ entry }, { status: 200 });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-getUserAssetEntry",
      report: true,
    });
  }
}
