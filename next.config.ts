import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sql.js'],
  allowedDevOrigins: ['*.space.chatglm.site', '*.space.z.ai'],
  reactStrictMode: false,
};

export default nextConfig;
