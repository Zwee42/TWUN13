import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    // Enable WebSocket support
    esmExternals: false,
  },
  // webpack: (config: any, { isServer }: { isServer: boolean }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       net: false,
  //       tls: false,
  //     };
  //   }
  //   return config;
  // },
};

export default nextConfig;
