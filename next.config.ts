import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "dmcicorporation.com",
      "https://infinitech-testing5.online" 
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
