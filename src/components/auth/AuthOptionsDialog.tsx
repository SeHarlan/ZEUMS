"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, AppleIcon} from "lucide-react";
import { FC } from "react";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { OAuthProviderType } from "next-auth/providers/oauth-types";
import { P } from "../typography/Typography";
import { Separator } from "../ui/separator";

interface AuthOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loginWithWallet: () => void;
  loginWithProvider: (provider: OAuthProviderType) => void;
}

export const AuthOptionsDialog: FC<AuthOptionsDialogProps> = ({ open, onOpenChange, loginWithWallet, loginWithProvider }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to {TITLE_COPY}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            onClick={loginWithWallet}
            variant="outline"
            className="w-full justify-start"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Solana Wallet
          </Button>

          <div className="relative py-2">
            <Separator orientation="horizontal" className="w-full" />
            <P className="text-center absolute-center bg-popover px-2 text-muted-foreground">
              or
            </P>
          </div>

          <Button
            onClick={() => loginWithProvider("google")}
            variant="outline"
            className="w-full justify-start"
          >
            <span className="font-serif font-bold text-lg mr-2">G</span>
            Continue with Google
          </Button>

          <Button
            onClick={() => loginWithProvider("apple")}
            variant="outline"
            className="w-full justify-start"
          >
            <AppleIcon className="mr-2 h-4 w-4" />
            Continue with Apple
          </Button>

          <Button
            onClick={() => loginWithProvider("twitter")}
            variant="outline"
            className="w-full justify-start"
          >
            <span className="font-mono font-bold text-lg mr-2">𝕏</span>
            Continue with X (Twitter)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
