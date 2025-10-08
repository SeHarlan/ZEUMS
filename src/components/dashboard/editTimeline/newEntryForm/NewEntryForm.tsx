"use client";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { entryFormSchema, EntryFormValues } from "@/forms/upsertEntry";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EntrySource, EntryTypes, TimelineEntry, TimelineEntryCreation } from "@/types/entry";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { ENTRY_ROUTE, ENTRY_DATES_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { DateMap, ParsedBlockChainAsset } from "@/types/asset";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import NewEntryFormContent from "./NewEntryFormContent";
import { SquarePlusIcon } from "lucide-react";
import { addPreciseCurrentTime, getTimelineKey, parseEntryDate, sortTimeline } from "@/utils/timeline";
import { addHttpsPrefix } from "@/utils/general";
import { cn } from "@/utils/ui-utils";
import { UserVirtualGalleryType } from "@/types/gallery";
import { getFirstBlockchainItem } from "@/utils/gallery";

const formId = "new-entry-form";

interface NewEntryFormProps { 
  source: EntrySource; 
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  buttonText?: string;
}

const NewEntryForm: FC<NewEntryFormProps> = ({source, buttonClassName, buttonVariant = "default", buttonText = "Add New Entry"}) => {
  const { setUser } = useUser()
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingMintDate, setFetchingMintDate] = useState(false);
  const [blockchainAsset, setBlockchainAsset] = useState<ParsedBlockChainAsset | null>(null);
  const [gallery, setGallery] = useState<UserVirtualGalleryType | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const prevEntryTypeRef = useRef<EntryTypes>(EntryTypes.BlockchainAsset);

  const defaultValues: EntryFormValues = useMemo(() => ({
    entryType: EntryTypes.BlockchainAsset,
    title: "",
    description: "",
    date: new Date(),
    buttons: [],
  }), [])

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues,
  });

  const { reset, watch } = form;

  const { entryType: selectedEntryType } = watch();

  const disableSubmit =
    (selectedEntryType === EntryTypes.BlockchainAsset && !blockchainAsset) ||
    (selectedEntryType === EntryTypes.Gallery && !gallery);

  const timelineKey = getTimelineKey(source);

  
  const handleGetMintDates = useCallback(async (tokenAddress?: string) => {
    if (!tokenAddress) return new Date();

    setFetchingMintDate(true);
    return axios
      .post<{ addressDatesMap: DateMap }>(ENTRY_DATES_ROUTE, {
        mintAddresses: [tokenAddress],
      })
      .then((response) => {
        const { addressDatesMap } = response.data;
        const mintDate = addressDatesMap[tokenAddress];

        if (!mintDate) {
          throw new Error("No date returned");
        }

        toast.success("Mint date successfully retrieved!");
        return new Date(mintDate);
      })
      .catch((error) => {
        toast.error("Failed to get the mint date.", {
          description: "Please try again",
        });
        handleClientError({
          error,
          location: "NewEntryForm_handleGetMintDates",
        });
        return new Date();
      })
      .finally(() => {
        setFetchingMintDate(false);
      });
  }, []);

  useEffect(() => {
    //initialize item details if they exist
    if (selectedEntryType === EntryTypes.BlockchainAsset) {
      handleGetMintDates(blockchainAsset?.tokenAddress).then((mintDate) => {
        reset((values) =>({
          ...values,
          entryType: EntryTypes.BlockchainAsset,
          title: blockchainAsset?.title || "",
          description: blockchainAsset?.description || "",
          date: mintDate,
        }));
      });
    }
  }, [blockchainAsset, handleGetMintDates, reset, selectedEntryType]);

  useEffect(() => {
    if (selectedEntryType === EntryTypes.Gallery) {
      const firstItem = getFirstBlockchainItem(gallery?.items);
      handleGetMintDates(firstItem?.tokenAddress).then((mintDate) => {
        reset((values) => ({
          ...values,
          entryType: EntryTypes.Gallery,
          title: gallery?.title || "",
          description: gallery?.description || "",
          date: mintDate,
        }));
      });
    }
  }, [selectedEntryType, reset, gallery, handleGetMintDates]);

  useEffect(() => {
    // Only reset if selectedEntryType changed
    if (selectedEntryType !== prevEntryTypeRef.current) {
      setBlockchainAsset(null);
      reset((values) => ({
        ...values,
        entryType: selectedEntryType,
      }));
      prevEntryTypeRef.current = selectedEntryType;
    }
  }, [selectedEntryType, reset]);

  const fullFormReset = () => {
    setBlockchainAsset(null);
    setGallery(null);
    setAspectRatio(null);
    reset();
    prevEntryTypeRef.current = EntryTypes.BlockchainAsset;
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!submitting) {
      setFormOpen(newOpen);
      if (!newOpen) {
        fullFormReset();
      }
    }
  };

  const onSubmit = (data: EntryFormValues) => {
    setSubmitting(true);

    data.date = addPreciseCurrentTime(data.date);
    
    // Add https:// prefix to button URLs if they don't have a protocol
    if (data.buttons) {
      data.buttons = data.buttons.map(button => ({
        ...button,
        url: addHttpsPrefix(button.url)
      }));
    }


    let entryCreationData: TimelineEntryCreation = {
      ...data,
      source,
    };

    if (data.entryType === EntryTypes.BlockchainAsset) {
      if (!blockchainAsset || !aspectRatio) {
        toast.error("Please select a valid blockchain asset.");
        setSubmitting(false);
        return;
      }
      
      //TODO: refactor this to use the aspect Ratio provider
      const assetWithAspectRatio: ParsedBlockChainAsset = {
        ...blockchainAsset,
        media: {
          ...blockchainAsset.media,
          aspectRatio,
        },
      };

      entryCreationData = {
        ...assetWithAspectRatio,
        ...entryCreationData,
      };
    }

    if (data.entryType === EntryTypes.Gallery && gallery) {
      entryCreationData = {
        ...entryCreationData,
        galleryId: gallery._id.toString(),
      };
    }

    axios
      .post<{ createdEntry: TimelineEntry }>(ENTRY_ROUTE, entryCreationData)
      .then((response) => {
        const { createdEntry } = response.data;
        const parsedCreatedEntry = parseEntryDate(createdEntry);

        toast.success("New entry created!");

        //Update the users timeline context with the new entry
        setUser((prevUser) => {
          if (!prevUser) return prevUser;

          const prevTimeline = prevUser[timelineKey] || [];
          
          const newTimeline = sortTimeline([
            parsedCreatedEntry,
            ...prevTimeline,
          ]);

          return {
            ...prevUser,
            [timelineKey]: newTimeline,
          };
        });

        setFormOpen(false);
        fullFormReset();
      })
      .catch((error) => {
        toast.error("Failed to create new entry.");
        handleClientError({
          error,
          location: "NewEntryForm_onSubmit",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <SideDrawer
      triggerButton={
        <Button
          className={cn("w-full", buttonClassName)}
          variant={buttonVariant}
        >
          <P>{buttonText}</P>
          <SquarePlusIcon />
        </Button>
      }
      open={formOpen}
      onOpenChange={handleOpenChange}
      title="Add New Entry"
      description="Add a new entry to your artist timeline."
      actionButton={
        <Button
          form={formId}
          type="submit"
          className="w-full"
          loading={submitting}
          disabled={disableSubmit}
        >
          <P>Save New Entry</P>
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id={formId}>
          <NewEntryFormContent
            fetchingMintDate={fetchingMintDate}
            handleGetMintDates={handleGetMintDates}
            form={form}
            selectedEntryType={selectedEntryType}
            blockchainAsset={blockchainAsset}
            setBlockchainAsset={setBlockchainAsset}
            gallery={gallery}
            setGallery={setGallery}
            setAspectRatio={setAspectRatio}
            source={source}
          />
        </form>
      </Form>
    </SideDrawer>
  );
};

export default NewEntryForm;