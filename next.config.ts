import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // ← This bypasses TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ['192.168.56.1', 'localhost'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jpgczzfmyginfmxqgtem.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig