import { LinkButton } from "../ui/button";
import { TELEGRAM_SUPPORT_INVITE } from "@/constants/externalLinks";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { FC } from "react";
import { TelegramIcon } from "../icons/Social";


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
            Have a question, found a bug, or want to suggest a new feature?
            <br/>
            Join our Telegram support chat to share your feedback.
          </DialogDescription>
        </DialogHeader>
        <LinkButton href={TELEGRAM_SUPPORT_INVITE}>
          <TelegramIcon />
          Join Telegram Support Group
        </LinkButton>
      </DialogContent>
    </Dialog>
  );
};
  
export default SupportDialog;