import { editTimelineSourceAtom } from "@/atoms/dashboard";
import { timelineOnboardingAtoms, TimelineOnboardingKeys, useTimelineSetter } from "@/atoms/onboarding/editTimeline";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserProvider";
import { isEntrySource } from "@/types/entry";
import { getTimelineTabContent } from "@/utils/timeline";
import { cn } from "@/utils/ui-utils";
import { useAtom, useAtomValue } from "jotai/react";
import { Minimize2Icon } from "lucide-react";
import { FC, useState } from "react";
import { EditBar } from "../EditBar";
import EditProfileForm from "./editProfileForm/EditProfileForm";
import NewEntryFormButton from "./newEntryForm/NewEntryForm";
import RearrangeEntriesButton from "./RearrangeEntries";

export const EditTimelineBar:FC = () => {
  const { user } = useUser();
  const [tabValue, setTabValue] = useAtom(editTimelineSourceAtom);
  const [isOpen, setIsOpen] = useState(true);
  const onboardingStage = useAtomValue(timelineOnboardingAtoms.stageAtom);
  const onboardingActive = onboardingStage === "inProgress";

  const { setStepRef: setChooseActiveSourceRef } = useTimelineSetter(
    TimelineOnboardingKeys.ChooseActiveSource
  );

  const {
    setStepRef: setEditProfileRef,
    setStepComplete: setEditProfileComplete,
  } = useTimelineSetter(TimelineOnboardingKeys.EditProfile);

  const { setStepRef: setAddItemsRef, setStepComplete: setAddItemsComplete } =
    useTimelineSetter(TimelineOnboardingKeys.AddItems);
  
    
  const { setStepRef: setRearrangeItemsRef, setStepComplete: setRearrangeItemsComplete } = useTimelineSetter(TimelineOnboardingKeys.RearrangeItems);


  const source = tabValue;
  const content = getTimelineTabContent(user, true);
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
          ref={setChooseActiveSourceRef}
        >
          <TabsList className="w-full grid grid-cols-2 shadow-md h-fit p-0 border-none">
            {content.map((item) => (
              <TabsTrigger
                key={`timeline-tab-${item.value}`}
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
      <div className={cn("grid gap-2 w-full", "grid-cols-3")}>
        <EditProfileForm
          buttonVariant="outline"
          ref={setEditProfileRef}
          onClick={setEditProfileComplete}
          disableInteractOutside={onboardingActive}
        />
        <NewEntryFormButton
          source={source}
          buttonVariant="default"
          ref={setAddItemsRef}
          onClick={setAddItemsComplete}
        />

        <RearrangeEntriesButton
          source={source}
          buttonVariant="outline"
          buttonText="Rearrange"
          ref={setRearrangeItemsRef}
          onClick={setRearrangeItemsComplete}
        />
      </div>
    </EditBar>
  );
};
