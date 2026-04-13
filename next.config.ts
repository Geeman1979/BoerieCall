import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sql.js'],
  allowedDevOrigins: [
    '*.space.z.ai',
    '*.space.chatglm.site',
    'localhost',
  ],
  // Disable strict mode to prevent double-rendering in dev
  reactStrictMode: false,
};

export default nextConfig;
