import { UploadCategory } from "@/constants/uploadCategories";
import { isUserAssetEntry, type TimelineEntry } from "@/types/entry";
import { isGalleryItem, isUserAssetGalleryItem, type GalleryItem } from "@/types/galleryItem";
import {
  BlobUrlBuilderProps,
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
import { constructVercelBlobUserMediaUrl } from "./clientImageUpload";

export const getBlobUrlBuilderPropsFromItemOrEntry = (
  asset?: GalleryItem | TimelineEntry | null
): BlobUrlBuilderProps | undefined => {
  if (!asset) return undefined;
  if (!("media" in asset) || !asset.media) return undefined;

  if (isGalleryItem(asset)) { 
    if (!isUserAssetGalleryItem(asset)) return undefined;
  } else {
    if (!isUserAssetEntry(asset)) return undefined;
  }
  
  const category =
    asset.media.category === MediaCategory.Image
      ? UploadCategory.UPLOADED_IMAGE
      : UploadCategory.UPLOADED_THUMBNAIL;

  return {
    userId: asset.owner.toString(),
    category,
  };
};


//TODO: multiple sources is depricated, will need to clean this up at some point
export const getImageUrlSources = (media: MediaType, blobUrlBuilderProps?: BlobUrlBuilderProps): string[] => {
  
  const cdn = media.imageCdn;

  const sources = [];

  if (cdn) {
    const { type, cdnId } = cdn;
    // if (type === CdnIdType.HELIUS_URL) {
    //   //only use this when quality doesnt matter cause we

    // } else 
    if (type === CdnIdType.VERCEL_BLOB_USER_IMAGE) {
      if (blobUrlBuilderProps) {
        const cdnUrl = constructVercelBlobUserMediaUrl(cdnId, blobUrlBuilderProps.userId, blobUrlBuilderProps.category);
        sources.push(cdnUrl);
      } 
    }
  }

  if (isBlockchainImage(media) || isBlockchainMedia(media)) {
    sources.push(media.imageUrl);
  }

  return sources;
};

export const getMediaUrl = (media: BlockchainMedia | UserMedia, blobUrlBuilderProps?: BlobUrlBuilderProps) => {
  const cdn = media.mediaCdn;

  if (cdn) {
    const { type, cdnId } = cdn;
    if (type === CdnIdType.VERCEL_BLOB_USER_VIDEO) {
      if (blobUrlBuilderProps) {
        const cdnUrl = constructVercelBlobUserMediaUrl(
          cdnId,
          blobUrlBuilderProps.userId,
          blobUrlBuilderProps.category,
        );
        return cdnUrl;
      }
    }
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

/**
 * Calculates the aspect ratio of an image file by loading it into an Image element.
 * @param file - The image File object
 * @returns Promise resolving to the aspect ratio (width / height)
 */
export const getFileAspectRatio = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      resolve(aspectRatio);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image file"));
    };

    img.src = url;
  });
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

