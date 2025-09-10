"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WalletIcon } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { OAuthProviderType } from "next-auth/providers/oauth-types";
import { P } from "../typography/Typography";
import { Separator } from "../ui/separator";
import { cn } from "@/utils/ui-utils";
import { EmailIcon, GoogleIcon } from "../icons/Social";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { signIn } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_EMAIL_SIGNIN } from "@/constants/serverRoutes";
interface AuthOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOADING_DELAY = 500;

export const AuthOptionsDialog: FC<AuthOptionsDialogProps> = ({ open, onOpenChange }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleLoginWithWallet = () => {
    setLoading(true);

    timerRef.current = setTimeout(() => {
      setVisible(true);
      onOpenChange(false);
    }, LOADING_DELAY);
  };

  const handleLoginWithProvider = (provider: OAuthProviderType) => {
    setLoading(true);

    timerRef.current = setTimeout(() => {
      signIn(provider, {
        callbackUrl: pathname,
        redirect: true, // Ensure redirect happens on mobile
      });
      onOpenChange(false);
    }, LOADING_DELAY);
  };

  const handleLoginWithEmail = () => {
    setLoading(true);
    timerRef.current = setTimeout(() => {
      router.push(AUTH_EMAIL_SIGNIN);
      onOpenChange(false);
    }, LOADING_DELAY);
  };

  useEffect(() => {
    setLoading(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [open, onOpenChange]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to {TITLE_COPY}</DialogTitle>
          <DialogDescription className="sr-only">
            Sign in options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            onClick={handleLoginWithWallet}
            className={cn("w-full", !loading && "justify-start")}
            loading={loading}
          >
            <WalletIcon />
            Connect Solana Wallet
          </Button>

          <div className="relative py-2">
            <Separator orientation="horizontal" className="w-full" />
            <P className="text-center absolute-center bg-popover px-2 text-muted-foreground">
              or
            </P>
          </div>

          <Button
            onClick={handleLoginWithEmail}
            variant="outline"
            className={cn("w-full", !loading && "justify-start")}
            loading={loading}
          >
            <EmailIcon />
            Continue with Email
          </Button>

          <Button
            onClick={() => handleLoginWithProvider("google")}
            variant="outline"
            className={cn("w-full", !loading && "justify-start")}
            loading={loading}
          >
            <GoogleIcon/>
            Continue with Google
          </Button>
          {/* 
          <Button
            onClick={() => handleLoginWithProvider("apple")}
            variant="outline"
            className={cn("w-full", !loading && "justify-start")}
            loading={loading}
          >
            <AppleIcon className="mr-2 h-4 w-4" />
            Continue with Apple
          </Button>

          <Button
            onClick={() => handleLoginWithProvider("twitter")}
            variant="outline"
            className={cn("w-full", !loading && "justify-start")}
            loading={loading}
          >
            <span className="font-mono font-bold text-lg mr-2">𝕏</span>
            Continue with X (Twitter)
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
