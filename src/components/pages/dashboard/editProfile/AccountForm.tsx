"use client";
import { FC, useMemo, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserProvider";
import { AccountDetailsFormValues, profileAccountFormSchema } from "@/forms/editProfileAccountDetails";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { UserType } from "@/types/user";
import { USER_ROUTE } from "@/constants/serverRoutes";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { PublicKey } from "@solana/web3.js";
import { Label } from "@/components/ui/label";
import { CircleCheckIcon  } from "lucide-react";
import { cn } from "@/utils/ui-utils";
import { P } from "@/components/typography/Typography";
import { AuthLinkingDialog } from "@/components/auth/AuthLinkingDialog";
import { useEmailValidation } from "@/hooks/useEmailValidation";

//TODO-cleanup: make a reusable fake form field (with controlled inputs, with out the need to be in a form provider/controller)
//Make a reusable useUsernameValidation hook
// convert email and username to use the fake form field and respective validation hooks

const ProfileAccountForm: FC = () => {
  const { user, setUser } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const { email, setEmail, error, isValid } = useEmailValidation();
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

  // Default values for the form populated from user data
  const defaultValues: Partial<AccountDetailsFormValues> = {
    username: user?.username,
  };

  const form = useForm<AccountDetailsFormValues>({
    resolver: zodResolver(profileAccountFormSchema),
    defaultValues,
  });


  // useEffect(() => {
    // form.setError("username", { message: "Username is already taken" });
    //TODO-important check if the username is already taken as the user types (debounced)
  // }, [user?.username]);

  const onSubmit = (data: AccountDetailsFormValues) => {
    setSubmitting(true);
    axios
      .patch<{ user: UserType }>(USER_ROUTE, data)
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
          location: "AccountForm_onSubmit",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleVerifyNewEmail = () => {
    setVerifyOpen(true);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="w-full ">
                <FormLabel>Username</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-4 gap-y-2">
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <Button type="submit" className="w-full" loading={submitting}>
                    Save Username
                  </Button>
                </div>
                <FormDescription>
                  Used for tagging and sharing your profile
                  {usernameIsWallet ? " (defaults to wallet address)" : ""}.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="space-y-2">
        <Label>Verified Email</Label>
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
              disabled={!isValid || submitting}
            >
              Verify your email address
            </Button>
          </div>
        )}
        <P className="text-sm text-muted-foreground">
          A verified email allows you to log in anywhere using accounts linked
          to your email.
        </P>
        <P className="text-sm text-muted-foreground">
          This will never be shared or used for marketing without your consent.
        </P>
        {error && <P className="text-sm text-destructive">{error}</P>}
      </div>

      <AuthLinkingDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        email={email}
      />
    </div>
  );
}

export default ProfileAccountForm;