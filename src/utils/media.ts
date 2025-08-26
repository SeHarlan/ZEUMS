import {
  BlockchainMedia,
  CdnIdType,
  isBlockchainImage,
  isBlockchainMedia,
  MediaType,
  UserMedia,
} from "@/types/media";

export const getImageUrlSources = (media: MediaType): string[] => {
  const cdn = media.imageCdn;

  const sources = [];

  if (isBlockchainMedia(media) || isBlockchainImage(media)) {
    // For blockchain media, include the original url
    sources.push(media.imageUrl);
  }

  if (cdn) {
    const { type, cdnId } = cdn;
    if (type === CdnIdType.HELIUS_URL) {
      sources.push(cdnId);
    } else if (type === CdnIdType.CLOUDINARY_ID) {
      // TODO: Cloudinary, will need to construct this URL
      sources.push(cdnId);
    }
  }

  return sources.length > 0
    ? sources
    : [""]; // Return an empty string if no valid image URL is found
};

export const getMediaUrl = (media: BlockchainMedia | UserMedia) => {
  const cdn = media.mediaCdn;

  if (cdn) {
    const { type, cdnId } = cdn;
    if (type === CdnIdType.CLOUDINARY_ID) {
      // TODO: Cloudinary, will need to construct this URL
      return cdnId;
    }

    return ""; // For now, we don't handle other CDN types
  }

  // Fallback to the media URL if no CDN is available
  if (isBlockchainMedia(media)) {
    return media.mediaUrl;
  }

  return ""; // No valid video URL found
};


export const getImageAspectRatio = (imageElement: HTMLImageElement) => {
  return imageElement.naturalWidth / imageElement.naturalHeight;
}

export const getVideoAspectRatio = (videoElement: HTMLVideoElement) => {
  return videoElement.videoWidth / videoElement.videoHeight;
}

