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
  // Multi-root setup: route groups (frontend) and (payload) each have
  // their own root layout, so there's no single layout to compose a
  // 404 from. `globalNotFound` lets us define one root-level 404 that
  // returns a real 404 status code on unmatched URLs (otherwise Next.js
  // composes via not-found.tsx and the response is 200, hurting SEO).
  // See: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md
  experimental: {
    globalNotFound: true,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
