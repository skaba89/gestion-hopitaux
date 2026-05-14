import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
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

  return NextResponse.json({
    status,
    service: 'HealthFlow Guinea',
    version: '1.0.0',
    timestamp: now.toISOString(),
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
    },
    checks,
  }, { status: httpStatus })
}
