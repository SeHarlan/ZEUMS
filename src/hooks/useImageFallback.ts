import { useHasErroredImage } from "@/atoms/media";
import { BlobUrlBuilderProps, MediaType } from "@/types/media";
import { getImageUrlSources } from "@/utils/media";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseImageFallbackProps {
  media: MediaType;
  onFinalError?: () => void;
   blobUrlBuilderProps?: BlobUrlBuilderProps;
}

export const useImageFallback = ({ media, onFinalError, blobUrlBuilderProps}: UseImageFallbackProps) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoaded, setLoaded] = useState(false);
  const [hasErrored, setHasErrored] = useHasErroredImage(media);

  const onLoad = () => setLoaded(true);
  const sources = getImageUrlSources(media, blobUrlBuilderProps);

  const errorCount = imageIndex;
  const isError = hasErrored || errorCount >= sources.length;
  const finalErrorCalled = useRef(false);
    
  const onError = useCallback(() => {
    if(isError) return;
    setImageIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      return newIndex;
    });
  }, [isError]);   

  useEffect(() => {
    //separate blocks in case hasErrored is true on remount
    if (isError && !finalErrorCalled.current && onFinalError) {
      onFinalError();
      finalErrorCalled.current = true;
    }

    if (isError && !hasErrored) {
      setHasErrored(true);
    }
  }, [isError, hasErrored, setHasErrored, onFinalError]);

  const imageUrl = sources[imageIndex] || "";
  const isFallbackActive = imageIndex > 0;

  const isLoading = !isLoaded && !isError

  return {
    imageUrl,
    isLoading,
    isFallbackActive,
    isError,
    onError,
    isLoaded,
    onLoad,
  }
}