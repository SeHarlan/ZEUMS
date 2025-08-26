"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { useUser } from "@/context/UserProvider";
import { type VariantProps } from "class-variance-authority";
import { FC } from "react";

const LoginButton: FC<VariantProps<typeof buttonVariants>> = ({ variant, size }) => {
  const { logOutUser, logInUser, userLoading, loggedIn } = useUser();

  const handleClick = async () => {
    if (!loggedIn) {
      logInUser();
    } else {
      await logOutUser();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={userLoading}
      variant={variant}
      size={size}
    >
      {loggedIn ? "Log out" : "Log in"}
    </Button>
  );
};

export default LoginButton;