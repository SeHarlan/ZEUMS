import Logo from "@/components/general/Logo";
import { PageContainer } from "@/components/general/PageContainer";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageContainer>
    <Suspense fallback={<Logo className="absolute-center"/>}>{children}</Suspense>;
  </PageContainer>
}