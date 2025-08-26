import { EntryTypes } from "@/types/entry"

export const BLOCKCHAIN_ENTRY_COPY = {
  title: "Blockchain Asset",
  description: "Display media from a blockchain asset",
};
export const TEXT_ENTRY_COPY = {
  title: "Text",
  description: "Add extra context with text",
};
export const USER_ASSET_ENTRY_COPY = {
  title: "Uploaded",
  description: "TODO",
};
export const GALLERY_ENTRY_COPY = {
  title: "Gallery",
  description: "TODO",
};

export const ENTRY_TYPE_COPY = {
 [EntryTypes.BlockchainAsset]: BLOCKCHAIN_ENTRY_COPY,
  [EntryTypes.Text]: TEXT_ENTRY_COPY,
  [EntryTypes.UserAsset]: USER_ASSET_ENTRY_COPY,
  [EntryTypes.Gallery]: GALLERY_ENTRY_COPY
};

