import { MediaType } from "@/types/media";
import { getImageUrlSources } from "@/utils/media";
import { useCallback, useEffect, useMemo, useState } from "react";


export const useImageFallback = (media: MediaType, onFinalError?: () => void) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoaded, setLoaded] = useState(false);
  const [finalErrorCalled, setFinalErrorCalled] = useState(false);
  
  const onLoad = () => setLoaded(true);
  const sources = getImageUrlSources(media);
  const isError = useMemo(() =>
    imageIndex >= sources.length
  , [imageIndex, sources]);
    
  const onError = useCallback(() => {
    if(isError) return;
    setImageIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      return newIndex;
    });
  }, [isError]);   

  useEffect(() => {
    //if error count/index is exactly 1 over source length, call onFinalError
    if (isError && !finalErrorCalled && onFinalError) {
      onFinalError();
      setFinalErrorCalled(true);
    }
  }, [imageIndex, onFinalError, finalErrorCalled, isError]);

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