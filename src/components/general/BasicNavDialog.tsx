"use client"
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/ui-utils";
import { LinkButton } from "@/components/ui/button";
import { ABOUT, LANDING_RETURN_KEY } from "@/constants/clientRoutes";
import { makeReturnQueryParam } from "@/utils/navigation";
import { H1, P } from "@/components/typography/Typography";
import { SUBTITLE_COPY, TITLE_COPY } from "@/textCopy/mainCopy";
import GetStartedButton from "@/components/pages/landing/GetStartedButton";

const BasicNavDialog = () => { 
  const [buttonVisible, setButtonVisible] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonReady, setButtonReady] = useState(false);

  const aboutPath = ABOUT + makeReturnQueryParam(LANDING_RETURN_KEY);

  useEffect(() => {
    // Use closure variables instead of state
    let isTouchingOverButton = false;

    const isTouchOverButton = (touch: Touch): boolean => {
      if (!buttonRef.current) return false;

      const rect = buttonRef.current.getBoundingClientRect();
      
      // Check if touch is within button bounds
      return (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      );
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      isTouchingOverButton = isTouchOverButton(touch);
      setButtonVisible(isTouchingOverButton);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      isTouchingOverButton = isTouchOverButton(touch);
      setButtonVisible(isTouchingOverButton);
    };

    const handleTouchEnd = () => {
      // Only hide if we're not currently over the button
      if (!isTouchingOverButton) {
        setButtonVisible(false);
      }
      isTouchingOverButton = false;
    };

    const timeout = setTimeout(() => {
      setButtonReady(true);
    }, 500);

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
  
  return (
    <div
      ref={buttonRef}
      className={cn("absolute-center md:p-16 max-w-screen")}
      onMouseEnter={() => setButtonVisible(true)}
      onMouseLeave={() => setButtonVisible(false)}
      onTouchStart={() => setButtonVisible(true)}
    >
      <div
        className={cn(
          "space-y-4 bg-popover-blur border rounded-lg py-6 px-8 md:px-12",
          "transition-all duration-500 fill-mode-forwards",
          "w-full max-w-full",
          !buttonReady && "opacity-0",
          buttonVisible
            ? "animate-in zoom-in-90 fade-in-0"
            : "animate-out zoom-out-90 fade-out-0"
        )}
      >
        <div className="text-center whitespace-nowrap">
          <H1>{TITLE_COPY}</H1>
          <P className="text-sm text-muted-foreground ">{SUBTITLE_COPY}</P>
        </div>

        <div className="flex flex-col gap-8">
          <GetStartedButton />

          <LinkButton href={aboutPath} variant="secondary">
            Learn More
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

export default BasicNavDialog