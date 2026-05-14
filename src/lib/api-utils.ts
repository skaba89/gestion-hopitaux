// HealthFlow Guinea - API Utilities
// SEC-02 FIX: Restricted CORS to allowed origins only

import { NextResponse } from 'next/server'

/**
 * Get allowed CORS origins from environment
 * Defaults to localhost for development
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS || ''
  const origins = envOrigins.split(',').map(o => o.trim()).filter(Boolean)
  
  // Default development origins
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000')
    origins.push('http://localhost:81')
    origins.push('http://127.0.0.1:3000')
  }
  
  // Always allow the configured NEXTAUTH_URL
  if (process.env.NEXTAUTH_URL) {
    origins.push(process.env.NEXTAUTH_URL)
  }
  
  return [...new Set(origins)] // Deduplicate
}

/**
 * Generate CORS headers based on request origin
 * SEC-02 FIX: No more wildcard '*' - only allowed origins
 */
export function corsHeaders(requestOrigin?: string) {
  const allowedOrigins = getAllowedOrigins()
  
  // Check if request origin is allowed
  const origin = requestOrigin && allowedOrigins.includes(requestOrigin) 
    ? requestOrigin 
    : allowedOrigins[0] || ''
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin', // Important for caching with dynamic origin
  }
}

export function successResponse(data: unknown, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) },
    { status }
  )
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    { success: false, error },
    { status }
  )
}

export function paginatedResponse(
  data: unknown[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status: 200 }
  )
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip, take: limit }
}
