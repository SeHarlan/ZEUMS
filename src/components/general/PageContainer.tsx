import { cn } from "@/utils/ui-utils";

// src/components/general/PageContainer.tsx
type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "small" | "medium" | "large" | "full";
  noPadding?: boolean;
} & React.HTMLAttributes<HTMLDivElement>

export const PAGE_PADDING_X = "px-4 md:px-8";
export const PAGE_PADDING_Y = "py-16 md:py-8";
export const PAGE_PADDING = `${PAGE_PADDING_Y} ${PAGE_PADDING_X}`;

export const PageContainer = ({ 
  children, 
  className = "",
  noPadding = false,
  maxWidth = "medium",
  ...props
}: PageContainerProps) => { 

  const widthClasses = {
    small: "max-w-3xl", 
    medium: "max-w-5xl", 
    large: "max-w-7xl", 
    full: "max-w-full",
  };
  
  return (
    <main
      {...props}
      className={cn(
        "w-full mx-auto",
        widthClasses[maxWidth],
        !noPadding && PAGE_PADDING,
        className
      )}
    >
      {children}
    </main>
  );
};