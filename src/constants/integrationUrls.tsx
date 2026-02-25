import { ExchangeIcon, MallowIcon } from "@/components/icons/Social";
import { Integration } from "@/types/entry";

export const MALLOW_ARTWORK_URL = (tokenAddress: string) => `https://www.mallow.art/artwork/${tokenAddress}`;
export const EXCHANGE_ARTWORK_URL = (tokenAddress: string) => `https://exchange.art/single/${tokenAddress}`;


export const INTEGRATION_CONFIG: Record<Integration["type"], { getUrl: (addr: string) => string; label: string; icon: React.ReactNode }> = {
  mallow: { getUrl: MALLOW_ARTWORK_URL, label: "View on Mallow", icon: <MallowIcon className="size-6"/> },
  exchange: { getUrl: EXCHANGE_ARTWORK_URL, label: "View on Exchange", icon: <ExchangeIcon /> },
};