"use client"
import { navBarVisibleAtom } from "@/atoms/navigation";
import { H1, P } from "@/components/typography/Typography";
import { LinkButton } from "@/components/ui/button";
import { ABOUT, LANDING_RETURN_KEY } from "@/constants/clientRoutes";
import { useBreakpoints } from "@/context/ResponsiveProvider";
import { SUBTITLE_COPY, TITLE_COPY } from "@/textCopy/mainCopy";
import { makeReturnQueryParam } from "@/utils/navigation";
import { cn } from "@/utils/ui-utils";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import GetStartedButton from "./GetStartedButton";

const BasicNavDialog = () => { 
  const [buttonVisible, setButtonVisible] = useState(false);
  const navBarVisible = useAtomValue(navBarVisibleAtom);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonReady, setButtonReady] = useState(false);
  const { isMd } = useBreakpoints();

  const aboutPath = ABOUT + makeReturnQueryParam(LANDING_RETURN_KEY);

  const showButton = navBarVisible && (buttonVisible || !isMd);

  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);



  return (
    <div
      ref={buttonRef}
      className={cn("absolute-center md:px-16 md:py-8 max-w-screen")}
      onMouseEnter={() => setButtonVisible(true)}
      onMouseLeave={() => setButtonVisible(false)}
    >
      <div
        className={cn(
          "space-y-4 bg-popover-blur border rounded-lg py-6 px-8 md:px-12",
          "transition-all duration-500 fill-mode-forwards",
          "w-full max-w-full",
          !buttonReady && "opacity-0",
          showButton
            ? "animate-in zoom-in-90 fade-in-0"
            : "animate-out zoom-out-90 fade-out-0"
        )}
      >
        <div className="text-center whitespace-nowrap">
          <H1>{TITLE_COPY}</H1>
          <P className="text-sm text-muted-foreground ">{SUBTITLE_COPY}</P>
        </div>

        <div className={cn("flex flex-col gap-8")}>
          <GetStartedButton disabled={!showButton} />

          <LinkButton href={aboutPath} variant="secondary" disabled={!showButton}>
            Learn More
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

export default BasicNavDialog