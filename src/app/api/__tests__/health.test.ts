import { GET } from '@/app/api/health/route'
import { db } from '@/lib/db'

// ============================================================================
// HealthFlow Guinea - Health Check API Route Tests
// ============================================================================

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return healthy status when all services are up', async () => {
    // Mock healthy PostgreSQL
    ;(db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.service).toBe('HealthFlow Guinea')
    expect(data.version).toBe('1.0.0')
    expect(data.checks.postgresql.status).toBe('healthy')
    expect(data.checks.postgresql.latency).toBeDefined()
    expect(data.checks.redis.status).toBe('healthy')
    expect(data.checks.redis.latency).toBeDefined()
    expect(data.timestamp).toBeDefined()
    expect(data.uptime).toBeDefined()
    expect(data.environment).toBeDefined()
    expect(data.memory).toBeDefined()
    expect(data.memory.used).toBeDefined()
    expect(data.memory.total).toBeDefined()
    expect(data.memory.rss).toBeDefined()
  })

  it('should return 503 when PostgreSQL is unhealthy', async () => {
    // Mock unhealthy PostgreSQL
    ;(db.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection refused'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.postgresql.status).toBe('unhealthy')
    expect(data.checks.postgresql.error).toBe('Connection refused')
  })

  it('should return degraded status when PostgreSQL is healthy but Redis is not', async () => {
    // Mock healthy PostgreSQL
    ;(db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    // The Redis mock in setup.ts will return healthy by default
    // We need to override the getRedis mock for this test
    const { getRedis } = require('@/lib/redis')
    ;(getRedis as jest.Mock).mockResolvedValueOnce({
      ping: jest.fn().mockRejectedValue(new Error('Redis down')),
    })

    const response = await GET()
    const data = await response.json()

    // Since PostgreSQL is healthy and Redis is degraded, status should be degraded
    expect(response.status).toBe(200)
    expect(data.status).toBe('degraded')
    expect(data.checks.postgresql.status).toBe('healthy')
    expect(data.checks.redis.status).toBe('degraded')
    expect(data.checks.redis.error).toBeDefined()
  })

  it('should include memory usage information', async () => {
    ;(db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const response = await GET()
    const data = await response.json()

    expect(data.memory).toHaveProperty('used')
    expect(data.memory).toHaveProperty('total')
    expect(data.memory).toHaveProperty('rss')
    // Memory values should end with 'MB'
    expect(data.memory.used).toMatch(/MB$/)
  })

  it('should include uptime in hours, minutes, seconds format', async () => {
    ;(db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const response = await GET()
    const data = await response.json()

    expect(data.uptime).toMatch(/\d+h \d+m \d+s/)
  })

  it('should include current environment', async () => {
    ;(db.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }])

    const response = await GET()
    const data = await response.json()

    expect(data.environment).toBeDefined()
    expect(typeof data.environment).toBe('string')
  })
})
