"use client";
import { PageContainer } from "@/components/general/PageContainer";
import GetStartedButton from "@/components/pages/landing/GetStartedButton";
import GlitchFeedback from "@/components/pages/landing/GlitchFeedback";
import { H1, P } from "@/components/typography/Typography";
import { LinkButton } from "@/components/ui/button";
import { ABOUT, LANDING_RETURN_KEY } from "@/constants/clientRoutes";
import { SUBTITLE_COPY, TITLE_COPY } from "@/textCopy/mainCopy";
import { makeReturnQueryParam } from "@/utils/navigation";
import { cn } from "@/utils/ui-utils";
import { useEffect, useRef, useState } from "react";

const ComingSoonPage = () => {
   const [buttonVisible, setButtonVisible] = useState(false);
   const buttonRef = useRef<HTMLDivElement>(null);

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
     window.addEventListener("touchmove", handleTouchMove, { passive: true });
     return () => {
       window.removeEventListener("touchmove", handleTouchMove);
     };
   }, []);
  
  return (
    <PageContainer maxWidth="full" noPadding>
      <GlitchFeedback title={TITLE_COPY} subtitle={"Coming soon..."} />
      <div
        ref={buttonRef}
        className={cn("absolute-center md:p-26 max-w-full")}
        onMouseEnter={() => setButtonVisible(true)}
        onMouseLeave={() => setButtonVisible(false)}
      >
        <div
          className={cn(
            "space-y-4 bg-popover-blur rounded-lg py-6 px-12",
            "transition-opacity duration-1000",
            buttonVisible ? "opacity-100 " : "opacity-0"
          )}
        >
          <div className="text-center">
            <H1>{TITLE_COPY}</H1>
            <P className="text-sm text-muted-foreground l">{SUBTITLE_COPY}</P>
          </div>

          <div className="flex flex-col gap-8">
            <GetStartedButton />

            <LinkButton href={aboutPath} variant="secondary">
              Learn More
            </LinkButton>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ComingSoonPage;