import { MD_BREAKPOINT } from "@/constants/ui";
import { debounce } from "@/utils/general";
import { useCallback, useEffect, useState } from "react";

import { useRef } from "react";


const useGalleryDimensions = (useResponsive = true, maxHeightRatio = 0.75) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [maxHeight, setMaxHeight] = useState<number>(0);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  const isReady = !!containerWidth && !!maxHeight;

  const getDimensions = useCallback(() => {
    if (!containerRef?.current) return;
    const rowWidth = containerRef.current.offsetWidth;
    setContainerWidth(rowWidth);

    setMaxHeight(window.innerHeight * maxHeightRatio);
    
    if (useResponsive) {
      const desktop = window.innerWidth >= MD_BREAKPOINT;
      setIsDesktop(desktop);
    } 
  }, [containerRef, maxHeightRatio, useResponsive]);
  
  useEffect(() => {
    
    const debouncedGetDimensions = debounce(getDimensions, 100);
    getDimensions();


    window.addEventListener("resize", debouncedGetDimensions);
    return () => {
      debouncedGetDimensions.cancel();
      window.removeEventListener("resize", debouncedGetDimensions);
    };
  }, [getDimensions]);

  return { containerWidth, maxHeight, isDesktop, isReady, containerRef, getDimensions };
};

export default useGalleryDimensions;