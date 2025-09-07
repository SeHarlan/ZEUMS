import Logo from "@/components/general/Logo";
import { PageContainer } from "@/components/general/PageContainer";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer className="min-h-screen flex items-center justify-center bg-secondary" maxWidth="full">
      <Suspense fallback={<Logo className="size-16" />}>
        {children}
      </Suspense>
    </PageContainer>
  );
}