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
            Have a question, found a bug, or want to suggest a new feature?
            </P>
            <P> 
            Join our Telegram support chat for the quickest response or contact us on X.
            </P>
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <a
            href={TELEGRAM_SUPPORT_INVITE}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full">
              <TelegramIcon />
              Join Telegram Support
            </Button>
          </a>
          <a href={X_URL} target="_blank" rel="noopener noreferrer">
            <Button className="w-full" variant="outline">
              <TwitterIcon />
              Find us on X
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
  
export default SupportDialog;