import { IMAGE_PROXY_ROUTE } from "@/constants/serverRoutes";

//for global cache busting
const VERSION = "1";

export default function resizeLoader({
  src,
  width,
  quality = 70,
}: {
  src: string;
  width: number;
  quality?: number;  
}) {
  return `${IMAGE_PROXY_ROUTE}?src=${src}&w=${width}&q=${quality}&v=${VERSION}`;
};
