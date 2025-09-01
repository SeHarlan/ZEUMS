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
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0 && buttonRef.current) {
        const touch = event.touches[0];
        const rect = buttonRef.current.getBoundingClientRect();

        // Calculate distance from touch to button center
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;

        const distance = Math.sqrt(
          Math.pow(touch.clientX - buttonCenterX, 2) +
            Math.pow(touch.clientY - buttonCenterY, 2)
        );

        // Show button if touch is within 150px of center
        const proximityThreshold = 150;
        setButtonVisible(distance < proximityThreshold);
      }
    };

    const timeout = setTimeout(() => {
      setButtonReady(true);
    }, 500);

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      clearTimeout(timeout);
    };
  }, []);
  
  return (
    <div
      ref={buttonRef}
      className={cn("absolute-center md:p-16 max-w-screen")}
      onMouseEnter={() => setButtonVisible(true)}
      onMouseLeave={() => setButtonVisible(false)}
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