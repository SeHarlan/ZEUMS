import { PAGE_PADDING_X } from "@/components/general/PageContainer";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/ui-utils";
import { Maximize2Icon } from "lucide-react";
import { FC } from "react";

interface EditBarProps {
  fixed?: boolean;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export const EditBar: FC<EditBarProps> = ({ fixed, children, isOpen, setIsOpen }) => {
  return (
    <>
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-30 ",
          "transition-all duration-400 ease-in-out",
          "fill-mode-forwards zoom-in-80 fade-in-0 zoom-out-80 fade-out-0",
          !isOpen ? "animate-in bottom-4 lg:bottom-8" : "animate-out -bottom-30"
        )}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="size-12 md:size-10"
        >
          <Maximize2Icon />
        </Button>
      </div>
      <div
        className={cn(
          fixed &&
            "w-full max-w-2xl fixed bottom-0 left-1/2 -translate-x-1/2 z-20 pb-4",
          !fixed && "py-4 mx-auto",
          fixed && PAGE_PADDING_X,
          fixed &&
            cn(
              "transition-all duration-400 ease-in-out",
              "fill-mode-forwards zoom-in-10 fade-in-0 zoom-out-10 fade-out-0",
              isOpen ? "animate-in bottom-0" : "animate-out -bottom-30"
            )
        )}
      >
        <div
          className={cn(
            "shadow-md border p-3 rounded-md",
            "space-y-3",
            fixed ? "bg-muted-blur" : "bg-muted"
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
};
