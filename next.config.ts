import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tesseract.js locates its worker script relative to its own module path at
  // runtime; bundling it breaks that resolution, so it must run via native
  // Node require instead.
  serverExternalPackages: ["tesseract.js"],
  experimental: {
    serverActions: {
      // Passport scans and client documents can easily exceed the 1MB default.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
