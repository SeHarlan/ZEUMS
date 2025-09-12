"use client";
import { FC, useEffect, useMemo, useState } from "react";
import { entryFormSchema, EntryFormValues } from "@/forms/upsertEntry";
import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { BaseEntry, EntrySource, EntryTypes, TimelineEntry } from "@/types/entry";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { ENTRY_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import SideDrawer from "@/components/general/SideDrawer";
import { P } from "@/components/typography/Typography";
import { addPreciseCurrentTime, getTimelineKey, parseEntryDate, sortTimeline } from "@/utils/timeline";
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

  const selectedEntryType = editingEntry?.entryType || EntryTypes.BlockchainAsset;
  const source = editingEntry?.source || EntrySource.Creator;
  const timelineKey = getTimelineKey(source);

  const defaultValues: Partial<EntryFormValues> = useMemo(() => ({
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

  const { reset } = form;

  useEffect(() => {
    //isOpen means there is an entry to edit
    if (isOpen) { 
      reset(defaultValues)
    }else {
      reset(); // Clear form when drawer closes
    }
  }, [reset, defaultValues, isOpen]);

  const onSubmit = (data: EntryFormValues) => {
    if (!editingEntry) return;

    setSubmitting(true);

    if (data.date.toISOString() !== editingEntry.date.toISOString()) {
      //new date was set
      data.date = addPreciseCurrentTime(data.date);
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

        toast.success("Entry updated!");

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
        toast.error("Failed to update entry.");
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
      title="Update Entry"
      description="Edit an existing entry."
      actionButton={
        <Button
          onClick={() => form.handleSubmit(onSubmit)()} // Direct form submission
          className="w-full"
          loading={submitting}
        >
          <P>Update Entry</P>
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id={formId}>
          <EditEntryFormContent
            form={form}
            selectedEntryType={selectedEntryType}
          />
        </form>
      </Form>
    </SideDrawer>
  );
};

export default EditEntryForm;