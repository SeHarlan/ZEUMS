"use client";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ENTRY_DATES_ROUTE, ENTRY_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { entryFormSchema, EntryFormValues } from "@/forms/upsertEntry";
import { TIMELINE_ENTRY_LABEL } from "@/textCopy/mainCopy";
import { DateMap } from "@/types/asset";
import { BaseEntry, EntrySource, EntryTypes, isBlockchainAssetEntry, isGalleryEntry, TimelineEntry } from "@/types/entry";
import { getFirstBlockchainItem } from "@/utils/gallery";
import { addHttpsPrefix } from "@/utils/general";
import { handleClientError } from "@/utils/handleError";
import { addPreciseCurrentTime, getTimelineKey, parseEntryDate, sortTimeline } from "@/utils/timeline";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import EditEntryFormContent from "./EditEntryFormContent";

const formId = "edit-entry-form";

interface EditEntryFormProps { 
  isOpen: boolean;
  editingEntry: TimelineEntry | null;
  onClose: () => void;
}

const EditEntryForm: FC<EditEntryFormProps> = ({ isOpen, editingEntry, onClose }) => {
  const { setUser } = useUser()
  const [submitting, setSubmitting] = useState(false);
  const [fetchingMintDate, setFetchingMintDate] = useState(false);

  const selectedEntryType = editingEntry?.entryType || EntryTypes.BlockchainAsset;
  const source = editingEntry?.source || EntrySource.Creator;
  const timelineKey = getTimelineKey(source);

  const galleryId = isGalleryEntry(editingEntry) ? editingEntry.galleryId.toString() : undefined;
  
  const defaultValues: EntryFormValues = useMemo(() => ({
    entryType: selectedEntryType,
    title: editingEntry?.title || "",
    description: editingEntry?.description || "",
    buttons: editingEntry?.buttons || [],
    date: editingEntry?.date || new Date(),
  }), [editingEntry, selectedEntryType])

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues,
  });

  const { reset, setValue } = form;

  useEffect(() => {
    if (isOpen) { 
      //reset with new default values
      reset(defaultValues)
    }
  }, [reset, isOpen, defaultValues]);

  const handleGetMintDates = useCallback(async () => {
    if (!editingEntry) return 

    const tokenAddress =
      isBlockchainAssetEntry(editingEntry)
        ? editingEntry.tokenAddress
        : isGalleryEntry(editingEntry)
          ? getFirstBlockchainItem(editingEntry.gallery?.items)?.tokenAddress
          : undefined;
    
    if (!tokenAddress) return;

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
        setValue("date", new Date(mintDate));
      })
      .catch((error) => {
        toast.error("Failed to get the mint date.", {
          description: "Please try again",
        });
        handleClientError({
          error,
          location: "EditEntryForm_handleGetMintDates",
        });
      })
      .finally(() => {
        setFetchingMintDate(false);
      });
    }, [setValue, editingEntry]);

  const onSubmit = (data: EntryFormValues) => {
    if (!editingEntry) return;

    setSubmitting(true);

    if (data.date.toISOString() !== editingEntry.date.toISOString()) {
      //new date was set
      data.date = addPreciseCurrentTime(data.date);
    }
    
    // Add https:// prefix to button URLs if they don't have a protocol
    if (data.buttons) {
      data.buttons = data.buttons.map(button => ({
        ...button,
        url: addHttpsPrefix(button.url)
      }));
    }

    const updatedEntryData: Partial<BaseEntry> = {
      _id: editingEntry._id,
      ...data,
    };
    axios
      .patch<{ updatedEntry: TimelineEntry }>(ENTRY_ROUTE, updatedEntryData)
      .then((response) => {
        const { updatedEntry } = response.data;
        const parsedUpdatedEntry = parseEntryDate(updatedEntry)

        toast.success(`${TIMELINE_ENTRY_LABEL.capFullSingular} updated successfully!`);

        //Update the users timeline context with the edited entry
        setUser((prevUser) => {
          if (!prevUser) return prevUser;

          const prevTimeline = prevUser[timelineKey] || [];
          
          const newTimeline = sortTimeline(
            prevTimeline.map((entry) =>
              entry._id === parsedUpdatedEntry._id ? parsedUpdatedEntry : entry
            )
          );

          return {
            ...prevUser,
            [timelineKey]: newTimeline,
          };
        });

        onClose();
      })
      .catch((error) => {
        toast.error(`Failed to update ${TIMELINE_ENTRY_LABEL.fullSingular}.`);
        handleClientError({
          error,
          location: "EditEntryForm_onSubmit",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleOpenChange = (open: boolean) => { 
    if (!open) onClose()
  }

  return (
    <SideDrawer
      triggerButton={null}
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={`Update ${TIMELINE_ENTRY_LABEL.capFullSingular}`}
      description="Edit existing content."
      actionButton={
        <Button
          onClick={() => form.handleSubmit(onSubmit)()} // Direct form submission
          className="w-full"
          loading={submitting}
        >
          <P>Update {TIMELINE_ENTRY_LABEL.capFullSingular}</P>
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id={formId} >
          <EditEntryFormContent
            galleryId={galleryId}
            form={form}
            selectedEntryType={selectedEntryType}
            handleOpenChange={handleOpenChange}
            handleGetMintDates={handleGetMintDates}
            fetchingMintDate={fetchingMintDate}
          />
        </form>
      </Form>
    </SideDrawer>
  );
};

export default EditEntryForm;