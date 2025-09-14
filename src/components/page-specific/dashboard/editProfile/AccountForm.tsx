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
import { CircleCheckIcon, WalletIcon, XIcon } from "lucide-react";
import { cn } from "@/utils/ui-utils";
import { AuthLinkingDialog } from "@/components/auth/AuthLinkingDialog";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { useUsernameValidation } from "@/hooks/useUsernameValidation";
import { useSolanaWalletVerification } from "@/hooks/useWalletVerification";
import { Badge } from "@/components/ui/badge";
import { truncate } from "@/utils/ui-utils";
import { P } from "@/components/typography/Typography";
import { getWalletsByChain } from "@/utils/user";
import { ChainIdsEnum } from "@/types/wallet";

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
  const verifiedSolanaWallets = getWalletsByChain(user)[ChainIdsEnum.SOLANA];

  const { verifyWallet, removeWallet, isVerifying, verifiedPublicKey } = useSolanaWalletVerification();

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

    const userData: Partial<UserType> = {
      username,
    }
    axios
      .patch<{ user: UserType }>(USER_ROUTE, userData)
      .then((response) => {
        toast.success("Username updated successfully!");
        setUser(response.data.user);
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

  const handleRemoveWallet = (walletAddress: string) => {
    removeWallet(walletAddress);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <StatelessFormItem
          label="Username"
          description={`Used for tagging and sharing your profile${
            usernameIsWallet ? " (defaults to wallet address)" : ""
          }.`}
          errorMessage={usernameError}
        >
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-4 gap-y-2">
            <Input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button
              onClick={onUsernameSubmit}
              className="w-full"
              loading={submitting}
              disabled={!usernameIsValid}
            >
              Save Username
            </Button>
          </div>
        </StatelessFormItem>
      </div>

      <div>
        <StatelessFormItem
          label="Verified Email"
          description="A verified email allows you to log in anywhere using accounts linked to your email."
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
        <P className="text-muted-foreground text-sm italic">
          Never shared or used without consent
        </P>
      </div>

      <StatelessFormItem
        label="Verified Wallets"
        description="Verified wallets allow you to sign in and prove ownership of digital assets."
      >
        <div className="space-y-3">
          {/* Display existing verified wallets */}
          {verifiedSolanaWallets.length ? (
            <div className="flex flex-wrap gap-2">
              <P className="text-muted-foreground text-sm font-bold">Solana:</P>
              {verifiedSolanaWallets.map((address) => (
                <Badge
                  key={address}
                  variant={
                    verifiedPublicKey === address ? "default" : "secondary"
                  }
                  className="font-bold stroke-4"
                >
                  <CircleCheckIcon className="stroke-3" />

                  {truncate(address)}

                  {verifiedSolanaWallets.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveWallet(address)}
                      className="rounded-full size-4"
                      disabled={isVerifying}
                    >
                      <XIcon className="size-3 stroke-3" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
          ) : null}

          {/* Add new wallet button */}
          <Button
            onClick={verifyWallet}
            loading={isVerifying}
            className="w-full"
            variant={!verifiedSolanaWallets.length ? "default" : "outline"}
          >
            <WalletIcon />
            Add Verified Wallet
          </Button>
        </div>
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