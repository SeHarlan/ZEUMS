"use client";

import EditEntryForm from "@/components/page-specific/dashboard/editTimeline/editEntryForm/EditEntryForm";
import { TimelineEntry } from "@/types/entry";
import { createContext, useContext, useState, ReactNode } from "react";

interface EditEntryContextType {
  isOpen: boolean;
  editingEntry: TimelineEntry | null;
  openEditDrawer: (entry: TimelineEntry) => void;
  closeEditDrawer: () => void;
}

const EditEntryContext = createContext<EditEntryContextType | undefined>(
  undefined
);

export const useEditEntry = () => {
  const context = useContext(EditEntryContext);
  if (!context) {
    throw new Error("useEditEntry must be used within EditEntryContextProvider");
  }
  return context;
};

interface EditEntryProviderProps {
  children: ReactNode;
}

const EditEntryContextProvider: React.FC<EditEntryProviderProps> = ({
  children
}) => {
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const isOpen = Boolean(editingEntry);
  
  const openEditDrawer = (entry: TimelineEntry) => {
    setEditingEntry(entry);
  };

  const closeEditDrawer = () => {
    setEditingEntry(null);
  };

  return (
    <EditEntryContext.Provider
      value={{
        isOpen,
        editingEntry,
        openEditDrawer,
        closeEditDrawer,
      }}
    >
      {children}

      <EditEntryForm isOpen={isOpen} editingEntry={editingEntry} onClose={closeEditDrawer}/>
    </EditEntryContext.Provider>
  );
};

export default EditEntryContextProvider;