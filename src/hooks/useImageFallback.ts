import { MediaType } from "@/types/media";
import { getImageUrlSources } from "@/utils/media";
import { useEffect, useState } from "react";

export const useImageFallback = (media: MediaType) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    setImageIndex(0);
    setLoaded(false);
  }, [media]);
  
  const onError = () => {
    setImageIndex((prevIndex) => prevIndex + 1);
  }
  
  const onLoad = () => setLoaded(true);
  
  const sources = getImageUrlSources(media);
  const imageUrl = sources[imageIndex] || "";
  const isFallbackActive = imageIndex > 0;

  const isError = !imageUrl ||imageIndex >= sources.length;
  
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