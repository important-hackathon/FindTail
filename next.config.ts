import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // This allows images from any host
        pathname: "/**", // This allows images from any path
      },
    ],
  },
};

export default nextConfig;
