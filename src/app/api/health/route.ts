import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Health check endpoint — restricted access
// In production: requires internal IP or admin auth
// In development: accessible for debugging
export async function GET(request: NextRequest) {
  // SECURITY: Restrict health endpoint access
  const isDev = process.env.NODE_ENV === 'development'
  const clientIp = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   '127.0.0.1'

  if (!isDev) {
    // In production, only allow internal IPs or authenticated admin users
    const isInternalIp = clientIp === '127.0.0.1' || clientIp === '::1' ||
                         clientIp.startsWith('10.') ||
                         clientIp.startsWith('172.16.') ||
                         clientIp.startsWith('192.168.')

    // Check for admin session cookie
    const hasSession = request.cookies.get('next-auth.session-token')?.value ||
                       request.cookies.get('__Secure-next-auth.session-token')?.value

    if (!isInternalIp && !hasSession) {
      // Return minimal health info for external requests
      return NextResponse.json({
        status: 'healthy',
        service: 'HealthFlow Guinea',
        timestamp: new Date().toISOString(),
      })
    }
  }

  const now = new Date()
  const uptime = process.uptime()
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {}

  // Check PostgreSQL
  try {
    const start = Date.now()
    await db.$queryRaw`SELECT 1`
    checks.postgresql = {
      status: 'healthy',
      latency: Date.now() - start,
    }
  } catch (error) {
    checks.postgresql = {
      status: 'unhealthy',
      error: (error as Error).message,
    }
  }

  // Check Redis
  try {
    const { getRedis } = await import('@/lib/redis')
    const start = Date.now()
    const redis = await getRedis()
    await redis.ping()
    checks.redis = {
      status: 'healthy',
      latency: Date.now() - start,
    }
  } catch (error) {
    checks.redis = {
      status: 'degraded',
      error: (error as Error).message,
    }
  }

  // Overall status
  const allHealthy = Object.values(checks).every(c => c.status === 'healthy')
  const anyUnhealthy = Object.values(checks).some(c => c.status === 'unhealthy')

  const status = anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded'
  const httpStatus = anyUnhealthy ? 503 : 200

  // SECURITY: Only expose detailed info to authenticated/internal requests
  const isDetailed = isDev || request.headers.get('x-internal') === 'true'

  return NextResponse.json({
    status,
    service: 'HealthFlow Guinea',
    version: '1.0.0',
    timestamp: now.toISOString(),
    ...(isDetailed ? {
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      },
      checks,
    } : {
      checks: Object.fromEntries(
        Object.entries(checks).map(([key, val]) => [key, { status: val.status }])
      ),
    }),
  }, { status: httpStatus })
}
