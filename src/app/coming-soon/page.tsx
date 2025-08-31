"use client";
import BasicNavDialog from "@/components/general/BasicNavDialog";
import { PageContainer } from "@/components/general/PageContainer";
import GlitchFeedback from "@/components/pages/landing/GlitchFeedback";
import { TITLE_COPY } from "@/textCopy/mainCopy";

const ComingSoonPage = () => {  
  return (
    <PageContainer maxWidth="full" noPadding>
      <GlitchFeedback title={TITLE_COPY} subtitle={"Coming soon..."} />
      <BasicNavDialog />
    </PageContainer>
  );
};

export default ComingSoonPage;