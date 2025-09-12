"use client";
import { FC, useMemo, useState } from "react";
import { StatelessFormItem } from "@/components/general/StatelessFormItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserProvider";
import axios from "axios";
import { UserType } from "@/types/user";
import { USER_ROUTE } from "@/constants/serverRoutes";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { PublicKey } from "@solana/web3.js";
import { CircleCheckIcon  } from "lucide-react";
import { cn } from "@/utils/ui-utils";
import { AuthLinkingDialog } from "@/components/auth/AuthLinkingDialog";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { useUsernameValidation } from "@/hooks/useUsernameValidation";

const ProfileAccountForm: FC = () => {
  const { user, setUser } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const {
    email,
    setEmail,
    error: emailError,
    isValid: emailIsValid,
  } = useEmailValidation(user?.authUser?.email, { uniquenessCheck: "AuthUser" });
  const {
    username,
    setUsername,
    error: usernameError,
    isValid: usernameIsValid,
  } = useUsernameValidation(user?.username);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const verifiedEmail = user?.authUser?.email;
  // const walletsByChain = getWalletsByChain(user);

  const usernameIsWallet = useMemo(() => {
    if (!user?.username) return false;

    try {
      return PublicKey.isOnCurve(user.username);
    } catch {
      return false;
    }
  }, [user?.username]);

  const onUsernameSubmit = () => {
    if (!usernameIsValid) return;
    setSubmitting(true);
    axios
      .patch<{ user: UserType }>(USER_ROUTE, { username })
      .then((response) => {
        toast.success("Username updated successfully!");

        // Update the user context with the returned user data
        if (response.data.user) {
          setUser(response.data.user);
        }
      })
      .catch((error) => {
        toast.error("Failed to update username.");
        handleClientError({
          error,
          location: "AccountForm_onUsernameSubmit",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleVerifyNewEmail = () => {
    if (!emailIsValid) return;
    setVerifyOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <StatelessFormItem 
          label="Username"
          description={`Used for tagging and sharing your profile${usernameIsWallet ? " (defaults to wallet address)" : ""}.`}
          errorMessage={usernameError}

        >
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-4 gap-y-2">
            <Input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button onClick={onUsernameSubmit} className="w-full" loading={submitting} disabled={!usernameIsValid}>
              Save Username
            </Button>
          </div>
        </StatelessFormItem>
      </div>

      <StatelessFormItem 
        label="Verified Email"
        description="A verified email allows you to log in anywhere using accounts linked to your email. Never shared or used without consent"
        errorMessage={emailError}
      >
        {verifiedEmail ? (
          <Button className="w-full justify-start" disabled>
            <CircleCheckIcon />
            {verifiedEmail}
          </Button>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-4 gap-y-2">
            <Input
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="button"
              className={cn("w-full")}
              onClick={handleVerifyNewEmail}
              disabled={!emailIsValid || submitting}
            >
              Verify your email address
            </Button>
          </div>
        )}
      </StatelessFormItem>

      <AuthLinkingDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        email={email}
      />
    </div>
  );
}

export default ProfileAccountForm;