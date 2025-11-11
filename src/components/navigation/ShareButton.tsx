import { copyTextToClipboard } from "@/utils/general";
import { CheckIcon, ShareIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const ShareButton = () => { 
  const [urlCopied, setUrlCopied] = useState(false);
  const pathname = usePathname();

  const handleShareClick = () => {
    const fullURL = `Zeums.art${pathname}`;
    copyTextToClipboard(fullURL).then(() => {
      setUrlCopied(true);
      toast.success("Ready to share!", {
        description: "This page's URL has been copied to your clipboard",
        duration: 3000,
      });
      setTimeout(() => {
        setUrlCopied(false);
      }, 2000);
    });
  };


  return (
    <Button
      onClick={handleShareClick}
      size="icon"
      variant="outline"
      className="size-10"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            {urlCopied ? (
              <CheckIcon className="size-5 text-emerald-600" />
            ) : (
              <ShareIcon className="size-5" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Share this page's URL
        </TooltipContent>
      </Tooltip>
    </Button>
  );
}