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
import { P } from "@/components/typography/Typography";
import { useUser } from "@/context/UserProvider";
import { AccountDetailsFormValues, profileAccountFormSchema } from "@/forms/editProfileAccountDetails";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { UserType } from "@/types/user";
import { USER_ROUTE } from "@/constants/serverRoutes";
import { toast } from "sonner";
import { handleClientError } from "@/utils/handleError";
import { Separator } from "@/components/ui/separator";
import { PublicKey } from "@solana/web3.js";

const ProfileAccountForm: FC = () => { 
  const { user, setUser } = useUser();
  const [submitting, setSubmitting] = useState(false);

  const usernameIsWallet = useMemo(() => {
    if (!user?.username) return false;

    try {
      return PublicKey.isOnCurve(user.username);
    } catch {
      return false;
    }
  }, [user?.username]);

  // const walletsByChain = getWalletsByChain(user);
  // Default values for the form populated from user data
  const defaultValues: Partial<AccountDetailsFormValues> = {
    username: user?.username,
    // wallets: user?.wallets || [],
    email: user?.email || "",
  };

  const form = useForm<AccountDetailsFormValues>({
    resolver: zodResolver(profileAccountFormSchema),
    defaultValues,
  });

  const onSubmit = (data: AccountDetailsFormValues) => {
    setSubmitting(true);
    axios
      .patch<{ user: UserType }>(USER_ROUTE, data)
      .then((response) => {
        toast.success("Account details updated successfully!");

        // Update the user context with the returned user data
        if (response.data.user) {
          setUser(response.data.user);
        }
      })
      .catch((error) => {
        toast.error("Failed to update account details.");
        handleClientError({
          error,
          location: "AccountForm_onSubmit",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // const addWallet = () => {
  //   // const currentWallets = form.getValues("wallets") || [];
  //   // form.setValue("wallets", [...currentWallets, ""]);
  // };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-6"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full ">
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>
                Used for tagging and sharing your profile
                {usernameIsWallet ? " (defaults to wallet address)" : ""}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <div>
        <FormLabel>Wallets</FormLabel>
        <div className="space-y-2">
          {form.watch("wallets")?.map((_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`wallets.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={addWallet}
        >
          Add Wallet
        </Button>
      </div> */}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email{" "}
                <P className="text-muted-foreground text-sm">(optional)</P>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your email is kept private and used solely for account and
                update notifications.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <Button type="submit" className="w-full" loading={submitting}>
          Save Account Details
        </Button>
      </form>
    </Form>
  );
}

export default ProfileAccountForm;