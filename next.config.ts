import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sql.js'],
  reactStrictMode: false,
};

export default nextConfig;
