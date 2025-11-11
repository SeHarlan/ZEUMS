import { BlockchainCollection, ParsedBlockChainAsset, SkippedAssetReason, SkippedBlockChainAsset } from "@/types/asset";
import { BlockchainAttribute, EntryTypes } from "@/types/entry";
import { File, GetAssetResponse, Interface, Scope } from "@/types/helius";
import { BlockchainImage, BlockchainMedia, CdnIdType, MediaCategory, MediaOrigin } from "@/types/media";
import { ChainIdsEnum } from "@/types/wallet";
import { solanaSpamCreatorAddresses } from "./addressLists";


export const parseHeliusAssets = (
  rawAssets: GetAssetResponse[]
) => {
  const parsedAssets: ParsedBlockChainAsset[] = [];
  const skippedAssets: SkippedBlockChainAsset[] = [];
  const editionMap: Record<string, ParsedBlockChainAsset> = {}; 
  let editionCount = 0;

  for (const asset of rawAssets) {
    const { content, creators, ownership, id, authorities } = asset;

    // Must have proper content
    const imageUrl = content?.links?.image;
    const name = content?.metadata?.name;

    const likelySpam = isSpamNft(asset);
    const isCollection = isCollectionNft(asset);
    const isBroken = !imageUrl || !name;


    if (isBroken || likelySpam || isCollection) {
      let reason = SkippedAssetReason.BROKEN_CONTENT;
      if (likelySpam) reason = SkippedAssetReason.LIKELY_SPAM;
      if (isCollection) reason = SkippedAssetReason.COLLECTION_NFT;

      skippedAssets.push({
        tokenAddress: id,
        title: name || "broken - n/a",
        description: content?.metadata?.description,
        reason,
      });
      continue;
    }

    // Check if asset is likely spam (but don't filter it out)

    const attributes: BlockchainAttribute[] = content.metadata.attributes
      ?.length
      ? content.metadata.attributes?.map((a) => ({
          trait_type: a.trait_type,
          value: a.value,
        }))
      : [];
    const updateAuthority = authorities?.find((authority) =>
      authority.scopes.includes(Scope.FULL)
    );

    const onChainCreators =
      creators?.map((creator) => ({
        address: creator.address,
        share: creator.share,
        verified: creator.verified,
      })) || [];

    if (!onChainCreators.length && updateAuthority) {
      onChainCreators.push({
        address: updateAuthority.address,
        share: 0, //unknown
        verified: false, //unknown
      });
    }

    const onChainOwner = {
      address: ownership.owner,
    };

    const assetGrouping = asset.grouping?.length ? asset.grouping[0] : null;

    const collection: BlockchainCollection | undefined = assetGrouping
      ? {
          address: assetGrouping.group_value,
          name: assetGrouping.collection_metadata?.name,
          image: assetGrouping.collection_metadata?.image,
          description: assetGrouping.collection_metadata?.description,
        }
      : undefined;

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
      title: name,
      description: content.metadata.description,
      onChainCreators,
      onChainOwner,
      attributes,
      media,
      collection,
    };

    const isEdition =
      asset.supply?.print_max_supply || asset.supply?.edition_number;

    if (isEdition) {
      editionCount++;
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

  const duplicateEditionCount = editionCount - editions.length;

  return { parsedAssets, skippedAssets, duplicateEditionCount };
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
  const { content, creators, authorities } = asset;
  if (!content || !content.links || !content.metadata) return true;

  //TODO this has been too strict, find new way
  // const hasVerifiedCreator = creators?.some((c) => c.verified);
  // const whiteListedCollection =
  //   grouping?.[0]?.group_value &&
  //   solanaWhiteListedCollectionAddresses.has(grouping[0].group_value);

  // no verified creator,  or whitelisted/verified collection -> is spam
  // if (!hasVerifiedCreator && !whiteListedCollection) return true;

  // Must not have excessive authorities (spam indicator)
  if (authorities && authorities.length > 5) return true;

  for (const creator of creators || []) {
    if (solanaSpamCreatorAddresses.has(creator.address)) return true;
  }

  return false;
}

