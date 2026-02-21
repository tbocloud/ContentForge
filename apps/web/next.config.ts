import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@contentforge/database",
    "@contentforge/ai-services",
    "@contentforge/shared",
  ],
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
