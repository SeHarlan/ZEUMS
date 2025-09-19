import { ParsedBlockChainAsset } from "@/types/asset";
import { BlockchainAttribute, EntryTypes } from "@/types/entry";
import { GetAssetResponse, File, Interface } from "@/types/helius";
import { BlockchainImage, BlockchainMedia, CdnIdType, MediaCategory, MediaOrigin } from "@/types/media";
import { ChainIdsEnum } from "@/types/wallet";
import { solanaSpamCreatorAddresses, solanaWhiteListedCollectionAddresses } from "./addressLists";


export const parseSolanaAssets = (
  rawAssets: GetAssetResponse[]
): ParsedBlockChainAsset[] => {
  const parsedAssets: ParsedBlockChainAsset[] = [];
  const editionMap: Record<string, ParsedBlockChainAsset> = {}; 

  for (const asset of rawAssets) {
    const { content, creators, ownership, id } = asset;


    ///////FILTER OUT SPAM NFTs
    if (!content || isSpamNft(asset)) continue;
    
    // Must have proper content
    const imageUrl = content.links?.image;
    if (!imageUrl) continue;
    if (!content.metadata?.name) continue;
    //////

    if(isCollectionNft(asset)) continue;

    const attributes: BlockchainAttribute[] = content.metadata.attributes
      ?.length
      ? content.metadata.attributes?.map((a) => ({
          type: a.trait_type,
          value: a.value,
        }))
      : [];

    const onChainCreators =
      creators?.map((creator) => ({
        address: creator.address,
        share: creator.share,
        verified: creator.verified,
      })) || [];

    const onChainOwner = {
      address: ownership.owner,
    };

    //parse media and figure out category
    const { imageCdnUrl, videoUrl, htmlUrl, vrUrl } = parseSolanaMedia({
      files: content?.files || [],
      animationUrl: content.links?.animation_url,
    });

    let category: MediaCategory = MediaCategory.Image;
    if (videoUrl) category = MediaCategory.Video;
    if (htmlUrl) category = MediaCategory.Html;
    if (vrUrl) category = MediaCategory.Vr;

    const mediaUrl = videoUrl || htmlUrl || vrUrl;

    const imageCdn = imageCdnUrl
      ? {
          type: CdnIdType.HELIUS_URL,
          cdnId: imageCdnUrl,
        }
      : undefined;

    const media: BlockchainImage | BlockchainMedia = {
      origin: MediaOrigin.Blockchain,
      category,
      aspectRatio: undefined,
      imageUrl: imageUrl,
      imageCdn,
      ...(category !== MediaCategory.Image && { mediaUrl: mediaUrl! }),
    } as BlockchainImage | BlockchainMedia;

    const parsedAsset: ParsedBlockChainAsset = {
      blockchain: ChainIdsEnum.SOLANA,
      entryType: EntryTypes.BlockchainAsset,
      tokenAddress: id,
      title: content.metadata.name,
      description: content.metadata.description,
      onChainCreators,
      onChainOwner,
      attributes,
      media,
    };

    const isEdition =
      asset.supply?.print_max_supply || asset.supply?.edition_number;

    if (isEdition) {
      //replace key url characters for a safe string
      const editionKey = imageUrl.replaceAll(/[^a-zA-Z0-9]/g, "-");

      //only add one edition
      editionMap[editionKey] = parsedAsset;
    } else {
      //add normally
      parsedAssets.push(parsedAsset);
    }
  }

  //add editions to the parsed assets
  const editions = Object.values(editionMap);
  parsedAssets.push(...editions);

  const sortedAssets = parsedAssets.sort((a, b) => {
    // Sort by title, then by token address
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    if (a.tokenAddress < b.tokenAddress) return -1;
    if (a.tokenAddress > b.tokenAddress) return 1;
    return 0;
  });
  
  return sortedAssets;
};  

type ParseSolanaMediaProps = {
  files: File[];
  animationUrl?: string;
}

export const parseSolanaMedia = ({ files, animationUrl }: ParseSolanaMediaProps) => {

  let imageCdnUrl: string | undefined;
  let videoUrl: string | undefined;
  let htmlUrl: string | undefined;
  let vrUrl: string | undefined;

  for (const file of files) {
    if (file.mime?.includes("image")) {
      imageCdnUrl = file.cdn_uri;
    } else if (file.mime?.includes("video")) {
      if (file.uri === animationUrl) { //make sure its the primary video file
        videoUrl = animationUrl;
      }
    } else if (file.mime?.includes("html")) {
      htmlUrl = file.uri;
    } else if (file.mime?.includes("model")) {
      vrUrl = file.uri;
    }
  }

  if (animationUrl && !videoUrl && !htmlUrl && !vrUrl) {
    // if animationUrl exists but no files are found assume its a video
    videoUrl = animationUrl;
  }

  return {
    imageCdnUrl,
    videoUrl,
    htmlUrl,
    vrUrl,
  }
}

function isCollectionNft(asset: GetAssetResponse): boolean {

  // finds core collections
  if (asset.interface === Interface.MPL_CORE_COLLECTION) return true;

  //TODO find way to handle legacy collection types
  return false;
}

function isSpamNft(asset: GetAssetResponse): boolean {
  const { content, creators, grouping, authorities } = asset;
  if (!content || !content.links || !content.metadata)
    return true;

  const hasVerifiedCreator = creators?.some((c) => c.verified);
  const hasVerifiedCollection =
    grouping?.some((group) => group.verified);
    const whiteListedCollection =
      grouping?.[0]?.group_value &&
      solanaWhiteListedCollectionAddresses.has(grouping[0].group_value);

  // no verified creator,  or whitelisted/verified collection -> is spam
  if (!hasVerifiedCreator && !hasVerifiedCollection && !whiteListedCollection) return true;

  // Must not have excessive authorities (spam indicator)
  if (authorities && authorities.length > 5) return true;


  for (const creator of creators || []) {
    if (solanaSpamCreatorAddresses.has(creator.address)) return true;
  }

  return false;
}

