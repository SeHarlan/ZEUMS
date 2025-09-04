"use client";
import { RefObject, useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  passedRef?: RefObject<HTMLDivElement | null>;
}

export function useInView({ threshold = 0.1, rootMargin = "50px", triggerOnce = false, passedRef }: UseInViewOptions = {}) {

  const [inView, setInView] = useState(false);
  const internalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = passedRef?.current || internalRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        if (isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, passedRef]);
  

  return {
    ref: passedRef || internalRef,
    inView
  };
}
