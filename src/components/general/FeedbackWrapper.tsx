import { FC, ReactNode } from "react";
import PageLoading from "./PageLoading";
import GlitchFeedback from "./GlitchFeedback";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import LoadingSpinner from "./LoadingSpinner";

interface FeedbackWrapperProps {
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  title?: string;
  errorSubtitle?: string;
  noDataSubtitle?: string;
  children: ReactNode;
  useSpinner?: boolean;
}

const FeedbackWrapper: FC<FeedbackWrapperProps> = ({
  isLoading,
  isError,
  hasData,
  title = TITLE_COPY,
  errorSubtitle = "Something went wrong",
  noDataSubtitle = "Nothing was found",
  children,
  useSpinner = false,
}) => {
  if (isLoading) {
    return useSpinner
      ? <LoadingSpinner className="fixed-center" iconClass="size-14"/>
      : <PageLoading complete={hasData} loading={isLoading} />;
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
