import { cn } from "@/utils/ui-utils";
import { FC } from "react";
import { H1, P } from "../typography/Typography";

interface PageTitleProps { 
  text: string;
  className?: string;
}

export const PageTitle: FC<PageTitleProps> = ({ text, className }) => { 
  return (
    <H1 className={className}>
      {text}
    </H1>
  );
}

export const PageSubtitle: FC<PageTitleProps> = ({ text, className }) => { 
  return (
    <P className={cn("font-serif text-muted-foreground", className)}>
      {text}
    </P>
  );
}

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PageHeading: FC<PageHeadingProps> = ({
  title,
  subtitle,
  className
}) => {
  
  return (
    <div className={cn("mb-4 sm:mb-6", className)}>
      <PageTitle text={title}/>
      {subtitle ? (
        <PageSubtitle text={subtitle} className="mt-1" />
      ) : null}
    </div>
  )
}

export default PageHeading;