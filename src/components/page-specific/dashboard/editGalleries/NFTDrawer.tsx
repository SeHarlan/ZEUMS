import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Image as ImageIcon, Video, Box, Code2 } from "lucide-react";
import { TimelineEntry, isBlockchainAssetEntry, isUserAssetEntry } from "@/types/entry";
import { useSearchUserAssets } from "@/hooks/useUserAssets";
import { cn } from "@/utils/ui-utils";
import MediaThumbnail from "@/components/media/MediaThumbnail";
import { getMediaUrl } from "@/utils/media";
import { MediaCategory } from "@/types/media";

interface NFTDrawerProps {
  onAddToGallery: (asset: TimelineEntry) => void;
  className?: string;
}

const NFTDrawer: FC<NFTDrawerProps> = ({ onAddToGallery, className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { filteredAssets, isLoading } = useSearchUserAssets(searchTerm);

  const getMediaIcon = (entry: TimelineEntry) => {
    if (isBlockchainAssetEntry(entry) || isUserAssetEntry(entry)) {
      switch (entry.media.category) {
        case MediaCategory.Video:
          return <Video className="size-4" />;
        case MediaCategory.Vr:
          return <Box className="size-4" />;
        case MediaCategory.Html:
          return <Code2 className="size-4" />;
        default:
          return <ImageIcon className="size-4" />;
      }
    }
    return <ImageIcon className="size-4" />;
  };

  const getEntryTypeBadge = (entry: TimelineEntry) => {
    if (isBlockchainAssetEntry(entry)) {
      return <Badge variant="secondary">NFT</Badge>;
    } else if (isUserAssetEntry(entry)) {
      return <Badge variant="outline">Upload</Badge>;
    }
    return null;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Header */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search by name or collection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredAssets.length} assets found</span>
        </div>
      </div>

      <Separator />

      {/* Assets Grid */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading assets...</div>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="size-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {searchTerm ? "No assets found matching your search" : "No assets available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredAssets.map((asset) => (
              <Card
                key={asset._id.toString()}
                className="group cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onAddToGallery(asset)}
              >
                <CardContent className="p-3 space-y-2">
                  {/* Media Thumbnail */}
                  <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                    {(isBlockchainAssetEntry(asset) || isUserAssetEntry(asset)) && (
                      <>
                        <MediaThumbnail
                          media={asset.media}
                          alt={asset.title || "Asset"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" className="h-6 w-6 p-0 rounded-full">
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Asset Info */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                        {asset.title || "Untitled"}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getMediaIcon(asset)}
                        {getEntryTypeBadge(asset)}
                      </div>
                    </div>
                    
                    {asset.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {asset.description}
                      </p>
                    )}

                    {/* Blockchain Asset Specific Info */}
                    {isBlockchainAssetEntry(asset) && (
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Collection:</span>
                          <span className="line-clamp-1">
                            {asset.attributes?.find(attr => attr.type === "Collection")?.value || "Unknown"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NFTDrawer;