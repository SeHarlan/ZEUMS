import { FC, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { P } from "../typography/Typography";
import { cn } from "@/utils/ui-utils";
import { PopoverContent, PopoverTrigger } from "../ui/popover";
import { Popover } from "../ui/popover";
import { debounce } from "@/utils/general";

interface ExpandableTextProps {
  text?: string;
  clamp?: string;
  className?: string;
  textClassName?: string;
  buttonClassName?: string;
  showMoreText?: string;
  showLessText?: string;
}

const ExpandableText: FC<ExpandableTextProps> = ({
  text,
  clamp = "line-clamp-2",
  className,
  textClassName,
  buttonClassName,
  showMoreText = "See more",
  showLessText = "See less",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const setIsClamped = () => {
    if (textRef.current) {
      const element = textRef.current;
        // Check if the element has scrollable content (indicating overflow)
        const shouldShow = element.scrollHeight - element.clientHeight >= 1;
        setShowButton(shouldShow);
      }
    };
    setIsClamped();

    const debouncedSetIsClamped = debounce(setIsClamped, 100);

    window.addEventListener("resize", debouncedSetIsClamped);
    return () => window.removeEventListener("resize", debouncedSetIsClamped);
  }, [text, clamp]);

  if (!text) return null;

  return (
    <div className={className}>
      <P
        ref={textRef}
        className={cn(textClassName, clamp, isExpanded && "opacity-50")}
      >
        {text}
      </P>
      {showButton && (
        <Popover open={isExpanded} onOpenChange={setIsExpanded}>
          <PopoverTrigger asChild>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "h-auto p-0 text-sm text-muted-foreground/50 mt-1 hover:text-muted-foreground duration-300 transition-colors",
                "absolute -bottom-6 left-0",
                buttonClassName
              )}
            >
              {isExpanded ? showLessText : showMoreText}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-3rem)] max-w-xl m-6 bg-popover-blur">
            <P className={"whitespace-pre-line"}>{text}</P>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default ExpandableText;