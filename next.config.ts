import type { NextConfig } from "next";


// Deprecated for now
// const deviceSizes = [
//   // Small sizes for grids and thumbnails
//   imageSizing.thumbnail,
//   320, // 640/2
//   384, // 1536/4 + 768/2 (smallest grid item)
//   512, // 1024/2
//   imageSizing.sm, // SM breakpoint

//   // Medium sizes
//   imageSizing.md, // MD breakpoint
//   imageSizing.lg, // LG breakpoint

//   // Large sizes
//   imageSizing.xl, // XL breakpoint
//   imageSizing["2xl"], // 2XL breakpoint

//   // Retina (2x) - only up to reasonable max
//   2048, // 1024 * 2
//   2560, // 1280 * 2
//   3072, // 1536 * 2 (max reasonable size)
// ];

const nextConfig: NextConfig = {

  images: {
    //Deprecated for now
    // loader: "custom",
    // loaderFile: "src/utils/imageLoader.ts",
    // deviceSizes,
    //Deprecated, only used for default next loader
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.helius-rpc.com",
      },
      {
        protocol: "https",
        hostname: "arweave.net",
      },
      {
        protocol: "https",
        hostname: "www.arweave.net",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      {
        protocol: "https",
        hostname: "p1v6uvkvzbjkuo1l.public.blob.vercel-storage.com",
      },
    ],
  },
  //allow ngrok-free.app domains for development
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app"],
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
