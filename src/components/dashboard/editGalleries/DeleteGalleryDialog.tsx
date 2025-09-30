"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { P } from "@/components/typography/Typography";
import { useUser } from "@/context/UserProvider";
import axios from "axios";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { GALLERY_ROUTE } from "@/constants/serverRoutes";
import { UserVirtualGalleryType } from "@/types/gallery";
import { EntrySource } from "@/types/entry";
import { getGalleryKey } from "@/utils/gallery";
import { DeleteResult } from "mongoose";

interface DeleteGalleryDialogProps {
  gallery: UserVirtualGalleryType | null;
  onClose: () => void;
}

const DeleteGalleryDialog: FC<DeleteGalleryDialogProps> = ({ 
  gallery, 
  onClose, 
}) => {
  const [deleting, setDeleting] = useState(false);
  const { setUser } = useUser();

  const galleryKey = getGalleryKey(gallery?.source || EntrySource.Creator);

  const handleDelete = () => {
    if (!gallery) return;

    setDeleting(true);

    axios
      .delete<DeleteResult>(`${GALLERY_ROUTE}?id=${gallery._id}`)
      .then((response) => {
        const { acknowledged, deletedCount } = response.data;
        if (acknowledged && deletedCount > 0) {
          toast.info("Gallery deleted successfully.");

          setUser((prevUser) => {
            if (!prevUser) return prevUser;
            const prevGalleries = prevUser[galleryKey] || [];
            return {
              ...prevUser,
              [galleryKey]: prevGalleries.filter(g => g._id.toString() !== gallery._id.toString()),
            };
          });
          
          onClose();
        } else {
          throw new Error(`Gallery not deleted from server. Request acknowledged: ${acknowledged}`);
        }
      })
      .catch((error) => {
        toast.error("Failed to delete gallery.");
        handleClientError({
          error,
          location: "DeleteGalleryDialog_handleDelete",
        });
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !deleting) {
      onClose();
    }
  };

  if (!gallery) return null;

  return (
    <Dialog open={!!gallery} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle >
            Are you sure you want to delete &ldquo;{gallery.title}&rdquo;?
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone and will permanently remove the gallery and all its content.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <P className="text-sm text-muted-foreground">This will delete:</P>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• The gallery &ldquo;{gallery.title}&rdquo;</li>
            <li>• All {gallery.totalItems} items in the gallery</li>
            <li>• All associated metadata and settings</li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            loading={deleting}
          >
            Delete Gallery
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteGalleryDialog;
