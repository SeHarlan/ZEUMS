import { Button, LinkButton } from "@/components/ui/button"
import { ArrowBigLeftDashIcon, ArrowBigLeftIcon, ArrowBigRightDashIcon, ArrowBigRightIcon } from "lucide-react"
import { FC } from "react";

interface PageTurnProps {
  path: string;
  onClick?: () => void;
  useOnClick?: boolean; // Optional prop to determine if onClick should be used
}
export const PageTurnLeft: FC<PageTurnProps> = ({path, onClick, useOnClick}) => { 
  return (
    <div className="z-30 fixed top-1/2 -translate-y-1/2 left-2 md:left-4 lg:left-8">
      {useOnClick ? (
        <Button
          size="icon"
          variant="outline"
          className="h-12 w-12"
          onClick={onClick}
          disabled={!onClick}
        >
          <ArrowBigLeftIcon className="text-muted-foreground h-6! w-6!" />
        </Button>
      ) : (
        <LinkButton
          href={path}
          size="icon"
          variant="outline"
          className="h-12 w-12"
        >
          <ArrowBigLeftDashIcon className="text-muted-foreground min-h-6 min-w-6" />
        </LinkButton>
      )}
    </div>
  );
}

export const PageTurnRight: FC<PageTurnProps> = ({path, onClick, useOnClick}) => { 
  return (
    <div className="z-30 fixed top-1/2 -translate-y-1/2 right-2 md:right-4 lg:right-8">
      {useOnClick ? (
        <Button
          size="icon"
          variant="outline"
          className="h-12 w-12"
          onClick={onClick}
          disabled={!onClick}
        >
          <ArrowBigRightIcon className="text-muted-foreground h-6! w-6!" />
        </Button>
      ) : (
        <LinkButton
          href={path}
          size="icon"
          variant="outline"
          className="h-12 w-12"
        >
          <ArrowBigRightDashIcon className="text-muted-foreground min-h-6 min-w-6" />
        </LinkButton>
      )}
    </div>
  );
}
