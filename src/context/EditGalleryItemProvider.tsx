"use client";


import EditGalleryItemForm from "@/components/dashboard/editGalleryItems/editItemForm/EditItemForm";
import { GalleryItem } from "@/types/galleryItem";
import { createContext, useContext, useState, ReactNode } from "react";

interface EditGalleryItemContextType {
  isOpen: boolean;
  editingItem: GalleryItem | null;
  openEditDrawer: (item: GalleryItem) => void;
  closeEditDrawer: () => void;
}

const EditGalleryItemContext = createContext<EditGalleryItemContextType | undefined>(
  undefined
);

export const useEditGalleryItem = () => {
  const context = useContext(EditGalleryItemContext);
  if (!context) {
    throw new Error(
      "useEditGalleryItem must be used within EditGalleryItemContextProvider"
    );
  }
  return context;
};

interface EditGalleryItemProviderProps {
  children: ReactNode;
}

const EditGalleryItemContextProvider: React.FC<EditGalleryItemProviderProps> = ({
  children,
}) => {
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const isOpen = Boolean(editingItem);

  const openEditDrawer = (entry: GalleryItem) => {
    setEditingItem(entry);
  };

  const closeEditDrawer = () => {
    setEditingItem(null);
  };

  return (
    <EditGalleryItemContext.Provider
      value={{
        isOpen,
        editingItem,
        openEditDrawer,
        closeEditDrawer,
      }}
    >
      {children}

      <EditGalleryItemForm
        isOpen={isOpen}
        editingItem={editingItem}
        onClose={closeEditDrawer}
      />
    </EditGalleryItemContext.Provider>
  );
};

export default EditGalleryItemContextProvider;
