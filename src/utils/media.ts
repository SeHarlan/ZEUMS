import {
  BlockchainMedia,
  CdnIdType,
  ImageType,
  isBlockchainImage,
  isBlockchainMedia,
  isImageType,
  MediaCategory,
  MediaType,
  UserMedia,
} from "@/types/media";

export interface getImageOptions {
  optimize?: boolean;
}

export const getImageUrlSources = (media: MediaType, options?: getImageOptions): string[] => {
  const cdn = media.imageCdn;

  const sources = [];

  //try CDNs first
  if (cdn) {
    const { type, cdnId } = cdn;
    if (type === CdnIdType.HELIUS_URL) {
      //helius cdn urls are too long for nextjs image optimization.
      //only use when not using custom optimization
      if (!options?.optimize) sources.push(cdnId);
    } else if (type === CdnIdType.CLOUDINARY_ID) {
      // TODO: Cloudinary, will need to construct this URL
      sources.push(cdnId);
    }
  }

  if (isBlockchainMedia(media) || isBlockchainImage(media)) {
    // For blockchain media, include the original url
    sources.push(media.imageUrl);
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

export const convertMediaToImage = (media: MediaType): ImageType => { 
  if (isImageType(media)) return media;


  // convert blockchain media to image (requires imageUrl)
  if (isBlockchainMedia(media)) {
    const imageMedia: ImageType = {
      imageUrl: media.imageUrl,
      imageCdn: media.imageCdn,
      origin: media.origin,
      aspectRatio: media.aspectRatio,
      category: MediaCategory.Image,
    };
    return imageMedia;
  } else {
    // convert user media to image (no imageUrl)
    const imageMedia: ImageType = {
      imageCdn: media.imageCdn,
      origin: media.origin,
      aspectRatio: media.aspectRatio,
      category: MediaCategory.Image,
    };
    return imageMedia;
  }
}

export const isGif = (media: MediaType) => {
  const isGif = isBlockchainImage(media)
    ? media.imageUrl.endsWith("gif")
    : false;

  return isGif;
}