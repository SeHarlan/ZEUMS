import { cn } from "@/utils/ui-utils";

// src/components/general/PageContainer.tsx
type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "small" | "medium" | "large" | "full";
  noPadding?: boolean;
} & React.HTMLAttributes<HTMLDivElement>

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
        !noPadding && "py-8 px-8",
        className
      )}
    >
      {children}
    </main>
  );
};