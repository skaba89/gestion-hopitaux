// HealthFlow Guinea - CSRF Token Endpoint
// SEC-06 FIX: Provides CSRF tokens using double-submit cookie pattern
// GET /api/auth/csrf - Get a new CSRF token (set in cookie + returned in response)

import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/security'

export async function GET(request: NextRequest) {
  const token = generateCSRFToken()
  
  const response = NextResponse.json({
    csrfToken: token,
    message: 'Include this token in X-CSRF-Token header for mutating requests',
  })
  
  // Set CSRF token in httpOnly cookie (double-submit pattern)
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
    path: '/',
  })
  
  return response
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 204 })
}
