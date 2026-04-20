import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Resume/LinkedIn PDFs can approach a few MB with embedded images.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
