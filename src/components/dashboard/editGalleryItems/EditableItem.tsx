"use client";

import { editGalleryItemAtom } from "@/atoms/dashboard";
import GalleryItemBase, { GalleryItemBaseProps } from "@/components/gallery/GalleryItemBase";
import { Button } from "@/components/ui/button";
import { GALLERY_ITEM_ROUTE } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import useGalleryById from "@/hooks/useGalleryById";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { useAtom } from "jotai";
import { EditIcon, Trash2Icon } from "lucide-react";
import { DeleteResult } from "mongoose";
import { FC, useState } from "react";
import { toast } from "sonner";
;

const EditableItem: FC<GalleryItemBaseProps> = ({ item, hideTitle, hideDescription, sizeDivisor }) => {
  const [editingItem, setEditingItem] = useAtom(editGalleryItemAtom);
  const isOpen = Boolean(editingItem);
  const { mutateGallery } = useGalleryById(item.parentGalleryId.toString());
  const { revalidateUser } = useUser();

  const [deleting, setDeleting] = useState(false);

  const disableButtons = deleting || isOpen;

  const handleEdit = () => {
    setEditingItem(item);
  };

  const handleDelete = async () => {
    setDeleting(true);

    axios
      .delete<DeleteResult>(`${GALLERY_ITEM_ROUTE}?id=${item._id}`)
      .then((response) => {
        const { acknowledged, deletedCount } = response.data;
        if (acknowledged && deletedCount > 0) {
          toast("Item deleted successfully.");

          mutateGallery((prev) => {
            if (!prev) return prev;
            const updatedItems = prev.items?.filter(
              (prevItem) => prevItem._id !== item._id
            );
            return {
              ...prev,
              items: updatedItems,
            };
          }, false);

          // Revalidate user if the first two rows changed
          // Will effect user gallery cards and gallery entries
          if (item.position[0] < 2) {
            revalidateUser();
          }
        } else {
          throw new Error(
            `Item not deleted from server. Request acknowledged: ${acknowledged}`
          );
        }
      })
      .catch((error) => {
        toast.error("Failed to delete item.");
        handleClientError({
          error,
          location: "EditableItem_handleDelete",
        });
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  return (
    <div className="relative group/item-preview">
      <div className="z-10 absolute -top-5 -right-5 flex gap-2 group-hover/item-preview:opacity-100 opacity-100 sm:opacity-25 transition-opacity duration-200">
        <Button
          onClick={handleDelete}
          variant="destructive"
          disabled={disableButtons}
          loading={deleting}
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
      <GalleryItemBase item={item} hideTitle={hideTitle} hideDescription={hideDescription} sizeDivisor={sizeDivisor} />
    </div>
  );
};

export default EditableItem;
