import { MailIcon } from "lucide-react";
import { cn } from "@/utils/ui-utils";

export const GoogleIcon = ({className}: {className?: string}) => {
  return <span className={cn("font-serif font-bold text-lg", className)}>G</span>;
};

export const EmailIcon = MailIcon;
