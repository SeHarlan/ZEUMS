import { FC, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { P } from "../typography/Typography";
import { cn } from "@/utils/ui-utils";

interface ExpandableTextProps {
  text?: string;
  maxLines?: number;
  className?: string;
  textClassName?: string;
  buttonClassName?: string;
  showMoreText?: string;
  showLessText?: string;
}

const ExpandableText: FC<ExpandableTextProps> = ({
  text,
  maxLines = 3,
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
    if (textRef.current) {
      const element = textRef.current;
      // Check if the element has scrollable content (indicating overflow)
      const shouldShow = element.scrollHeight > element.clientHeight;
      setShowButton(shouldShow);
    }
  }, [text, maxLines]);
  return (
    <div className={className}>
      <P
        ref={textRef}
        className={cn(
          textClassName,
          !isExpanded && `line-clamp-${maxLines.toString()}`,
        )}
      >
        {text}
      </P>
      {showButton && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "h-auto p-0 text-sm text-muted-foreground/50 mt-1 hover:text-muted-foreground duration-300 transition-colors",
            buttonClassName
          )}
        >
          {isExpanded ? showLessText : showMoreText}
        </Button>
      )}

    </div>
  );
};

export default ExpandableText;