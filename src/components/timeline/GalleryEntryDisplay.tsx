import { GalleryEntry } from "@/types/entry";
import { cn } from "@/utils/ui-utils";
import { FC } from "react";
import { H3 } from "../typography/Typography";
import ExpandableText from "../general/ExpandableText";
import EntryButtons from "./EntryButtons";
import { LinkButton } from "../ui/button";
import { ArrowRightIcon} from "lucide-react";
import { USER_GALLERY } from "@/constants/clientRoutes";
import { usePathname, useRouter } from "next/navigation";
import MiniGalleryBase from "../gallery/MiniGalleryBase";
import { getReturnKey, makeReturnQueryParam } from "@/utils/navigation";
interface GalleryEntryDisplayProps {
  entry: GalleryEntry;
  flip?: boolean;
}

const GalleryEntryDisplay: FC<GalleryEntryDisplayProps> = ({ entry, flip }) => {
  const router = useRouter();
  const pathname = usePathname();

  const returnKey = getReturnKey(pathname);
  const galleryLink = USER_GALLERY(entry.gallery?.ownerData?.username, entry.gallery?.title) + makeReturnQueryParam(returnKey);

  const handleClick = () => {
    router.push(galleryLink);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12 items-center pb-4">
      <div
        className={cn(
          "order-1",
          flip && "md:order-2",
          "rounded-xl cursor-pointer"
        )}
        onClick={handleClick}
      >
        <MiniGalleryBase gallery={entry.gallery} />
      </div>

      <div
        className={cn("order-2 bg-background py-4 px-2", flip && "md:order-1")}
      >
        <div className="relative mb-2 text-center">
          <H3 className="">{entry.title}</H3>
          <ExpandableText
            className="md:mt-2"
            textClassName="text-muted-foreground whitespace-pre-line"
            text={entry.description}
            clamp="line-clamp-6"
          />
          <LinkButton
            href={galleryLink}
            variant="link"
          >
            View Gallery
            <ArrowRightIcon />
          </LinkButton>
        </div>
        <EntryButtons buttons={entry.buttons} />
      </div>
    </div>
  );
};

export default GalleryEntryDisplay;