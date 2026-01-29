"use client";

import { UploadCategory } from "@/constants/uploadCategories";
import { useImageFallback } from "@/hooks/useImageFallback";
import { MediaType } from "@/types/media";
import { PublicUserType, UserType } from "@/types/user";
import { cn, getRgbaBackgroundFromUser } from "@/utils/ui-utils";
import Image from "next/image";
import { FC, useEffect, useMemo, useState } from "react";

export type BackgroundImageUser = Pick<
  PublicUserType | UserType,
  | "_id"
  | "backgroundImage"
  | "backgroundTileCount"
  | "backgroundTintHex"
  | "backgroundTintOpacity"
  | "backgroundBlur"
>;



export interface BackgroundImageProps {
  user: BackgroundImageUser | null | undefined;
  className?: string;
}

interface BackgroundImageInnerProps {
  backgroundImage: BackgroundImageUser["backgroundImage"];
  userId: string;
  blurPx: number;
  tileCount: number;
}

const BackgroundImageInner: FC<BackgroundImageInnerProps> = ({
  backgroundImage,
  userId,
  blurPx,
  tileCount,
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

  const [viewportDimensions, setViewportDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const imageAspectRatio = backgroundImage?.aspectRatio ?? 16 / 9;

  const gridConfig = useMemo(() => {
    if (tileCount === 0 || !imageUrl) {
      return { columns: 1, rows: 1, totalTiles: 1 };
    }

    const rows = tileCount;
    // Calculate columns needed to cover viewport while maintaining aspect ratio
    // columns = ceil((viewportWidth / viewportHeight) * rows / imageAspectRatio)
    const viewportAspectRatio = viewportDimensions.width / viewportDimensions.height;
    const columns = Math.ceil((viewportAspectRatio * rows) / imageAspectRatio);

    return {
      columns,
      rows,
      totalTiles: columns * rows,
    };
  }, [tileCount, imageUrl, viewportDimensions, imageAspectRatio]);

  if (!imageUrl) {
    return null;
  }

  // Single image (no tiling)
  if (tileCount === 0) {
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
  }

  // Tiled images
  return (
    <div
      className="absolute inset-0 z-1"
      style={{
        filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
        transform: blurPx > 0 ? "scale(1.05)" : undefined,
        display: "grid",
        gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
        gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
      }}
    >
      {Array.from({ length: gridConfig.totalTiles }).map((_, index) => (
        <div key={index} className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt=""
            fill
            priority={false}
            sizes={`${100 / gridConfig.columns}vw`}
            className="object-cover w-full h-full"
            onError={index === 0 ? onError : undefined}
            onLoad={index === 0 ? onLoad : undefined}
          />
        </div>
      ))}
    </div>
  );
};

export const BackgroundImage: FC<BackgroundImageProps> = ({
  user,
  className,
}) => {
  const backgroundImage = user?.backgroundImage ?? null;
  const blurPx = user?.backgroundBlur ?? 0;
  const tileCount = user?.backgroundTileCount ?? 0;
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
        <BackgroundImageInner
          backgroundImage={backgroundImage}
          userId={userId}
          blurPx={blurPx}
          tileCount={tileCount}
        />
      )}
    </div>
  );
};
