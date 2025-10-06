"use client";

import { FC } from "react";
import { LinkButton } from "@/components/ui/button";
import { socialHandlesList } from "@/utils/ui-utils";
import { UserSocialHandles } from "@/types/user";
import { cn } from "@/utils/ui-utils";

interface DisplaySocialsProps {
  socialHandles: UserSocialHandles;
  className?: string;
}

const DisplaySocials: FC<DisplaySocialsProps> = ({ socialHandles, className }) => {
  // Filter out empty social handles and create valid links
  const validSocialHandles = socialHandlesList
    .map((handle) => {
      const value = socialHandles[handle.key];
      if (!value) return null;

      // For website, use the value directly (should have protocol)
      // For others, construct the URL using baseUrl + value
      const url = handle.key === "website" 
        ? value
        : `https://${handle.baseUrl}${value}`;

      return {
        ...handle,
        url,
        value,
      };
    })
    .filter((handle): handle is NonNullable<typeof handle> => handle !== null);

  if (validSocialHandles.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap md:gap-2", className)}>
      {validSocialHandles.map((handle) => (
        <LinkButton
          key={handle.key}
          href={handle.url}
          variant="ghost"
          size="icon"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 size-8 p-1"
          aria-label={`Visit ${handle.label}`}
        >
          <handle.Icon className="shrink-0 size-full" />
        </LinkButton>
      ))}
    </div>
  );
};

export default DisplaySocials;
