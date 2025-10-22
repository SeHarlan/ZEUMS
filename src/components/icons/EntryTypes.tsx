import { EntryTypes } from "@/types/entry";
import { GalleryItemTypes } from "@/types/galleryItem";
import { CaptionsIcon, CpuIcon, GalleryVerticalIcon, ImageUpIcon } from "lucide-react";

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


export const BlockchainAssetGalleryItemIcon = BlockchainAssetEntryIcon;
export const TextGalleryItemIcon = TextEntryIcon;
export const UserAssetGalleryItemIcon = UserAssetEntryIcon;
export const GalleryGalleryItemIcon = GalleryEntryIcon;

export const GalleryItemTypeIcons = {
  [GalleryItemTypes.BlockchainAsset]: BlockchainAssetGalleryItemIcon,
  [GalleryItemTypes.Text]: TextGalleryItemIcon,
  [GalleryItemTypes.UserAsset]: UserAssetGalleryItemIcon,
  [GalleryItemTypes.Gallery]: GalleryGalleryItemIcon,
};