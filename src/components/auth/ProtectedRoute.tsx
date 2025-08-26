"use client";

import { useUser } from "@/context/UserProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Progress} from "@/components/ui/progress"; // Adjust path as needed
import { H1 } from "../typography/Typography";

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

  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!userLoading && !loggedIn) {
      router.push(fallbackUrl);
    }
  }, [loggedIn, userLoading, router, fallbackUrl, pathname]);

  useEffect(() => { 
    let interval: NodeJS.Timeout | null = null;

    if (loggedIn) { 
      setProgress(100); // Set progress to 100% when user is logged in
      return; // No need for an interval if user is logged in
    }

    if (userLoading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) {
            return 90; // Repeat at 90% to indicate loading
          }
          return prev + 1;
        });
      }, 100); // Adjust the interval as needed
    } 

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userLoading, loggedIn]);

  if (userLoading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen max-w-xl mx-auto">
        <H1>Z</H1>
        <Progress value={progress} />
      </div>
    );
  }

  if (!loggedIn) {
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
};
