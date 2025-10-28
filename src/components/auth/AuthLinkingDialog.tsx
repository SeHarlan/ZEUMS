"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PENDING_AUTH_VERIFICATION_ROUTE } from "@/constants/serverRoutes";
import { handleClientError } from "@/utils/handleError";
import { cn } from "@/utils/ui-utils";
import axios from "axios";
import { InfoIcon } from "lucide-react";
import { OAuthProviderType } from "next-auth/providers/oauth-types";
import { signIn } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import { FC, useState } from "react";
import { toast } from "sonner";
import { EmailIcon, GoogleIcon } from "../icons/Social";
import { ONBOARDING_Z_INDEX } from "../onboarding/OnboardingPopover";
import { P } from "../typography/Typography";

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
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();

  //tells the email sign in page with page to redirect to in the magic link

  const returnPath = `${pathname}?${searchParams.toString()}`;

  const createPendingAuthVerification = async (cb: () => Promise<void>) => {
    setLoading(true);
    axios
      .post(PENDING_AUTH_VERIFICATION_ROUTE, {
        email,
      })
      .then(async () => {
        await cb();
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
  };

  const handleVerifyWithProvider = (provider: OAuthProviderType) => {
    createPendingAuthVerification(async () => {
      const result = await signIn(provider, {
        callbackUrl: returnPath,
        redirect: true, // Ensure redirect happens on mobile
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    });
  };

  const handleVerifyWithEmail = async () => {
    createPendingAuthVerification(async () => {
      const result = await signIn("email", {
        email,
        callbackUrl: returnPath,
        redirect: true,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        style={{ zIndex: ONBOARDING_Z_INDEX + 3 }}
      >
        <DialogHeader>
          <DialogTitle>Verifying Email</DialogTitle>
          <DialogDescription>Link this account to {email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={handleVerifyWithEmail}
            className={cn("w-full", !loading && "justify-start")}
            loading={loading}
            variant="outline"
          >
            <EmailIcon />
            Verify with a Magic Link
          </Button>

          <div className="space-y-2">
            <Button
              onClick={() => handleVerifyWithProvider("google")}
              className={cn("w-full", !loading && "justify-start")}
              loading={loading}
              variant="outline"
            >
              <GoogleIcon />
              Verify with Google
            </Button>

            <div className="flex items-center gap-1 text-muted-foreground">
              <InfoIcon className="size-3 flex-shrink-0" />
              <P className="text-sm">
                You must use the account linked to {email}
              </P>
            </div>
          </div>

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
