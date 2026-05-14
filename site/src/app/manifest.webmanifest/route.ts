// PWA manifest. Powers the "Add to Home Screen" prompt on iOS + Android
// for the staff admin inbox. Once installed, the admin runs full-screen
// with the TWO icon on the home screen and supports Web Push.
//
// Scope is `/admin/` so installing only takes over the admin area —
// the public-facing pages stay regular web pages.

export const dynamic = 'force-static'

export function GET() {
  const manifest = {
    name: 'Two Wheel Obsession — SMS Inbox',
    short_name: 'TWO Inbox',
    description: 'Staff inbox for Two Wheel Obsession customer SMS conversations.',
    start_url: '/admin/collections/conversations',
    scope: '/admin/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#dc2626',
    icons: [
      {
        src: '/two-favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/two-favicon-270.png',
        sizes: '270x270',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/two-logo-full.png',
        sizes: '600x600',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'content-type': 'application/manifest+json',
      'cache-control': 'public, max-age=3600',
    },
  })
}
