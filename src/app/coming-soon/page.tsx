"use client";
import { useShowReturnButton } from "@/atoms/navigation";
import GlitchFeedback from "@/components/general/GlitchFeedback";
import { PageContainer } from "@/components/general/PageContainer";
import BasicNavDialog from "@/components/navigation/BasicNavDialog";
import { TITLE_COPY } from "@/textCopy/mainCopy";

const ComingSoonPage = () => {  
  useShowReturnButton();
  return (
    <PageContainer maxWidth="full" noPadding>
      <GlitchFeedback title={TITLE_COPY} subtitle={"Coming soon..."} />
      <BasicNavDialog />
    </PageContainer>
  );
};

export default ComingSoonPage;