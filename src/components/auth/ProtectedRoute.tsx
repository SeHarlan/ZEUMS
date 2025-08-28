"use client";

import { useUser } from "@/context/UserProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, } from "react";
import { H1 } from "../typography/Typography";
import AutomatedProgress from "../general/AutomatedProgress";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export const ProtectedRoute = ({
  children,
  fallbackUrl = "/",
}: ProtectedRouteProps) => {
  const { userLoading, loggedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!userLoading && !loggedIn) {
      router.push(fallbackUrl);
    }
  }, [loggedIn, userLoading, router, fallbackUrl, pathname]);


  if (userLoading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen max-w-xl mx-auto p-8">
        <H1>Z</H1>
        <AutomatedProgress complete={loggedIn} loading={userLoading} />
      </div>
    );
  }

  if (!loggedIn) {
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
};
