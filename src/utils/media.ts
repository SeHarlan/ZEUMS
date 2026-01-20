import {
  BlockchainMedia,
  CdnIdType,
  ImageType,
  isBlockchainImage,
  isBlockchainMedia,
  isImageType,
  MediaCategory,
  MediaType,
  UserMedia
} from "@/types/media";

export const getImageUrlSources = (media: MediaType): string[] => {
  const cdn = media.imageCdn;

  const sources = [];

  if (cdn) {
    const { type, cdnId } = cdn;
    // if (type === CdnIdType.HELIUS_URL) {
    //   //only use this when quality doesnt matter cause we

    // } else 
    if (type === CdnIdType.VERCEL_BLOB_USER_IMAGE) {
      // TODO Important: will need to construct this URL
      const cdnUrl = constructVercelBlobUserImageUrl(cdnId);
      sources.push(cdnUrl);
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
    // const { type, cdnId } = cdn;
    // if (type === CdnIdType.VERCEL_BLOB_USER_IMAGE) {
    //   // TODO important: will need to construct this URL here
    //   return cdnId;
    // }

    // For now, we don't handle media CDNs 
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

