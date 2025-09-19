import { FC, ReactNode } from "react";
import PageLoading from "./PageLoading";
import GlitchFeedback from "./GlitchFeedback";
import { TITLE_COPY } from "@/textCopy/mainCopy";

interface FeedbackWrapperProps {
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  title?: string;
  errorSubtitle?: string;
  noDataSubtitle?: string;
  children: ReactNode;
}

const FeedbackWrapper: FC<FeedbackWrapperProps> = ({
  isLoading,
  isError,
  hasData,
  title = TITLE_COPY,
  errorSubtitle = "Something went wrong",
  noDataSubtitle = "Nothing was found",
  children,
}) => {
  if (isLoading) {
    return <PageLoading complete={hasData} loading={isLoading} />;
  }

  //done loading but there's an error or no data
  if (isError || !hasData) {
    let subtitle = "";
    if (isError) subtitle = errorSubtitle;
    if (!hasData) subtitle = noDataSubtitle;

    return <GlitchFeedback title={title} subtitle={subtitle} />;
  }

  //done loading and there's data
  return <>{children}</>;
};

export default FeedbackWrapper;
