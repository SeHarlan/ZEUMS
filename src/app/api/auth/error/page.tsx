"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useUser } from "@/context/UserProvider";
import { HOME } from "@/constants/clientRoutes";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const {logInUser} = useUser();
  
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    // Clean up URL parameters after a delay
    const timer = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      window.history.replaceState({}, '', url.toString());
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthSignin':
        return {
          title: "OAuth Sign-in Failed",
          description: "There was a problem with the OAuth sign-in process. This might be due to mobile browser restrictions or network issues."
        };
      case 'OAuthCallback':
        return {
          title: "OAuth Callback Failed", 
          description: "The OAuth callback failed. This commonly happens on mobile devices when the redirect URL isn't properly configured."
        };
      case 'OAuthCreateAccount':
        return {
          title: "Account Creation Failed",
          description: "Could not create your account. Please try again or contact support if the issue persists."
        };
      case 'EmailCreateAccount':
        return {
          title: "Email Account Creation Failed",
          description: "Could not create an account with this email address. Please try a different email or contact support."
        };
      case 'Callback':
        return {
          title: "Authentication Callback Failed",
          description: "The authentication callback failed. This is often a mobile-specific issue with redirect handling."
        };
      case 'OAuthAccountNotLinked':
        return {
          title: "Account Already Linked",
          description: "This account is already linked to another user. Please use a different account or contact support."
        };
      case 'EmailSignin':
        return {
          title: "Email Sign-in Failed",
          description: "Email sign-in failed. Please check your credentials and try again."
        };
      case 'CredentialsSignin':
        return {
          title: "Sign-in Failed",
          description: "Sign-in failed. Please check your credentials and try again."
        };
      case 'SessionRequired':
        return {
          title: "Session Required",
          description: "Please sign in to access this page."
        };
      default:
        return {
          title: "Authentication Error",
          description: errorDescription || "An unknown authentication error occurred. Please try again."
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              If you are on mobile, try:
            </p>
            <ul className="text-sm text-gray-600 text-left space-y-1">
              <li>• Using Chrome or Safari browser</li>
              <li>• Clearing your browser cache</li>
              <li>• Disabling popup blockers</li>
              <li>• Checking your internet connection</li>
            </ul>
          </div>
          <div className="flex flex-col space-y-2">
            <LinkButton href={HOME} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </LinkButton>
            <Button variant="outline" onClick={logInUser} className="w-full">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
