"use client";
import { useBreakpoints } from "@/context/ResponsiveProvider";
import { RefObject, useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  mobileRootMargin?: string
  triggerOnce?: boolean;
  passedRef?: RefObject<HTMLDivElement | null>;
}

export function useInView({
  threshold = 0,
  rootMargin = "50px",
  mobileRootMargin = "0px",
  triggerOnce = false,
  passedRef,
}: UseInViewOptions = {}) {
  const [inView, setInView] = useState(false);
  const internalRef = useRef<HTMLDivElement | null>(null);
  const { isMd } = useBreakpoints();

  useEffect(() => {
    const element = passedRef?.current || internalRef.current;
    if (!element) return;

    const responsiveRootMargin = !isMd ? mobileRootMargin : rootMargin;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        if (isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      {
        threshold,
        rootMargin: responsiveRootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect(); // Ensure complete cleanup
    };
  }, [threshold, rootMargin, mobileRootMargin, isMd, triggerOnce, passedRef]);

  return {
    ref: passedRef || internalRef,
    inView,
  };
}
