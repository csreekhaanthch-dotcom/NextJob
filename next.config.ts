import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Disable Turbopack for build (use webpack instead for better compatibility)
  // Turbopack has issues with native modules like pdf-parse
  
  experimental: {
    // Mark pdf-parse as server external package
    serverExternalPackages: ['pdf-parse'],
  },
  
  webpack: (config, { isServer }) => {
    // Handle pdf-parse for server-side
    if (isServer) {
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push('pdf-parse')
      }
    }
    return config
  },
}

export default nextConfig
