import { ParsedBlockChainAsset } from "@/types/asset";
import { BlockchainAttribute, EntryTypes } from "@/types/entry";
import { BlockchainImage, BlockchainMedia, CdnIdType, MediaCategory, MediaOrigin } from "@/types/media";
import { ChainIdsEnum } from "@/types/wallet";
import { MallowArtwork } from "@/types/mallow";

export const parseMallowAssets = (
  rawAssets: MallowArtwork[]
): ParsedBlockChainAsset[] => {
  const parsedAssets: ParsedBlockChainAsset[] = [];

  for (const asset of rawAssets) {
    // Filter out assets without required fields
    if (!asset.id || !asset.title) continue;

    // Parse attributes
    const attributes: BlockchainAttribute[] = asset.attributes
      ?.map((attr) => ({
        type: attr.trait_type,
        value: String(attr.value),
      })) || [];

    // Parse creators
    const onChainCreators = asset.creator_address
      ? [
          {
            address: asset.creator_address,
            share: 100, // Default share if not provided
          },
        ]
      : [];

    // Parse owner
    const onChainOwner = {
      address: asset.owner_address || asset.creator_address || "",
    };

    // Parse media and determine category
    const { imageCdnUrl, videoUrl, htmlUrl, vrUrl } = parseMallowMedia(asset);

    let category: MediaCategory = MediaCategory.Image;
    if (videoUrl) category = MediaCategory.Video;
    if (htmlUrl) category = MediaCategory.Html;
    if (vrUrl) category = MediaCategory.Vr;

    const mediaUrl = videoUrl || htmlUrl || vrUrl;

    const imageCdn = imageCdnUrl
      ? {
          type: CdnIdType.HELIUS_URL, // Using HELIUS_URL as placeholder
          cdnId: imageCdnUrl,
        }
      : undefined;

    const media: BlockchainImage | BlockchainMedia = {
      origin: MediaOrigin.Blockchain,
      category,
      aspectRatio: undefined,
      imageUrl: asset.image_url || "",
      imageCdn,
      ...(category !== MediaCategory.Image && { mediaUrl: mediaUrl! }),
    } as BlockchainImage | BlockchainMedia;

    // Determine blockchain (default to SOLANA if not specified)
    let blockchain = ChainIdsEnum.SOLANA;
    if (asset.blockchain) {
      switch (asset.blockchain.toLowerCase()) {
        case "ethereum":
        case "eth":
          blockchain = ChainIdsEnum.ETHEREUM;
          break;
        case "polygon":
          blockchain = ChainIdsEnum.POLYGON;
          break;
        default:
          blockchain = ChainIdsEnum.SOLANA;
      }
    }

    const parsedAsset: ParsedBlockChainAsset = {
      blockchain,
      entryType: EntryTypes.BlockchainAsset,
      tokenAddress: asset.token_address || asset.id,
      title: asset.title,
      description: asset.description,
      onChainCreators,
      onChainOwner,
      attributes,
      media,
    };

    parsedAssets.push(parsedAsset);
  }

  // Sort assets by title, then by token address
  const sortedAssets = parsedAssets.sort((a, b) => {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    if (a.tokenAddress < b.tokenAddress) return -1;
    if (a.tokenAddress > b.tokenAddress) return 1;
    return 0;
  });

  return sortedAssets;
};

type ParseMallowMediaProps = MallowArtwork;

export const parseMallowMedia = (asset: ParseMallowMediaProps) => {
  let imageCdnUrl: string | undefined;
  let videoUrl: string | undefined;
  let htmlUrl: string | undefined;
  let vrUrl: string | undefined;

  // Check mime type to determine media category
  if (asset.mime_type) {
    if (asset.mime_type.includes("image")) {
      imageCdnUrl = asset.file_uri || asset.image_url;
    } else if (asset.mime_type.includes("video")) {
      videoUrl = asset.animation_url || asset.file_uri;
    } else if (asset.mime_type.includes("html")) {
      htmlUrl = asset.animation_url || asset.file_uri;
    } else if (asset.mime_type.includes("model")) {
      vrUrl = asset.animation_url || asset.file_uri;
    }
  }

  // Fallback: if animation_url exists but no mime type info, assume it's a video
  if (asset.animation_url && !videoUrl && !htmlUrl && !vrUrl) {
    videoUrl = asset.animation_url;
  }

  // If we have an image URL but no CDN URL, use the image URL
  if (asset.image_url && !imageCdnUrl) {
    imageCdnUrl = asset.image_url;
  }

  return {
    imageCdnUrl,
    videoUrl,
    htmlUrl,
    vrUrl,
  };
};