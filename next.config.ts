import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sql.js'],
  allowedDevOrigins: ['*.space.z.ai'],
};

export default nextConfig;
