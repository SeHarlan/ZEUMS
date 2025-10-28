import { editTimelineSourceAtom } from "@/atoms/dashboard";
import { GalleriesOnboardingKeys, useGalleriesSetter } from "@/atoms/onboarding/editGalleries";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserProvider";
import { isEntrySource } from "@/types/entry";
import { getTimelineTabContent } from "@/utils/timeline";
import { useAtom } from "jotai/react";
import { Minimize2Icon } from "lucide-react";
import { FC, useState } from "react";
import { EditBar } from "../EditBar";
import CreateGalleryDialogButton from "./CreateGalleryDialog";

export const EditGalleriesBar: FC = () => { 
  const { user } = useUser();
  const [tabValue, setTabValue] = useAtom(editTimelineSourceAtom);
  const [isOpen, setIsOpen] = useState(true);
  const source = tabValue;

  const content = getTimelineTabContent(user, true);

  const { setStepRef: setChooseSourceRef } = useGalleriesSetter(GalleriesOnboardingKeys.ChooseSource);
  const { setStepRef: setCreateGalleryRef, setStepComplete: setCreateGalleryActive } = useGalleriesSetter(GalleriesOnboardingKeys.CreateGallery);
  const handleValueChange = (value: string) => {
    if (isEntrySource(value)) {
      setTabValue(value);
    }
  };
  return (
    <EditBar isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_4fr_1fr] w-full gap-2">
        <div className="size-px hidden md:block" />
        <Tabs
          defaultValue={content[0].value}
          value={tabValue}
          onValueChange={handleValueChange}
          className="mx-auto w-full"
          ref={setChooseSourceRef}
        >
          <TabsList className="w-full grid grid-cols-2 shadow-md h-fit p-0 border-none">
            {content.map((item, index) => (
              <TabsTrigger
                key={`gallery-tab-${item.value}-${index}`}
                value={item.value}
                primaryActive
              >
                <P className="font-serif w-full h-full">{item.title}</P>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="justify-self-end p-0 h-auto"
        >
          <Minimize2Icon />
        </Button>
      </div>
      <CreateGalleryDialogButton source={source} ref={setCreateGalleryRef} onClick={setCreateGalleryActive}  />
    </EditBar>
  );
}