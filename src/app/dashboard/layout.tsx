import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import EditGalleryItemForm from "@/components/dashboard/editGalleryItems/editItemForm/EditItemForm";
import EditEntryContextProvider from "@/context/EditEntryProvider";
import EditGallerySettingsContextProvider from "@/context/EditGallerySettingsProvider";

// This layout component wraps the dashboard pages with a ProtectedRoute to ensure that only authenticated users can access them.
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <EditEntryContextProvider>
        <EditGallerySettingsContextProvider>
          <div className="w-screen h-full min-h-screen">
            {children}
          </div>
          <EditGalleryItemForm />
        </EditGallerySettingsContextProvider>
      </EditEntryContextProvider>
    </ProtectedRoute>
  );
}
