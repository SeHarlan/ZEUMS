import { EntryTypes } from "@/types/entry";
import { GalleryItemTypes } from "@/types/galleryItem";
import { CaptionsIcon, CpuIcon, GalleryVerticalEndIcon, ImageUpIcon } from "lucide-react"

export const BlockchainAssetEntryIcon = CpuIcon
export const TextEntryIcon = CaptionsIcon;
export const UserAssetEntryIcon = ImageUpIcon;
export const GalleryEntryIcon = GalleryVerticalEndIcon;

export const EntryTypeIcons = {
  [EntryTypes.BlockchainAsset]: BlockchainAssetEntryIcon,
  [EntryTypes.Text]: TextEntryIcon,
  [EntryTypes.UserAsset]: UserAssetEntryIcon,
  [EntryTypes.Gallery]: GalleryVerticalEndIcon
}

export const GalleryItemTypeIcons = {
  [GalleryItemTypes.BlockchainAsset]: BlockchainAssetEntryIcon,
  [GalleryItemTypes.Text]: TextEntryIcon,
  [GalleryItemTypes.UserAsset]: UserAssetEntryIcon,
  [GalleryItemTypes.Gallery]: GalleryVerticalEndIcon
}