import { TITLE_COPY } from "@/textCopy/mainCopy";
import { cn } from "@/utils/ui-utils";
import Image from "next/image";

//cant optimize gif
const Logo = ({ className = "size-24" }: { className?: string }) => {
  return (
    <Image priority unoptimized src="/glitchz-small.gif" alt={TITLE_COPY + " Logo"} width={256} height={256} className={cn("flex-shrink-0 object-contain", className)} />
  );
};

export default Logo;