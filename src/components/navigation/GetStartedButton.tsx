"use client";

import { useUser } from "@/context/UserProvider";
import { EDIT_PROFILE_ACCOUNT, EDIT_TIMELINE } from "@/constants/clientRoutes";
import { FC, useEffect, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { useRouter } from "next/navigation";


const GetStartedButton: FC<{disabled?: boolean}> = ({disabled}) => {
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
  
  
  if(loggedIn) return (
    <LinkButton href={EDIT_TIMELINE} loading={userLoading}>
      Manage Timeline
    </LinkButton>
  );

  return (
    <Button onClick={handleStartClicked} loading={userLoading} disabled={disabled}>
      Get Started
    </Button>
  );
}

export default GetStartedButton;