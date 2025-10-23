"use client";

import { Button, LinkButton } from "@/components/ui/button";
import { EDIT_TIMELINE } from "@/constants/clientRoutes";
import { useUser } from "@/context/UserProvider";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";


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
      router.push(EDIT_TIMELINE);
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