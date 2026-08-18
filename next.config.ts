import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These load worker scripts / WASM binaries relative to their own module
  // path at runtime; bundling breaks that resolution, so they must run via
  // native Node require instead.
  serverExternalPackages: ["tesseract.js", "heic-convert", "heic-decode", "libheif-js"],
  experimental: {
    serverActions: {
      // Passport scans and client documents can easily exceed the 1MB default.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
