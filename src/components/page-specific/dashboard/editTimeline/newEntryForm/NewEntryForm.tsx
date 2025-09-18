"use client";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { entryFormSchema, EntryFormValues } from "@/forms/upsertEntry";
import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { EntrySource, EntryTypes, TimelineEntry, TimelineEntryCreation } from "@/types/entry";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { ENTRY_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { ParsedBlockChainAsset } from "@/types/asset";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import NewEntryFormContent from "./NewEntryFormContent";
import { SquarePlusIcon } from "lucide-react";
import { addPreciseCurrentTime, getTimelineKey, parseEntryDate, sortTimeline } from "@/utils/timeline";
import { addHttpsPrefix } from "@/utils/general";

const formId = "new-entry-form";

interface NewEntryFormProps { 
  source: EntrySource; 
}

const NewEntryForm: FC<NewEntryFormProps> = ({source}) => {
  const { setUser } = useUser()
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [blockchainAsset, setBlockchainAsset] = useState<ParsedBlockChainAsset | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const prevBlockchainAssetRef = useRef<ParsedBlockChainAsset | null>(null);
  const prevEntryTypeRef = useRef<EntryTypes>(EntryTypes.BlockchainAsset);

  const defaultValues: Partial<EntryFormValues> = useMemo(() => ({
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
  const { title, description, entryType: selectedEntryType } = watch();

  const disableSubmit =
    selectedEntryType === EntryTypes.BlockchainAsset && !blockchainAsset;

  const timelineKey = getTimelineKey(source);

  
  useEffect(() => {
    const isBlockchainAsset = selectedEntryType === EntryTypes.BlockchainAsset;
    const isDifferent = blockchainAsset?.tokenAddress !== prevBlockchainAssetRef.current?.tokenAddress;

    if (isBlockchainAsset && isDifferent) {
      // Only run if blockchainAsset changed
      reset({
        ...defaultValues,
        entryType: EntryTypes.BlockchainAsset,
        title: blockchainAsset?.title || "",
        description: blockchainAsset?.description || "",
      });
      prevBlockchainAssetRef.current = blockchainAsset;
    }
  }, [blockchainAsset, reset, title, description, defaultValues, selectedEntryType]);

  useEffect(() => {
    // Only reset if selectedEntryType changed
    if (selectedEntryType !== prevEntryTypeRef.current) {
      setBlockchainAsset(null);
      reset({
        ...defaultValues,
        entryType: selectedEntryType,
      });
      prevEntryTypeRef.current = selectedEntryType;
    }
  }, [selectedEntryType, reset, defaultValues]);

  const fullFormReset = () => {
    setBlockchainAsset(null);
    setAspectRatio(null);
    reset(defaultValues);
    prevBlockchainAssetRef.current = null;
    prevEntryTypeRef.current = EntryTypes.BlockchainAsset;
  }

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
        <Button>
          <P>New Entry</P>
          <SquarePlusIcon />
        </Button>
      }
      open={newEntryOpen}
      onOpenChange={setNewEntryOpen}
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id={formId}
        >
          <NewEntryFormContent
            form={form}
            selectedEntryType={selectedEntryType}
            blockchainAsset={blockchainAsset}
            setBlockchainAsset={setBlockchainAsset}
            setAspectRatio={setAspectRatio}
            source={source}
          />
        </form>
      </Form>
    </SideDrawer>
  );
};

export default NewEntryForm;