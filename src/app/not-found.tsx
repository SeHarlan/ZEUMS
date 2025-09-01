"use client";

import BasicNavDialog from "@/components/general/BasicNavDialog";
import { PageContainer } from "@/components/general/PageContainer";
import GlitchFeedback from "@/components/pages/landing/GlitchFeedback";
import { TITLE_COPY } from "@/textCopy/mainCopy";

export default function NotFound() {
  return (
    <PageContainer maxWidth="full" noPadding>
      <GlitchFeedback  title={TITLE_COPY} subtitle={"Page not found"} />
      <BasicNavDialog />
    </PageContainer>
  );
}
