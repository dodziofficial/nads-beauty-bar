import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.56.1', 'localhost'],
  images: {
    domains: [
      'jpgczzfmyginfmxqgtem.supabase.co'
    ],
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