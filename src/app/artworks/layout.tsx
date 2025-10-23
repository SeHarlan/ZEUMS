import { PageContainer } from "@/components/general/PageContainer";
import { ReactNode } from "react";

// This layout component wraps the dashboard pages with a ProtectedRoute to ensure that only authenticated users can access them.
export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PageContainer maxWidth="full" noPadding>
      {children}
    </PageContainer>
  );
}
