"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FC, useState } from "react";
import { OAuthProviderType } from "next-auth/providers/oauth-types";
import { cn } from "@/utils/ui-utils";
import { EmailIcon, GoogleIcon } from "../icons/Social";
import { usePathname, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AUTH_EMAIL_SIGNIN } from "@/constants/serverRoutes";
import { useUser } from "@/context/UserProvider";
import { handleClientError } from "@/utils/handleError";
import axios from "axios";
import { toast } from "sonner";
import { PENDING_AUTH_VERIFICATION_ROUTE } from "@/constants/serverRoutes";

interface AuthLinkingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}
export const AuthLinkingDialog: FC<AuthLinkingDialogProps> = ({
  open,
  onOpenChange,
  email,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  
  const createPendingAuthVerification = async (cb: () => void) => {
    setLoading(true);
    axios
      .post(PENDING_AUTH_VERIFICATION_ROUTE, {
        dbUserId: user?._id,
        email,
      })
      .then(() => {
        cb();
        onOpenChange(false);
      })
      .catch((error) => {
        toast.error("Failed to start verification process.");
        handleClientError({
          error,
          location: "AuthLinkingDialog_createPendingAuthVerification",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleVerifyWithProvider = (provider: OAuthProviderType) => {
    createPendingAuthVerification(() => {
      signIn(provider, {
        callbackUrl: pathname,
        redirect: true, // Ensure redirect happens on mobile
      });
    }) 
  };

  const handleVerifyWithEmail = async () => {
    createPendingAuthVerification(() => {
      router.push(AUTH_EMAIL_SIGNIN);
    })
  }; 

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verifying Email</DialogTitle>
          <DialogDescription>
            Link this account to {email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            onClick={handleVerifyWithEmail}
            variant="outline"
            className={cn("w-full", !loading && "justify-start")}
            loading={loading}
          >
            <EmailIcon />
            Verify with a Magic Link
          </Button>

          <Button
            onClick={() => handleVerifyWithProvider("google")}
            variant="outline"
            className={cn("w-full", !loading && "justify-start")}
            loading={loading}
          >
            <GoogleIcon />
            Verify with Google
          </Button>
          {/* 
          <Button
            onClick={() => handleVerifyWithProvider("apple")}
            variant="outline"
            className={cn("w-full", !loading && "justify-start")}
            loading={loading}
          >
            <AppleIcon className="mr-2 h-4 w-4" />
            Verify with Apple
          </Button>

          <Button
            onClick={() => handleVerifyWithProvider("twitter")}
            variant="outline"
            className={cn("w-full", !loading && "justify-start")}
            loading={loading}
          >
            <span className="font-mono font-bold text-lg mr-2">𝕏</span>
            Verify with X (Twitter)
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
