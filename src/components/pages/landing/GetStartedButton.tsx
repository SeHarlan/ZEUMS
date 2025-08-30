"use client";

import { useUser } from "@/context/UserProvider";
import { EDIT_PROFILE_ACCOUNT, EDIT_PROFILE_DISPLAY, EDIT_TIMELINE } from "@/constants/clientRoutes";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";

const GetStartedButton: FC = () => {
  const { loggedIn, logInUser, userLoading } = useUser();

  const router = useRouter();
  const [clicked, setClicked] = useState(false); //only trigger useEffect if user has clicked the button

  const handleStartClicked = () => {
    logInUser();
    setClicked(true);
  }

  useEffect(() => {
    if (loggedIn && clicked) {
      router.push(EDIT_PROFILE_ACCOUNT);
    }
  }, [loggedIn, clicked, router]);
  
  
//TODO change back to normal after timeline is ready
  if(loggedIn) return (
    // <LinkButton href={EDIT_TIMELINE} disabled={userLoading}>
    //   Manage Timeline
    // </LinkButton>
    <LinkButton href={EDIT_PROFILE_DISPLAY} disabled={userLoading}>
      Edit Profile
    </LinkButton>
  );

  return (
    <Button onClick={handleStartClicked} disabled={userLoading}>
      {/* Get started */}
      Sign up
    </Button>
  );
}

export default GetStartedButton;