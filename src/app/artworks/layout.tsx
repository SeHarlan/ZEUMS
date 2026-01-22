import { PageContainer } from "@/components/general/PageContainer";
import { ReactNode } from "react";


export default function Layout({
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
