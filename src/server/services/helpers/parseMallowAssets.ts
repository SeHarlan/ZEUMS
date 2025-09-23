import { ParsedBlockChainAsset } from "@/types/asset";
import { BlockchainAttribute, EntryTypes } from "@/types/entry";
import { BlockchainImage, BlockchainMedia, MediaCategory, MediaOrigin } from "@/types/media";
import { ChainIdsEnum } from "@/types/wallet";
import { MallowArtwork } from "@/types/mallow";

export const parseMallowAssets = (
  rawAssets: MallowArtwork[]
): ParsedBlockChainAsset[] => {
  const parsedAssets: ParsedBlockChainAsset[] = [];
  const editionMap: Record<string, ParsedBlockChainAsset> = {};

  for (const asset of rawAssets) {

    if (asset.source === "objkt") continue; //exclude objkt (tezos) nfts
     //must have at least image url and name
    if (!asset.imageUrl) continue;
    if (!asset.name) continue;

    // Parse attributes
    const attributes: BlockchainAttribute[] =
      asset.attributes?.map((attr) => ({
        trait_type: attr.trait_type,
        value: String(attr.value),
      })) || [];

    // Parse creators
    const onChainCreators =
      asset.royalties?.shares.map((share) => ({
        address: share.address,
        share: share.share,
      })) || [];

    // Parse owner
    const onChainOwner = {
      address: asset.owner,
    };

    // Parse media and determine category
    const { videoUrl, htmlUrl, vrUrl } = parseMallowMedia(asset);

    let category: MediaCategory = MediaCategory.Image;
    if (videoUrl) category = MediaCategory.Video;
    if (htmlUrl) category = MediaCategory.Html;
    if (vrUrl) category = MediaCategory.Vr;

    const mediaUrl = videoUrl || htmlUrl || vrUrl;

    const media: BlockchainImage | BlockchainMedia = {
      origin: MediaOrigin.Blockchain,
      category,
      aspectRatio: undefined,
      imageUrl: asset.imageUrl,
      ...(category !== MediaCategory.Image && { mediaUrl: mediaUrl! }),
    } as BlockchainImage | BlockchainMedia;

    const parsedAsset: ParsedBlockChainAsset = {
      blockchain: ChainIdsEnum.SOLANA,
      entryType: EntryTypes.BlockchainAsset,
      tokenAddress: asset.mintAccount,
      title: asset.name,
      description: asset.description,
      onChainCreators,
      onChainOwner,
      attributes,
      media,
    };

    //if max supply is 0 its a 1/1 and this will be falsy
    const isEdition = asset.maxSupply || asset.editionNumber;

    if (isEdition) {
      //replace url characters for a safe string as key
      const editionKey = asset.imageUrl.replaceAll(/[^a-zA-Z0-9]/g, "-");

      editionMap[editionKey] = parsedAsset;
    } else {
      parsedAssets.push(parsedAsset);
    }
  }

  //add editions to the parsed assets
  const editions = Object.values(editionMap);
  parsedAssets.push(...editions);

  //mallow assets come sorted (default is recently listed)

  return parsedAssets;
};


export const parseMallowMedia = (asset: MallowArtwork) => {
  const videoUrl = asset.videoUrl;
  const htmlUrl = asset.htmlUrl;
  const vrUrl = asset.modelUrl;
  
  return {
    videoUrl,
    htmlUrl,
    vrUrl,
  };
};