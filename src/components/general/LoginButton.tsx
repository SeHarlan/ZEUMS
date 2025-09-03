"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { useUser } from "@/context/UserProvider";
import { type VariantProps } from "class-variance-authority";
import { FC } from "react";

interface LoginButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
}

const LoginButton: FC<LoginButtonProps> = ({ variant, size, className }) => {
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
      loading={userLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {loggedIn ? "Log out" : "Log in"}
    </Button>
  );
};

export default LoginButton;