import { PAGE_PADDING_X } from "@/components/general/PageContainer";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/ui-utils";
import { Maximize2Icon } from "lucide-react";
import { FC } from "react";

interface EditBarProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export const EditBar: FC<EditBarProps> = ({ children, isOpen, setIsOpen }) => {
  return (
    <>
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-30 ",
          "transition-all duration-400 ease-in-out",
          "fill-mode-forwards zoom-in-80 fade-in-0 zoom-out-80 fade-out-0",
          !isOpen
            ? "animate-in bottom-4 lg:bottom-8"
            : "animate-out -bottom-30",
          "no-custom-font",
        )}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="size-10"
        >
          <Maximize2Icon />
        </Button>
      </div>
      <div
        className={cn(
          "w-full max-w-2xl fixed bottom-0 left-1/2 -translate-x-1/2 z-20 pb-4",
          PAGE_PADDING_X,
          "transition-all duration-400 ease-in-out",
          isOpen
            ? "opacity-100 bottom-0 scale-100"
            : "opacity-0 -bottom-30 scale-90",
          "no-custom-font",
        )}
      >
        <div
          className={cn(
            "shadow-md border p-3 rounded-md",
            "space-y-3 bg-muted-blur",
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
};
