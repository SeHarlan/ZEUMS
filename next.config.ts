import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.helius-rpc.com',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
      },
      {
        protocol: 'https',
        hostname: 'www.arweave.net',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
    ],
    //TODO: figure out image optimization for nft urls with next js, potential solution below
    // // Disable optimization for images with very long URLs to prevent ENAMETOOLONG errors
    // dangerouslyAllowSVG: true,
    // contentDispositionType: 'attachment',
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  //allow ngrok-free.app domains for development
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app"],
};

export default nextConfig;
