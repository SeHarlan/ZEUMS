import GalleryItem from "@/server/models/Gallery/GalleryItem";
import { EntryTypes, UserAssetEntry } from "@/types/entry";
import { GalleryItemTypes, GalleryMediaItem } from "@/types/galleryItem";
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

    let asset: UserAssetEntry | GalleryMediaItem | null = null;

    //try gallery items first 
    asset = await GalleryItem.findOne<GalleryMediaItem>({
      _id: assetId,
      itemType: GalleryItemTypes.UserAsset,
    }).exec();

    if (!asset) {
      //then search through timeline entries
      asset = await Entry.findOne<UserAssetEntry>({
        _id: assetId,
        entryType: EntryTypes.UserAsset,
      }).exec();
    }

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ asset }, { status: 200 });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-getUserAssetEntry",
      report: true,
    });
  }
}
