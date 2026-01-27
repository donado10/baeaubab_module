import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* */
  devIndicators: false,
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 15 * 60 * 1000, // 15 minutes
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },
  experimental: {
    useCache: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  allowedDevOrigins: [
    "srv-baeaubab.dyndns.org", // or http://... depending on your setup
  ],
};

export default nextConfig;
