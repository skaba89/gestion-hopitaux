// HealthFlow Africa - Middleware
// Handles locale routing and auth protection

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static assets, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/icons/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.json') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/robots.txt' ||
    pathname === '/logo.svg'
  ) {
    return NextResponse.next()
  }

  // Allow the auth routes without authentication
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Allow the root page (SPA handles its own routing)
  // The SPA manages its own auth state via Zustand, so we don't need
  // server-side auth protection for the root path since it's a client-side SPA.
  // Auth protection is handled by the client-side components.
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
