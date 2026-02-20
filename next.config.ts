/**
 * next.config.ts
 *
 * Next.js configuration file. Enables the React compiler and configures
 * remote image domains for next/image. Add any domains that host your
 * product images to the remotePatterns array below.
 */

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        // Unsplash - used for hero banner and placeholder images.
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Allow all HTTPS image sources. In production, restrict this
        // to your actual CDN or image hosting domain for security.
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
