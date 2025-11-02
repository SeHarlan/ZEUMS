import { GALLERY_OWNER_FOREIGN_KEY } from "@/constants/databaseKeys";
import { standardErrorResponses } from "@/utils/server";
import { NextResponse } from "next/server";
import connectToDatabase from "../../db/mongodb";
import Gallery, { GalleryWithBasicOwnerPopulate, GalleryWithItemsPopulate } from "../../models/Gallery/Gallery";
import User from "../../models/User";

export async function getGalleryByUsernameAndNameHandler(
  username: string,
  galleryName: string
): Promise<NextResponse> {

  await connectToDatabase();

  try {
    if (!username) {
      throw new Error("Username is required");
    }

    if (!galleryName) {
      throw new Error("Gallery name is required");
    }

    // First find the user by username
    const user = await User.findOne({ username }).select("_id").exec();

    if (!user) {
      throw new Error("User not found");
    }

    // Then fetch gallery with the user's ID and gallery title
    const gallery = await Gallery.findOne({
      [GALLERY_OWNER_FOREIGN_KEY]: user._id,
      title: galleryName,
    })
      .populate([GalleryWithItemsPopulate, GalleryWithBasicOwnerPopulate])
      .exec();

    if (!gallery) {
      throw new Error("Gallery not found");
    }

    return NextResponse.json({ gallery });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-getGalleryByUsernameAndName",
      report: true,
    });
  }
}
