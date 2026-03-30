import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable strict mode in development to prevent double socket connections
  reactStrictMode: false,
  // For better development experience with sockets
  experimental: {
    // Add any experimental features here if needed
  },
};

export default nextConfig;
