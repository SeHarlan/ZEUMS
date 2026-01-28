"use client";

import { UploadCategory } from "@/constants/uploadCategories";
import { useImageFallback } from "@/hooks/useImageFallback";
import { MediaType } from "@/types/media";
import { PublicUserType, UserType } from "@/types/user";
import { cn, getRgbaBackgroundFromUser } from "@/utils/ui-utils";
import Image from "next/image";
import { FC, useMemo } from "react";

export type TimelineBackgroundUser = Pick<
  PublicUserType | UserType,
  | "_id"
  | "backgroundImage"
  | "backgroundTintHex"
  | "backgroundTintOpacity"
  | "backgroundBlur"
>;



export interface TimelineBackgroundProps {
  user: TimelineBackgroundUser | null | undefined;
  className?: string;
}

interface TimelineBackgroundInnerProps {
  backgroundImage: TimelineBackgroundUser["backgroundImage"];
  userId: string;
  blurPx: number;
}

const TimelineBackgroundInner: FC<TimelineBackgroundInnerProps> = ({
  backgroundImage,
  userId,
  blurPx,
}) => {
  const blobUrlBuilderProps = useMemo(() => {
    return {
      userId,
      category: UploadCategory.PROFILE_BACKGROUND,
    };
  }, [userId]);

  const { imageUrl, onError, onLoad } = useImageFallback({
    media: backgroundImage as MediaType,
    blobUrlBuilderProps,
  });

  if (!imageUrl) {
    return null;
  }

  return (
      <div
        className="absolute inset-0 z-1"
        style={{
          filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
          transform: blurPx > 0 ? "scale(1.05)" : undefined,
        }}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          priority={false}
          sizes="100vw"
          className="object-cover w-full h-full z-0"
          onError={onError}
          onLoad={onLoad}
        />
      </div>
  );
};

export const TimelineBackground: FC<TimelineBackgroundProps> = ({
  user,
  className,
}) => {
  const backgroundImage = user?.backgroundImage ?? null;
  const blurPx = user?.backgroundBlur ?? 0;
  const userId = user?._id?.toString();

  const tintColor = useMemo(() => {
    return getRgbaBackgroundFromUser(user);
  }, [user]);


  if (!userId) {
    return null;
  }

  return (
    <div
      className={cn("fixed inset-0 z-0 pointer-events-none", className)}
      aria-hidden="true"
    >
      {tintColor && (
        <div className="absolute z-2 inset-0" style={{ backgroundColor: tintColor }} />
      )}
      {backgroundImage && (
        <TimelineBackgroundInner
          backgroundImage={backgroundImage}
          userId={userId}
          blurPx={blurPx}
        />
      )}
    </div>
  );
};
