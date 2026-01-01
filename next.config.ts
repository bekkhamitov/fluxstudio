import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'delivery-eu.bfl.ai',
      },
      {
        protocol: 'https',
        hostname: 'delivery-us.bfl.ai',
      },
      {
        protocol: 'https',
        hostname: 'delivery.bfl.ai',
      },
    ],
  },
};

export default nextConfig;
