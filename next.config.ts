import { LG_BREAKPOINT, MAX_SIZE_DIVISOR, MD_BREAKPOINT, SM_BREAKPOINT, TWO_XL_BREAKPOINT, XL_BREAKPOINT, XS_BREAKPOINT } from "@/constants/breakpoints";
import type { NextConfig } from "next";
const getSizeMultiples = (breakpoint: number) => {
  //divisions account for smaller images in grids ( up to 4 divisions), multiples account for devices with higher pixel density
  return [
    Math.round(breakpoint / MAX_SIZE_DIVISOR),
    Math.round(breakpoint / 3),
    Math.round(breakpoint / 2),
    breakpoint,
    breakpoint * 2,
    breakpoint * 3,
  ];
};
const allSizes = [
  ...getSizeMultiples(XS_BREAKPOINT),
  ...getSizeMultiples(SM_BREAKPOINT),
  ...getSizeMultiples(MD_BREAKPOINT),
  ...getSizeMultiples(LG_BREAKPOINT),
  ...getSizeMultiples(XL_BREAKPOINT),
  ...getSizeMultiples(TWO_XL_BREAKPOINT),
];

let uniqueSizes = [...new Set(allSizes)]
uniqueSizes.sort((a, b) => a - b);
uniqueSizes = uniqueSizes.slice(uniqueSizes.length - 25); //maximum of 25, remove the smallest sizes


const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "src/utils/imageLoader.ts",
    deviceSizes: uniqueSizes,
    //Deprecated, only used for default next loader
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "cdn.helius-rpc.com",
    //   },
    //   {
    //     protocol: "https",
    //     hostname: "arweave.net",
    //   },
    //   {
    //     protocol: "https",
    //     hostname: "www.arweave.net",
    //   },
    //   {
    //     protocol: "https",
    //     hostname: "ipfs.io",
    //   },
    // ],
  },
  //allow ngrok-free.app domains for development
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app"],
  eslint: {
    ignoreDuringBuilds: false,
  },
  outputFileTracingIncludes: {
    "/api/image": ["./node_modules/sharp/**/*"],
  },
};

export default nextConfig;
