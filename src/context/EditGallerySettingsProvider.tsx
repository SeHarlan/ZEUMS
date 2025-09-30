"use client";

import DeleteGalleryDialog from "@/components/dashboard/editGalleries/DeleteGalleryDialog";
import EditGallerySettings from "@/components/dashboard/editGalleries/EditGallerySettings";
import { UserVirtualGalleryType } from "@/types/gallery";
import { createContext, useContext, useState, ReactNode } from "react";

interface EditGallerySettingsContextType {
  editingGallery: UserVirtualGalleryType | null;
  galleryToDelete: UserVirtualGalleryType | null;
  openEditDrawer: (gallery: UserVirtualGalleryType) => void;
  openDeleteDrawer: (gallery: UserVirtualGalleryType) => void;
  closeDeleteDrawer: () => void;
  closeEditDrawer: () => void;
}

const EditGallerySettingsContext = createContext<EditGallerySettingsContextType | undefined>(
  undefined
);

export const useEditGallerySettings = () => {
  const context = useContext(EditGallerySettingsContext);
  if (!context) {
    throw new Error(
      "useEditGallerySettings must be used within EditGallerySettingsContextProvider"
    );
  }
  return context;
};

interface EditGallerySettingsProviderProps {
  children: ReactNode;
}

const EditGallerySettingsContextProvider: React.FC<EditGallerySettingsProviderProps> = ({
  children,
}) => {
  const [editingGallery, setEditingGallery] = useState<UserVirtualGalleryType | null>(null);
  const [galleryToDelete, setGalleryToDelete] = useState<UserVirtualGalleryType | null>(null);

  const openEditDrawer = (gallery: UserVirtualGalleryType) => {
    setEditingGallery(gallery);
  };

  const closeEditDrawer = () => {
    setEditingGallery(null);
  };

  const openDeleteDrawer = (gallery: UserVirtualGalleryType) => {
    setGalleryToDelete(gallery);
  };

  const closeDeleteDrawer = () => {
    setGalleryToDelete(null);
  };



  return (
    <EditGallerySettingsContext.Provider
      value={{
        editingGallery,
        galleryToDelete,
        openEditDrawer,
        closeEditDrawer,
        openDeleteDrawer,
        closeDeleteDrawer,
      }}
    >
      {children}

      <EditGallerySettings
        editingGallery={editingGallery}
        onClose={closeEditDrawer}
      />
      <DeleteGalleryDialog
        gallery={galleryToDelete}
        onClose={closeDeleteDrawer}
      />
    </EditGallerySettingsContext.Provider>
  );
};

export default EditGallerySettingsContextProvider;
