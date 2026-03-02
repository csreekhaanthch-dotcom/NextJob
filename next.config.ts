import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['remotive.com', 'arbeitnow.com'],
  },
};

export default nextConfig;
