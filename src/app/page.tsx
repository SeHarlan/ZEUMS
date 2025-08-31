"use client"
import GlitchFeedback from "@/components/pages/landing/GlitchFeedback";
import { PageContainer } from "@/components/general/PageContainer";
import { SUBTITLE_COPY, TITLE_COPY } from "@/textCopy/mainCopy";
import BasicNavDialog from "@/components/general/BasicNavDialog";

export default function Home() {

  return (
    <PageContainer maxWidth="full" noPadding>
      <GlitchFeedback title={TITLE_COPY} subtitle={SUBTITLE_COPY} />
      <BasicNavDialog />
    </PageContainer>
  );
}