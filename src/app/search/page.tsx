"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/general/PageContainer";
import GlitchFeedback from "@/components/general/GlitchFeedback";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { SUBTITLE_COPY } from "@/textCopy/mainCopy";
import SearchAssetDialog from "@/components/assets/SearchAssetDialog";
import { NavBarActions } from "@/context/NavBarActionsProvider";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import BasicNavDialog from "@/components/navigation/BasicNavDialog";

export default function SearchPage() {
  const [searchAssetOpen, setSearchAssetOpen] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchAssetOpen(true);
    }, 1111);
    return () => clearTimeout(timer);
  }, []);
  return (
    <PageContainer maxWidth="full" noPadding>
      <NavBarActions>
        <Button
          variant={"outline"}
          size="icon"
          onClick={() => setSearchAssetOpen((prev) => !prev)}
          className="size-10"
        >
          <SearchIcon className="size-5" />
        </Button>
      </NavBarActions>
      <GlitchFeedback title={TITLE_COPY} subtitle={SUBTITLE_COPY} />
      <BasicNavDialog />
      <SearchAssetDialog
        open={searchAssetOpen}
        onOpenChange={setSearchAssetOpen}
      />
    </PageContainer>
  );
}
