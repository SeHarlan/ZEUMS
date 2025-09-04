import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "cdn.helius-rpc.com",
      "arweave.net",
      "www.arweave.net",
      "ipfs.io",
    ],
  },
  //allow ngrok-free.app domains for development
  allowedDevOrigins: ["*.ngrok-free.app"],
};

export default nextConfig;
