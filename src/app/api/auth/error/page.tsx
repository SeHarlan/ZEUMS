"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { HOME } from "@/constants/clientRoutes";
import { P } from "@/components/typography/Typography";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);

  useEffect(() => {
    if(error) return;

    setError(searchParams.get("error"))
    setErrorDescription(searchParams.get("error_description"))

    // Clean up URL parameters after a delay
    const timer = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      window.history.replaceState({}, '', url.toString());
    }, 5000);

    return () => clearTimeout(timer);
  }, [searchParams, error]);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "OAuthSignin":
        return {
          title: "Sign-in Failed",
          description:
            "There was a problem with the authentication sign-in process. This might be due to mobile browser restrictions or network issues.",
        };
      case "Callback":
      case "OAuthCallback":
        return {
          title: "Callback Failed",
          description:
            "There was a problem with the authentication sign-in process. Please try again or contact support if the issue persists.",
        };
      case "OAuthCreateAccount":
        return {
          title: "Account Creation Failed",
          description:
            "Could not create your account. Please try again or contact support if the issue persists.",
        };
      case "EmailCreateAccount":
        return {
          title: "Email Account Creation Failed",
          description:
            "Could not create an account with this email address. Please try a different email or contact support.",
        };
      case "OAuthAccountNotLinked":
        return {
          title: "Account Already Linked",
          description:
            "This account is already linked to another user. Please use a different account or contact support.",
        };
      case "EmailSignin":
        return {
          title: "Email Sign-in Failed",
          description:
            "Email sign-in failed. Please make sure your email is correct and try again.",
        };
      case "SessionRequired":
      case "CredentialsSignin":
        return {
          title: "Sign-in Failed",
          description:
            "Sign-in failed. Please try again or contact support if the issue persists.",
        };
      default:
        return {
          title: "Authentication Error",
          description:
            errorDescription ||
            "An unknown authentication error occurred. Please try again.",
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto size-12 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">
          {errorInfo.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {errorInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="md:hidden">
          <P className="text-sm text-center text-muted-foreground mb-2">
            If you are on mobile, try:
          </P>
          <ul className="text-sm text-left space-y-1">
            <li>• Using Chrome or Safari browser</li>
            <li>• Clearing your browser cache</li>
            <li>• Disabling popup blockers</li>
            <li>• Checking your internet connection</li>
          </ul>
        </div>
        <div className="space-y-2">
          <LinkButton href={HOME} className="w-full">
            <ArrowLeft />
            Go Home
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  )
}
