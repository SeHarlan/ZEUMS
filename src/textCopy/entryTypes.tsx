import { EntryTypes } from "@/types/entry";
import { GalleryItemTypes } from "@/types/galleryItem";

export const BLOCKCHAIN_ENTRY_COPY = {
  title: "Minted Artwork",
  description: "Display media from minted artwork",
};
export const TEXT_ENTRY_COPY = {
  title: "Text",
  description: "Add extra context to your timeline with text.",
};
export const USER_ASSET_ENTRY_COPY = {
  title: "Uploaded Media",
  description: "Upload and display your own media",
};
export const GALLERY_ENTRY_COPY = {
  title: "Gallery",
  description:
    "Connect your timeline to a collection or series of related works",
};

export const ENTRY_TYPE_COPY = {
  [EntryTypes.BlockchainAsset]: BLOCKCHAIN_ENTRY_COPY,
  [EntryTypes.Text]: TEXT_ENTRY_COPY,
  [EntryTypes.UserAsset]: USER_ASSET_ENTRY_COPY,
  [EntryTypes.Gallery]: GALLERY_ENTRY_COPY
};


export const BLOCKCHAIN_GALLERY_ITEM_COPY = BLOCKCHAIN_ENTRY_COPY;
export const TEXT_GALLERY_ITEM_COPY = {
  title: "Text",
  description: "Add extra context to your gallery with text.",
};
export const USER_ASSET_GALLERY_ITEM_COPY = USER_ASSET_ENTRY_COPY;
export const GALLERY_GALLERY_ITEM_COPY = {
  title: "Gallery",
  description:
    "Connect your timeline to a another gallery",
};

export const GALLERY_ITEM_TYPE_COPY = {
  [GalleryItemTypes.BlockchainAsset]: BLOCKCHAIN_GALLERY_ITEM_COPY,
  [GalleryItemTypes.Text]: TEXT_GALLERY_ITEM_COPY,
  [GalleryItemTypes.UserAsset]: USER_ASSET_GALLERY_ITEM_COPY,
  [GalleryItemTypes.Gallery]: GALLERY_GALLERY_ITEM_COPY,
};

