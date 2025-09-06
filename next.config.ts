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
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app"],
  // Enhanced mobile OAuth support
  experimental: {
    // Enable better mobile OAuth handling
    serverComponentsExternalPackages: [],
  },
  // Ensure proper headers for OAuth
  async headers() {
    return [
      {
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Override any problematic CSP headers
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
