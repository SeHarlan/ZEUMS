"use client";

import EntryBase, { EntryBaseProps } from "@/components/timeline/EntryBase";
import { Button } from "@/components/ui/button";
import { ENTRY_ROUTE } from "@/constants/serverRoutes";
import { useEditEntry } from "@/context/EditEntryProvider";
import { useUser } from "@/context/UserProvider";
import { TIMELINE_ENTRY_LABEL } from "@/textCopy/mainCopy";
import { handleClientError } from "@/utils/handleError";
import { getTimelineKey } from "@/utils/timeline";
import axios from "axios";
import { EditIcon, Trash2Icon } from "lucide-react";
import { DeleteResult } from "mongoose";
import { FC, useState } from "react";
import { toast } from "sonner";


const EditableEntry: FC<EntryBaseProps> = ({ entry, flip }) => {
  const { setUser } = useUser();
  const { openEditDrawer, isOpen } = useEditEntry();

  const [deleting, setDeleting] = useState(false);

  const disableButtons = deleting || isOpen;

  const handleEdit = () => {
    openEditDrawer(entry);
  };

  const handleDelete = async () => {
    setDeleting(true);

    axios
      .delete<DeleteResult>(`${ENTRY_ROUTE}?id=${entry._id}`)
      .then((response) => {
        const { acknowledged, deletedCount } = response.data;
        if (acknowledged && deletedCount > 0) {
          toast(`${TIMELINE_ENTRY_LABEL.capFullSingular} deleted successfully.`);

          setUser((prevUser) => {
            if (!prevUser) return prevUser;

            const timelineKey = getTimelineKey(entry.source);
            const prevTimeline = prevUser[timelineKey] || [];
            const newTimeline = prevTimeline.filter((e) => e._id !== entry._id);

            return {
              ...prevUser,
              [timelineKey]: newTimeline,
            };
          });
        } else {
          throw new Error(
            `Entry not deleted from server. Request acknowledged: ${acknowledged}`
          );
        }
      })
      .catch((error) => {
        toast.error(`Failed to delete ${TIMELINE_ENTRY_LABEL.capFullSingular}.`);
        handleClientError({
          error,
          location: "EditableEntry_handleDelete",
        });
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  return (
    <div className="relative group/entry-preview">
      <div className="z-10 absolute -top-5 right-6 sm:-right-5 flex gap-2 group-hover/entry-preview:opacity-100 opacity-100 sm:opacity-25 transition-opacity duration-200">
        <Button
          onClick={handleDelete}
          variant="destructive"
          loading={deleting}
          disabled={disableButtons}
          size="icon"
        >
          <Trash2Icon />
        </Button>
        <Button
          onClick={handleEdit}
          variant="default"
          disabled={disableButtons}
          size="icon"
        >
          <EditIcon />
        </Button>
      </div>
      <EntryBase entry={entry} flip={flip} />
    </div>
  );
};

export default EditableEntry;