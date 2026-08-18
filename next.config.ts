import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Passport scans and client documents can easily exceed the 1MB default.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
