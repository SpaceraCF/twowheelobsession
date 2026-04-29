import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.yamaha-motor.com.au' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
