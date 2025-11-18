import { Button } from "@/components/ui/button";
import { cn } from "@/utils/ui-utils";
import { FC, ReactNode } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./../ui/sheet";

interface SideDrawerProps { 
  title: string;
  description?: string; 
  children?: ReactNode; 
  triggerButton?: ReactNode; 
  actionButton?: ReactNode; 
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  disableInteractOutside?: boolean;
  scrollAreaId?: string;
}

const SideDrawer: FC<SideDrawerProps> = ({
  title,
  description,
  children,
  triggerButton,
  actionButton,
  open,
  onOpenChange, 
  contentClassName,
  disableInteractOutside = false,
  scrollAreaId,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{triggerButton}</SheetTrigger>
      <SheetContent
        onInteractOutside={disableInteractOutside ? (e) => e.preventDefault() : undefined}
        className={cn("grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-y-hidden h-full gap-0", contentClassName)}
      >
        <SheetHeader className="row-start-1">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="row-start-2 min-h-0 px-4">
          <Separator />
          <ScrollArea className="h-full" id={scrollAreaId}>
            <div className="p-2">{children}</div>
          </ScrollArea>
          <Separator />
        </div>

        <SheetFooter className="row-start-3">
          {actionButton}
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default SideDrawer;