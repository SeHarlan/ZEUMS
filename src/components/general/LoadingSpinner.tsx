import { cn } from "@/utils/ui-utils";
import { LoaderCircleIcon } from "lucide-react";
import { FC } from "react";

interface LoadingSpinnerProps { 
  iconClass?: string; 
  className?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  iconClass,
  className,
}) => (
  <div className={cn("rounded-full bg-background/50", className)}>
    <LoaderCircleIcon className={cn("animate-spin", iconClass)} />
  </div>
);


export default LoadingSpinner;