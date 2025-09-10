import GlitchFeedback from "@/components/general/GlitchFeedback";
// import Logo from "@/components/general/Logo";
import { PageContainer } from "@/components/general/PageContainer";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer className="min-h-screen flex items-center justify-center bg-secondary" maxWidth="full">
      <Suspense fallback={<GlitchFeedback title={TITLE_COPY} subtitle={"Loading..."} />}>
        {children}
      </Suspense>
    </PageContainer>
  );
}