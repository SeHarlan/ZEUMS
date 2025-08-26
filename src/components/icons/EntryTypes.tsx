import { EntryTypes } from "@/types/entry";
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