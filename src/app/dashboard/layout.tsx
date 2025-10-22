import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import EditEntryContextProvider from "@/context/EditEntryProvider";
import EditGalleryItemContextProvider from "@/context/EditGalleryItemProvider";
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
          <EditGalleryItemContextProvider>
            <div className="bg-muted w-screen h-full min-h-screen">
              {children}

            </div>
          </EditGalleryItemContextProvider>
        </EditGallerySettingsContextProvider>
      </EditEntryContextProvider>
    </ProtectedRoute>
  );
}
