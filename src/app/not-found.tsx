"use client";

import BasicNavDialog from "@/components/navigation/BasicNavDialog";
import { PageContainer } from "@/components/general/PageContainer";
import GlitchFeedback from "@/components/general/GlitchFeedback";
import { TITLE_COPY } from "@/textCopy/mainCopy";

export default function NotFound() {
  return (
    <PageContainer maxWidth="full" noPadding>
      <GlitchFeedback  title={TITLE_COPY} subtitle={"Page not found"} />
      <BasicNavDialog />
    </PageContainer>
  );
}
