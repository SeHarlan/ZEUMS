import { TITLE_COPY } from "@/textCopy/mainCopy";
import { cn } from "@/utils/ui-utils";
import Image from "next/image";

//cant optimize gif
const Logo = ({ className = "size-24" }: { className?: string }) => {
  return (
    <Image
      priority
      src="https://p1v6uvkvzbjkuo1l.public.blob.vercel-storage.com/glitchz-no-static.gif"
      alt={TITLE_COPY + " Logo"}
      width={256}
      height={256}
      className={cn("flex-0 object-contain dark:invert", className)}
    />
  );
};

export default Logo;