"use client";

import { FC, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
import { ParsedBlockChainAsset } from "@/types/asset";
import ScrollableDialog from "../general/ScrollableDialog";
import { P, H3 } from "../typography/Typography";
import { Separator } from "@/components/ui/separator";
import { truncate } from "@/utils/ui-utils";
import { EntrySource } from "@/types/entry";
import useSolanaAssets from "@/hooks/useSolanaAssets";
import { SOLANA_BLOCKCHAIN_EXPLORER } from "@/constants/externalLinks";
import AssetThumbnail from "./AssetThumbnail";
import { BLOCKCHAIN_MEDIA_PATHS } from "@/constants/clientRoutes";
import { ChainIdsEnum } from "@/types/wallet";
import { getReturnKey, makeReturnQueryParam } from "@/utils/navigation";
import { usePathname } from "next/navigation";


interface AssetMetadataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: ParsedBlockChainAsset;
}


const AssetMetadataDialog: FC<AssetMetadataDialogProps> = ({
  open,
  onOpenChange,
  asset
}) => {
  const pathname = usePathname();

  const { solanaAssets: childrenAssets } = useSolanaAssets({
    publicKeys: [asset.tokenAddress],
    source: EntrySource.Collector,
  });
  
  const returnKey = getReturnKey(pathname, asset.tokenAddress);

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title={asset.title}
      wrapperClassName="bg-popover-blur"
    >
      <div className="space-y-4">
        {/* Description */}
        {asset.description && (
          <P className="text-sm whitespace-pre-line">{asset.description}</P>
        )}

        <Separator />
        <div className="grid sm:grid-cols-2 gap-4">
          <MetadataSection title="Token Address">
            <AddressTag address={asset.tokenAddress} variant="default" />
          </MetadataSection>

          <MetadataSection title="Owner">
            <AddressTag address={asset.onChainOwner.address} />
          </MetadataSection>
        </div>

        {/* Creators */}
        {asset.onChainCreators && asset.onChainCreators.length > 0 && (
          <>
            <Separator />
            <MetadataSection
              title={`Creators (${asset.onChainCreators.length})`}
            >
              <div className="space-y-2 grid sm:grid-cols-2 gap-4">
                {asset.onChainCreators.map((creator) => (
                  <div
                    key={creator.address}
                    className="flex items-center justify-between"
                  >
                    <AddressTag
                      address={creator.address}
                      variant="secondary"
                      share={creator?.share}
                    />
                  </div>
                ))}
              </div>
            </MetadataSection>
          </>
        )}

        {/* Attributes */}
        {asset.attributes && asset.attributes.length > 0 && (
          <>
            <Separator />
            <MetadataSection title={`Attributes (${asset.attributes.length})`}>
              <div className="grid grid-cols-1 gap-2">
                {asset.attributes.map((attribute, index) => (
                  <AttributeItem
                    key={`${attribute.type}-${attribute.value}-${index}`}
                    attribute={attribute}
                  />
                ))}
              </div>
            </MetadataSection>
          </>
        )}

        {/* Children Assets */}
        {childrenAssets && childrenAssets.length > 0 && (
          <>
            <Separator />
            <MetadataSection
              title={`Child Assets (${childrenAssets.length})`}
            >
              <div className="space-y-2 grid sm:grid-cols-2 gap-4">
                {childrenAssets.map((childrenAsset) => (
                  <ChildrenAsset
                    key={childrenAsset.tokenAddress}
                    childrenAsset={childrenAsset}
                    returnKey={returnKey}
                  />
                ))}
              </div>
            </MetadataSection>
          </>
        )}
      </div>
    </ScrollableDialog>
  );
};

export default AssetMetadataDialog;


interface MetadataSectionProps {
  title: string;
  children: React.ReactNode;
}
const MetadataSection: FC<MetadataSectionProps> = ({ title, children }) => (
  <div className="space-y-2">
    <H3 className="text-sm font-semibold">{title}</H3>
    {children}
  </div>
);


interface AddressTagProps {
  address: string;
  variant?: "default" | "secondary" | "outline";
  share?: number;
}
const AddressTag: FC<AddressTagProps> = ({
  address,
  variant = "secondary",
  share,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const openSolscan = () => {
    window.open(SOLANA_BLOCKCHAIN_EXPLORER(address), "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size="sm"
        className="h-7 px-2 text-xs font-mono"
        onClick={openSolscan}
      >
        {truncate(address, 8)}
        {share && (
          <span className="text-xs text-muted-foreground ml-1">{share}%</span>
        )}
        <ExternalLink className="ml-1 h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={copyToClipboard}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};

interface AttributeItemProps {
  attribute: { type: string; value: string };
}
const AttributeItem: FC<AttributeItemProps> = ({ attribute }) => (
  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
    <span className="text-sm font-medium text-muted-foreground">
      {attribute.type}
    </span>
    <span className="text-sm">{attribute.value}</span>
  </div>
);

interface ChildrenAssetProps {
  childrenAsset: ParsedBlockChainAsset;
  returnKey?: string;
}
const ChildrenAsset: FC<ChildrenAssetProps> = ({ childrenAsset, returnKey = "" }) => {
  const newPath =
    BLOCKCHAIN_MEDIA_PATHS[ChainIdsEnum.SOLANA](childrenAsset.tokenAddress) +
    makeReturnQueryParam(returnKey);
  
  return (
    <LinkButton
      href={newPath}
      className="gap-4 h-fit p-2 w-full justify-start"
    >
      <div className="flex-shrink-0 w-12 h-12">
        <AssetThumbnail asset={childrenAsset} size="sm" />
      </div>
      <P className="font-bold line-clamp-1">{childrenAsset.title}</P>
    </LinkButton>
  );
};

