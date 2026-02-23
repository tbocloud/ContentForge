import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@contentforge/database",
    "@contentforge/ai-services",
    "@contentforge/shared",
  ],
  serverExternalPackages: ["@prisma/client", "prisma"],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
