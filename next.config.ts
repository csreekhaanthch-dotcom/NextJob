import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['remotive.com', 'arbeitnow.com'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'pdf-parse': 'commonjs pdf-parse'
        })
      }
    }
    return config
  },
};

export default nextConfig;
