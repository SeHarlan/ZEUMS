"use client";

import { useUser } from "@/context/UserProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, } from "react";
import PageLoading from "../general/PageLoading";

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
    return <PageLoading complete={loggedIn} loading={userLoading} />
  }

  if (!loggedIn) {
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
};
