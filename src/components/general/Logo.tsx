import { TITLE_COPY } from "@/textCopy/mainCopy";
import { cn } from "@/utils/ui-utils";
import Image from "next/image";

const Logo = ({ className = "w-24 h-24" }: { className?: string }) => {
  return (
    <Image priority src="/glitchz-small.gif" alt={TITLE_COPY + " Logo"} width={500} height={500} className={cn("flex-shrink-0 object-contain", className)} />
  );
};

export default Logo;