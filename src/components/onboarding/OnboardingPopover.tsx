"use client";


import { INITIALIZED_KEY } from "@/atoms/onboarding/onboardingStages";
import { OnboardingStepAtom } from "@/atoms/onboarding/onboardingSteps";
import { cn } from "@/utils/ui-utils";
import { useAtom } from "jotai";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { P } from "../typography/Typography";
import { Button } from "../ui/button";


interface PopoverStep { 
  onPrevious?: () => void;
  onActive?: () => void;
  onNext?: () => void;
  triggerNext?: boolean
  content: {
    title?: string;
    description?: string;
    body?: ReactNode;
  }
  allowPageInteractivity?: boolean;
}

export const ONBOARDING_Z_INDEX = 200 as const;

export const OnboardingPopover = <T extends string>({
  atom,
  steps,
  pause
}: {
  atom: OnboardingStepAtom<T>;
  steps: Record<typeof INITIALIZED_KEY | T, PopoverStep>;
  pause?: boolean;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentDimensions, setContentDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [centerPosition, setCenterPosition] = useState<{ x: number, y: number } | null>(null);

  const [stepProps, setStep] = useAtom(atom);
  const { activeTriggerElement, totalSteps, activeIndex, activeStep, completedSteps, stage } = stepProps;
  const isFirstStep = activeIndex === 0;
  const isLastStep = activeIndex === totalSteps - 1;
  const activeStepProps = (!pause && activeStep) ? steps[activeStep] : null;
  const activeContent = activeStepProps?.content;
  const stageNotStarted = stage === "notStarted";
  const stageComplete = stage === "complete";
  const hideOnboarding = pause || stageComplete;

  //true by default, false if allowPageInteractivity is explicitly set to false
  const allowPageInteractivity = activeStepProps?.allowPageInteractivity === undefined ? true : activeStepProps.allowPageInteractivity;

  const triggerNext = activeStepProps?.triggerNext;
  const onPrevious = activeStepProps?.onPrevious;
  const onActive = activeStepProps?.onActive;
  const onNext = activeStepProps?.onNext;

  const handleSkip = () => {
    setStep("complete");
  }
  const handleGetStarted = () => {
    setStep("inProgress");
  }

  const handleNext = useCallback(() => {
    setStep("next");
    onNext?.();
  }, [setStep, onNext]);

  const handlePrevious = () => {
    setStep("previous");
    onPrevious?.();
  };

  useEffect(() => {
    if (triggerNext) {
      handleNext();
    }
  }, [handleNext, triggerNext]);

  //will trigger when onActive changes
  useEffect(() => {
    onActive?.();
  }, [onActive]);

  useEffect(() => {
    if (hideOnboarding) return;
    let previousPositionKey: string | undefined = undefined;
    let animationFrameId: number | undefined = undefined;

    const updateTriggerPosition = () => {
      if (activeTriggerElement) {
        const rect = activeTriggerElement.getBoundingClientRect();
        if (rect.width && rect.height) {
          setTriggerRect(rect);
          setCenterPosition(null);
          const positionKey = `${rect.x}-${rect.y}-${rect.width}-${rect.height}`;
          return positionKey;
        }
      }

      setCenterPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    };

    const updatePosition = () => {
      if (contentRef.current) {
        const { width, height } = contentRef.current.getBoundingClientRect();
        setContentDimensions({ width, height });
      }
      previousPositionKey = updateTriggerPosition();
    };

    updatePosition();

    const updateWhileMoving = () => {
      if (!activeTriggerElement) return;
      const positionKey = updateTriggerPosition();
      if (positionKey !== previousPositionKey) {
        animationFrameId = requestAnimationFrame(updateWhileMoving);
        previousPositionKey = positionKey;
      }
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          updateWhileMoving();
        }
      },
      {
        threshold: [0, 0.5, 1],
      }
    );

    if (activeTriggerElement) {
      intersectionObserver.observe(activeTriggerElement);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      setTriggerRect(null);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
    };
  }, [activeTriggerElement, hideOnboarding, stageNotStarted, activeStep]);

  const position = useMemo(() => {
    if (
      hideOnboarding ||
      contentDimensions.width === 0 ||
      contentDimensions.height === 0
    ) {
      return undefined;
    }

    if (centerPosition) {
      return {
        left: centerPosition.x - contentDimensions.width / 2,
        top: centerPosition.y - contentDimensions.height / 2,
        zIndex: ONBOARDING_Z_INDEX + 2,
      };
    }

    if (!triggerRect) return undefined;

    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const halfScreen = screenHeight / 2;

    // Determine if trigger is in upper or lower half of screen
    const isTriggerInUpperHalf = triggerRect.top < halfScreen;

    // Calculate base position
    let top: number;
    let left: number;

    const yPadding = 16;

    if (isTriggerInUpperHalf) {
      // Position below the trigger
      top = triggerRect.bottom + yPadding;
    } else {
      // Position above the trigger
      top = triggerRect.top - contentDimensions.height - yPadding;
    }

    // Center horizontally relative to trigger
    left =
      triggerRect.left + triggerRect.width / 2 - contentDimensions.width / 2;

    // Ensure content stays within screen bounds
    const minLeft = 0; // 8px margin from screen edge
    const maxLeft = screenWidth - contentDimensions.width;
    const minTop = 0;
    const maxTop = screenHeight - contentDimensions.height;

    // Clamp horizontal position
    left = Math.max(minLeft, Math.min(maxLeft, left));

    // Clamp vertical position
    top = Math.max(minTop, Math.min(maxTop, top));

    return {
      left,
      top,
      zIndex: ONBOARDING_Z_INDEX + 2,
    };
  }, [triggerRect, contentDimensions, hideOnboarding, centerPosition]);

  const getMaskRect = (padding: number) => {
    if (!triggerRect || hideOnboarding) return null;
    if (stageNotStarted && centerPosition) {
      return {
        x: centerPosition.x - contentDimensions.width / 2,
        y: centerPosition.y - contentDimensions.height / 2,
        width: contentDimensions.width,
        height: contentDimensions.height,
      };
    }
    return {
      x: triggerRect.x - padding,
      y: triggerRect.y - padding,
      width: triggerRect.width + padding * 2,
      height: triggerRect.height + padding * 2,
      radius: 12,
    };
  };
  
  const maskRect = getMaskRect(16);

  if (hideOnboarding) return null;

  return createPortal(
    <>
      <svg
        width={"100%"}
        height={"100%"}
        className="fixed inset-0 pointer-events-none"
      >
        <defs>
          <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
            <feOffset dx="0" dy="0" result="offset" />
            <feFlood floodColor="black" floodOpacity="1" />
            <feComposite in2="offset" operator="in" />
          </filter>
          {maskRect && (
            <mask id="blur-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={maskRect.x}
                y={maskRect.y}
                width={maskRect.width}
                height={maskRect.height}
                fill="black"
                rx={maskRect.radius}
                ry={maskRect.radius}
                filter="url(#drop-shadow)"
              />
            </mask>
          )}
        </defs>
      </svg>

      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-[2px]",
          
          //"pointer-events-none" prevents the scrim from capturing clicks, this allows the page to be interacted with
          allowPageInteractivity ? "cursor-auto pointer-events-none" : "cursor-not-allowed"
        )}
        style={{
          zIndex: ONBOARDING_Z_INDEX,
          mask: `url(#blur-mask)`,
          WebkitMask: `url(#blur-mask)`,
        }}
      />

      <div
        className={cn(
          "fixed p-4 w-fit duration-500 transition-all ease-in-out min-w-xs max-w-lg max-h-screen overflow-auto pointer-events-auto"
        )}
        style={position}
        ref={contentRef}
      >
        <div className="rounded-md border p-4 bg-popover shadow space-y-4">
          <div className="flex items-center justify-center px-4 gap-2">
            {Array.from({ length: totalSteps - 1 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  index === completedSteps ? "bg-primary" : "bg-border"
                )}
              />
            ))}
          </div>

          <div className="space-y-2">
            {activeContent?.title && (
              <P className="text-xl font-medium text-center">
                {activeContent.title}
              </P>
            )}
            {activeContent?.description && (
              <P className="text-muted-foreground text-center">
                {activeContent.description}
              </P>
            )}
          </div>

          {activeContent?.body && activeContent.body}

          {stageNotStarted ? (
            <div className="flex flex-col gap-2 justify-center mt-6">
              <Button onClick={handleGetStarted} size="lg" autoFocus={true}>
                Let&apos;s get started!
              </Button>
              <Button onClick={handleSkip} variant="link">
                No thanks, I know what I&apos;m doing
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
              >
                <ArrowLeftIcon />
              </Button>

              {isLastStep ? (
                <Button size="sm" onClick={handleNext}>
                  Finish
                  <CheckIcon />
                </Button>
              ) : (
                <Button size="sm" onClick={handleNext}>
                  Next
                  <ArrowRightIcon />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
