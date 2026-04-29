import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.yamaha-motor.com.au' },
      // Yamaha API sometimes returns URLs with explicit :443 port — match that too.
      { protocol: 'https', hostname: 'www.yamaha-motor.com.au', port: '443' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
