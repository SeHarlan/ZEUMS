import { FC } from "react";
import { Blockquote, H1 } from "../typography/Typography";
import { PublicUserType } from "@/types/user";
import { ProfileImage } from "./ProfileImage";
import { getDisplayName } from "@/utils/user";
import { BannerImage } from "./BannerImage";
import { PAGE_PADDING_X } from "../general/PageContainer";
import DisplaySocials from "./DisplaySocials";

interface ProfileHeroProps { 
  publicUser?: PublicUserType | null;
}

const ProfileHero: FC<ProfileHeroProps> = ({ publicUser }) => {
  const displayName = getDisplayName(publicUser || null);
  return (
    <div>
      <BannerImage
        media={publicUser?.bannerImage}
        className="text-5xl mb-4 md:mb-8"
        fallbackText={displayName}
      />
      <div className={PAGE_PADDING_X}>
        <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <div className="flex-shrink-0 size-16 sm:size-26">
              <ProfileImage
                media={publicUser?.profileImage}
                fallbackText={displayName.charAt(0).toUpperCase()}
                className="text-4xl sm:text-6xl border-3"
              />
            </div>
            <H1>{displayName}</H1>
          </div>
          <DisplaySocials socialHandles={publicUser?.socialHandles || {}} />
        </div>
        {publicUser?.bio && <Blockquote className="mt-0">{publicUser.bio}</Blockquote>}
      </div>
    </div>
  );
};

export default ProfileHero;