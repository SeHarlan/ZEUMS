import { TELEGRAM_SUPPORT_INVITE, X_URL } from "@/constants/externalLinks";
import { FC } from "react";
import { TelegramIcon, TwitterIcon } from "../icons/Social";
import { P } from "../typography/Typography";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";


interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const SupportDialog: FC<SupportDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Support</DialogTitle>
          <DialogDescription>
            <P className="my-2">
              Have a question, found a bug, or just wanna say hello?
            </P>
            <P> 
              Reach out to us on X or join our Telegram channel for the quickest response.
            </P>
          </DialogDescription>
        </DialogHeader>
        <SupportLinks />
      </DialogContent>
    </Dialog>
  );
};
  
export default SupportDialog;

export const SupportLinks: FC<{buttonVariantOverride?: "outline" | "link"}> = ({buttonVariantOverride }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
      <a href={X_URL} target="_blank" rel="noopener noreferrer">
        <Button className="w-full" variant={buttonVariantOverride || "outline"}>
          <TwitterIcon />
          Find us on X
        </Button>
      </a>
      <a
        href={TELEGRAM_SUPPORT_INVITE}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button className="w-full" variant={buttonVariantOverride || "default"}>
          <TelegramIcon />
          Join Telegram Support
        </Button>
      </a>
    </div>
  );
};