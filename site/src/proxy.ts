import { NextResponse, type NextRequest } from 'next/server'

// Multi-domain setup: yamahapartsaustralia.com.au is served by the same
// Next.js app, but its requests are rewritten to the /parts/* internal
// namespace. Browsers see clean URLs (e.g. yamahapartsaustralia.com.au/)
// because rewrites are server-side. The main twowheelobsession.com.au
// domain passes through untouched.
//
// Required Render config: add yamahapartsaustralia.com.au and
// www.yamahapartsaustralia.com.au as custom domains on the existing
// twowo-site web service. Cloudflare DNS for the parts domain points at
// the Render service.
//
// Note: this file uses Next.js 16's `proxy.ts` convention (the renamed
// `middleware.ts`). The exported function MUST be named `proxy`. See
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
const PARTS_HOSTS = new Set([
  'yamahapartsaustralia.com.au',
  'www.yamahapartsaustralia.com.au',
])

// Routes that serve identical content on both domains (no rewrite). The
// EPC widget is iframed by both sites — same dealer key, same upstream.
// Checkout API endpoints are shared so the parts site can POST to them
// (the parts host's relative `/api/checkout/...` calls would otherwise
// be rewritten to `/parts/api/checkout/...` which doesn't exist).
const SHARED_PREFIXES = ['/oem-widget', '/api/checkout']

export function proxy(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase()
  if (!PARTS_HOSTS.has(host)) return NextResponse.next()

  const path = request.nextUrl.pathname

  if (path.startsWith('/parts')) return NextResponse.next()

  for (const p of SHARED_PREFIXES) {
    if (path === p || path.startsWith(`${p}/`)) return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = `/parts${path}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Run for everything user-facing. Skip Next internals, static assets,
  // and image-optimisation routes — these don't need host-based logic
  // and the matcher exclusion saves a function invocation per request.
  matcher: '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico|css|js|woff|woff2)).*)',
}
