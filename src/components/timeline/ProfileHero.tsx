import { UploadCategory } from "@/constants/uploadCategories";
import { PublicUserType } from "@/types/user";
import { getDisplayName } from "@/utils/user";
import { FC, useMemo } from "react";
import EditProfileFormButton from "../dashboard/editTimeline/editProfileForm/EditProfileForm";
import { PAGE_PADDING_X } from "../general/PageContainer";
import { Blockquote, H1 } from "../typography/Typography";
import { BannerImage } from "./BannerImage";
import DisplaySocials from "./DisplaySocials";
import { ProfileImage } from "./ProfileImage";

interface ProfileHeroProps { 
  publicUser?: PublicUserType | null;
  editMode?: boolean;
}

const ProfileHero: FC<ProfileHeroProps> = ({ publicUser, editMode = false }) => {
  const displayName = getDisplayName(publicUser || null);
  
  // Create blobUrlBuilderProps using the profile owner's ID
  const profileBlobUrlBuilderProps = useMemo(() => {
    if (!publicUser?._id) return undefined;
    return {
      userId: publicUser._id.toString(),
      category: UploadCategory.PROFILE_PICTURE,
    };
  }, [publicUser]);

  const bannerBlobUrlBuilderProps = useMemo(() => {
    if (!publicUser?._id) return undefined;
    return {
      userId: publicUser._id.toString(),
      category: UploadCategory.PROFILE_BANNER,
    };
  }, [publicUser]);

  return (
    <div>
      <BannerImage
        media={publicUser?.bannerImage}
        className="text-5xl mb-4 md:mb-8 md:shadow-lg rounded-none xl:rounded-b-md"
        fallbackText={displayName}
        blobUrlBuilderProps={bannerBlobUrlBuilderProps}
      />
      <div className={PAGE_PADDING_X}>
        <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
          <div className="flex gap-4 items-center relative">
            <div className="shrink-0 size-16 lg:size-26">
              <ProfileImage
                media={publicUser?.profileImage}
                fallbackText={displayName.charAt(0).toUpperCase()}
                className="text-4xl sm:text-6xl border-3"
                blobUrlBuilderProps={profileBlobUrlBuilderProps}
              />
            </div>
            <H1>{displayName}</H1>
            {editMode && (
              <EditProfileFormButton buttonClassName="shadow-md w-fit absolute -top-2 left-0 lg:left-auto lg:right-0 lg:translate-x-3/4 -translate-y-3/4 lg:translate-y-0" />
            )}
          </div>
          <DisplaySocials socialHandles={publicUser?.socialHandles || {}} />
        </div>
        {publicUser?.bio && (
          <Blockquote className="mt-0 whitespace-pre-wrap">
            {publicUser.bio}
          </Blockquote>
        )}
      </div>
    </div>
  );
};

export default ProfileHero;