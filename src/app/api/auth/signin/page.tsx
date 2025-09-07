"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { handleClientError } from "@/utils/handleError";
import { HOME } from "@/constants/clientRoutes";
import { P } from "@/components/typography/Typography";



export default function MagicLinkPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email,
        redirect: true,
        callbackUrl: HOME,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

    } catch (error: unknown) {
      handleClientError({
        error,
        location: "signin-MagicLinkPage_handleSubmit",
      });
      import("sonner").then(({ toast }) => {
        toast.error("Failed to send magic link. Please try again.");
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto size-12 bg-muted rounded-full flex items-center justify-center">
          <Mail className="size-6" />
        </div>
        <CardTitle className="text-xl">Sign in with Email</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a magic link to sign
          in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            Send magic link
          </Button>
          <P className="text-center text-sm text-muted-foreground">
            The magic link will expire in 24 hours. If you don&apos;t receive the
            email, check your spam folder.
          </P>
        </form>
        

        <Button
          className="w-full"
          variant="outline"
          onClick={() => window.history.back()}
        >
          <ArrowLeft />
          Back
        </Button>
      </CardContent>
    </Card>
  );
}
