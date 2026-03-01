import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Use webpack instead of Turbopack for builds
  // Turbopack doesn't support native modules like pdf-parse
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark pdf-parse as external for server-side
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'pdf-parse': 'commonjs pdf-parse'
        })
      }
    }
    return config
  },
}

export default nextConfig
