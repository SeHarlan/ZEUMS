"use client"
import ZeumsGlitch from "@/components/pages/landing/ZeumsGlitch";
import GetStartedButton from "@/components/pages/landing/GetStartedButton";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/ui-utils";
import { Button, LinkButton } from "@/components/ui/button";
import { ABOUT, DASHBOARD } from "@/constants/clientRoutes";
import { PageContainer } from "@/components/general/PageContainer";

export default function Home() {
  const[buttonVisible, setButtonVisible] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);


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
    <PageContainer
      noPadding
      maxWidth="full"
    >
      <ZeumsGlitch />
      <div
        ref={buttonRef}
        className={cn("absolute-center md:p-26 max-w-full")}
        onMouseEnter={() => setButtonVisible(true)}
        onMouseLeave={() => setButtonVisible(false)}
      >
        <div
          className={cn(
            "flex flex-col gap-8 bg-popover-blur rounded-lg py-6 px-12",
            "transition-opacity duration-1000",
            buttonVisible ? "opacity-100 " : "opacity-0"
          )}
        >
          <GetStartedButton />

          <LinkButton href={ABOUT} variant="secondary">
            Learn More
          </LinkButton>
        </div>
      </div>
    </PageContainer>
  );
}