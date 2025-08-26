import { FC, ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/utils/ui-utils";

interface ScrollableDialogProps { 
  children: ReactNode;
  trigger: ReactNode;
  footerContent?: ReactNode;
  title?: string;
  description?: string;
  wrapperClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
//TODO (modify to allow for header and footer content)
const ScrollableDialog: FC<ScrollableDialogProps> = ({
  trigger,
  children,
  title,
  description,
  footerContent,
  wrapperClassName,
  open,
  onOpenChange,
}) => { 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          // 3 rows: header | middle (auto→1fr) | footer
          "grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-y-hidden",
          wrapperClassName
        )}
      >
        <DialogHeader className="row-start-1">
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="row-start-2 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-3">{children}</div>
          </ScrollArea>
        </div>

        <DialogFooter className="row-start-3">
          {footerContent}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ScrollableDialog;