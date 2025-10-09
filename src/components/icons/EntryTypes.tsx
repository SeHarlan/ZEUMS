import { EntryTypes } from "@/types/entry";
import { GalleryItemTypes } from "@/types/galleryItem";
import { CaptionsIcon, CpuIcon, GalleryVerticalIcon, ImageUpIcon } from "lucide-react"

export const BlockchainAssetEntryIcon = CpuIcon
export const TextEntryIcon = CaptionsIcon;
export const UserAssetEntryIcon = ImageUpIcon;
export const GalleryEntryIcon = GalleryVerticalIcon;


export const EntryTypeIcons = {
  [EntryTypes.BlockchainAsset]: BlockchainAssetEntryIcon,
  [EntryTypes.Text]: TextEntryIcon,
  [EntryTypes.UserAsset]: UserAssetEntryIcon,
  [EntryTypes.Gallery]: GalleryEntryIcon,
};
export const GalleryItemTypeIcons = {
  [GalleryItemTypes.BlockchainAsset]: BlockchainAssetEntryIcon,
  [GalleryItemTypes.Text]: TextEntryIcon,
  [GalleryItemTypes.UserAsset]: UserAssetEntryIcon,
  [GalleryItemTypes.Gallery]: GalleryEntryIcon,
};