import { Button } from "@/components/ui/button";
import useGalleryById from "@/hooks/useGalleryById";
import { Minimize2Icon } from "lucide-react";
import { FC, useState } from "react";
import { EditBar } from "../EditBar";
import { EditGallerySettingsButton } from "./EditGallerySettingsButton";
import NewItemFormButton from "./newItemForm/NewItemForm";
import RearrangeItemsButton from "./rearrangeItems/RearrangeItems";


interface EditGalleryBarProps {
  galleryId: string;
}

export const EditGalleryBar: FC<EditGalleryBarProps> = ({  galleryId }) => { 
  const { gallery} = useGalleryById(galleryId);
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <EditBar isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_4fr_1fr] w-full gap-2">
        <div className="size-px hidden md:block" />
        <NewItemFormButton galleryId={galleryId} />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="justify-self-end p-0 h-auto"
        >
          <Minimize2Icon />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <EditGallerySettingsButton gallery={gallery} />
        <RearrangeItemsButton galleryId={galleryId} />
      </div>
    </EditBar>
  );
}