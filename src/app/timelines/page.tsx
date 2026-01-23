"use client";

import FeedbackWrapper from "@/components/general/FeedbackWrapper";
import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import MediaThumbnail from "@/components/media/MediaThumbnail";
import { P } from "@/components/typography/Typography";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { USER_TIMELINE } from "@/constants/clientRoutes";
import { UploadCategory } from "@/constants/uploadCategories";
import useUsersByPage from "@/hooks/useUsersByPage";
import { PublicListUserType } from "@/types/user";
import { cn } from "@/utils/ui-utils";
import { getDisplayName } from "@/utils/user";
import { useRouter } from "next/navigation";
import { FC, useMemo } from "react";

export default function TimelinesPage() { 
  const { users, isLoading, isError } = useUsersByPage({ page: 1, limit: 16 });
  return (
    <PageContainer>
      <FeedbackWrapper
        isLoading={isLoading}
        isError={isError}
        hasData={!!users}
      >
        <PageHeading
          title={`Timelines`}
          subtitle={`Browse public timelines`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users?.map((user) => (
            <UserCard key={user._id.toString()} user={user} />
          ))}
        </div>
      </FeedbackWrapper>
    </PageContainer>
  );
}

const UserCard: FC<{ user: PublicListUserType }> = ({ user }) => {
  const router = useRouter();
  const handleClick = () => {
    router.push(USER_TIMELINE(user.username));
  }
  const bannerBlobUrlBuilderProps = useMemo(() => {
    return {
      userId: user._id.toString(),
      category: UploadCategory.PROFILE_BANNER,
    };
  }, [user]);
  
  return (
     <Card
      className={cn(
        "p-0 overflow-hidden cursor-pointer gap-1 rounded-lg hover:shadow-lg transition-shadow duration-300",
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0 relative">
        <MediaThumbnail
          useCustomLoader={false}
          media={user.bannerImage}
          alt={user.displayName}
          quality={80}
          blobUrlBuilderProps={bannerBlobUrlBuilderProps}
        />
      </CardContent>

      <CardFooter className="pb-1 px-3">
        <P className="text-lg font-semibold line-clamp-1">{getDisplayName(user)}</P>
      </CardFooter>
    </Card>
  )
}