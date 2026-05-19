// ============================================================================
// HealthFlow Guinea - Jest Setup
// Mocks for Prisma, Redis, and other server-side modules
// ============================================================================

// Set test environment variables BEFORE any module imports
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.NEXTAUTH_SECRET = 'test-secret-for-jest'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.ENCRYPTION_KEY = '4c4e433d5907b17b6b0cb6fd976be7b5'
process.env.JWT_SECRET = '6efb6e0dafab4e5d612863ed812534ec'
process.env.DEMO_MODE = 'true'
;(process.env as Record<string, string>).NODE_ENV = 'test'

// ─── Mock Prisma Client ────────────────────────────────────────────────────
const mockPrismaClient = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  $executeRaw: jest.fn().mockResolvedValue(1),

  establishment: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  department: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  user: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  role: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
  },
  permission: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  patient: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  appointment: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  consultation: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  labTestCatalog: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  },
  labRequest: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  medication: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  },
  medicationStock: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
  },
  invoice: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  payment: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
  },
  auditLog: {
    create: jest.fn().mockResolvedValue({}),
    createMany: jest.fn().mockResolvedValue({ count: 0 }),
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  },
  healthKPI: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  },
  epidemiologicalAlert: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  admission: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  emergencyCase: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  vaccination: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
  pregnancyTracking: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  },
  teleconsultation: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  },
  patientAccount: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
  },
  notification: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
  },
}

jest.mock('@/lib/db', () => ({
  db: mockPrismaClient,
}))

// ─── Mock Redis with stateful in-memory store ───────────────────────────────
// Defined inline to avoid circular require

class TestMemoryRedis {
  private store = new Map<string, { value: string; expiresAt?: number }>()
  private hashStore = new Map<string, Map<string, string>>()
  private listStore = new Map<string, string[]>()

  private isExpired(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return true
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return true
    }
    return false
  }

  async get(key: string): Promise<string | null> {
    if (this.isExpired(key)) return null
    return this.store.get(key)?.value ?? null
  }

  async set(key: string, value: string, ...args: unknown[]): Promise<string | null> {
    let exSeconds: number | undefined
    for (let i = 0; i < args.length; i++) {
      if (args[i] === 'EX' && args[i + 1]) exSeconds = Number(args[i + 1])
    }
    this.store.set(key, { value, expiresAt: exSeconds ? Date.now() + exSeconds * 1000 : undefined })
    return 'OK'
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key) || this.hashStore.has(key) || this.listStore.has(key)
    this.store.delete(key)
    this.hashStore.delete(key)
    this.listStore.delete(key)
    return existed ? 1 : 0
  }

  async incr(key: string): Promise<number> {
    const current = parseInt(this.store.get(key)?.value ?? '0')
    const next = current + 1
    this.store.set(key, { value: String(next) })
    return next
  }

  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.store.get(key)
    if (!entry) return 0
    entry.expiresAt = Date.now() + seconds * 1000
    return 1
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key)
    if (!entry) return -2
    if (!entry.expiresAt) return -1
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000)
    return remaining > 0 ? remaining : -2
  }

  async exists(key: string): Promise<number> {
    return !this.isExpired(key) && this.store.has(key) ? 1 : 0
  }

  async hset(key: string, ...args: unknown[]): Promise<number> {
    if (!this.hashStore.has(key)) this.hashStore.set(key, new Map())
    const hash = this.hashStore.get(key)!
    let added = 0
    for (let i = 0; i < args.length; i += 2) {
      const field = String(args[i])
      const value = String(args[i + 1])
      if (!hash.has(field)) added++
      hash.set(field, value)
    }
    return added
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.hashStore.get(key)?.get(field) ?? null
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const hash = this.hashStore.get(key)
    if (!hash) return {}
    return Object.fromEntries(hash.entries())
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    const hash = this.hashStore.get(key)
    if (!hash) return 0
    let deleted = 0
    for (const field of fields) {
      if (hash.delete(field)) deleted++
    }
    return deleted
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    if (!this.listStore.has(key)) this.listStore.set(key, [])
    const list = this.listStore.get(key)!
    list.unshift(...values)
    return list.length
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = this.listStore.get(key) ?? []
    if (stop === -1) return list.slice(start)
    return list.slice(start, stop + 1)
  }

  async ltrim(key: string, start: number, stop: number): Promise<string> {
    const list = this.listStore.get(key)
    if (!list) return 'OK'
    const trimmed = stop === -1 ? list.slice(start) : list.slice(start, stop + 1)
    this.listStore.set(key, trimmed)
    return 'OK'
  }

  async llen(key: string): Promise<number> {
    return this.listStore.get(key)?.length ?? 0
  }

  async ping(): Promise<string> {
    return 'PONG'
  }

  async quit(): Promise<string> {
    return 'OK'
  }

  async connect(): Promise<void> {}

  on(): this {
    return this
  }
}

// Singleton instance used across all tests
const memoryRedis = new TestMemoryRedis()

// RedisOTPStore implementation matching the real one
class MockRedisOTPStore {
  private prefix = 'otp'

  async store(phone: string, otp: string, ttlSeconds = 300): Promise<void> {
    const key = `${this.prefix}:${phone}`
    const data = JSON.stringify({ otp, attempts: 0, createdAt: Date.now() })
    await memoryRedis.set(key, data, 'EX', ttlSeconds)
  }

  async verify(phone: string, otp: string): Promise<{ valid: boolean; attempts: number }> {
    const key = `${this.prefix}:${phone}`
    const stored = await memoryRedis.get(key)
    if (!stored) return { valid: false, attempts: 0 }

    const data = JSON.parse(stored)
    data.attempts = (data.attempts || 0) + 1
    if (data.attempts > 3) {
      await memoryRedis.del(key)
      return { valid: false, attempts: data.attempts }
    }
    if (data.otp === otp) {
      await memoryRedis.del(key)
      return { valid: true, attempts: data.attempts }
    }
    const ttl = await memoryRedis.ttl(key)
    if (ttl > 0) {
      await memoryRedis.set(key, JSON.stringify(data), 'EX', ttl)
    }
    return { valid: false, attempts: data.attempts }
  }

  async getRateLimit(phone: string): Promise<{ count: number; resetIn: number }> {
    const key = `${this.prefix}:ratelimit:${phone}`
    const count = parseInt((await memoryRedis.get(key)) || '0')
    const ttl = await memoryRedis.ttl(key)
    return { count, resetIn: ttl > 0 ? ttl : 0 }
  }

  async incrementRateLimit(phone: string, windowSeconds = 900): Promise<number> {
    const key = `${this.prefix}:ratelimit:${phone}`
    const count = await memoryRedis.incr(key)
    if (count === 1) {
      await memoryRedis.expire(key, windowSeconds)
    }
    return count
  }
}

// RedisRateLimiter implementation matching the real one
class MockRedisRateLimiter {
  private prefix = 'ratelimit'

  async check(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const key = `${this.prefix}:${identifier}`
    const current = parseInt((await memoryRedis.get(key)) || '0')

    if (current >= limit) {
      const ttl = await memoryRedis.ttl(key)
      return { allowed: false, remaining: 0, resetIn: ttl > 0 ? ttl : windowSeconds }
    }

    const newCount = await memoryRedis.incr(key)
    if (newCount === 1) {
      await memoryRedis.expire(key, windowSeconds)
    }

    const ttl = await memoryRedis.ttl(key)
    return {
      allowed: newCount <= limit,
      remaining: Math.max(0, limit - newCount),
      resetIn: ttl > 0 ? ttl : windowSeconds,
    }
  }

  async reset(identifier: string): Promise<void> {
    await memoryRedis.del(`${this.prefix}:${identifier}`)
  }
}

jest.mock('@/lib/redis', () => ({
  getRedis: jest.fn().mockResolvedValue(memoryRedis),
  RedisOTPStore: MockRedisOTPStore,
  RedisRateLimiter: MockRedisRateLimiter,
  RedisAuditBuffer: jest.fn().mockImplementation(() => ({
    push: jest.fn().mockResolvedValue(1),
    flush: jest.fn().mockResolvedValue([]),
    size: jest.fn().mockResolvedValue(0),
  })),
}))

// ─── Mock audit-logger ──────────────────────────────────────────────────────
jest.mock('@/lib/audit-logger', () => ({
  logAccess: jest.fn(),
  logPermissionDenial: jest.fn(),
  logAuthEvent: jest.fn(),
  logCSRFViolation: jest.fn(),
  logRateLimitHit: jest.fn(),
  logDataModification: jest.fn(),
  addAuditEntry: jest.fn(),
  addSimpleAuditEntry: jest.fn(),
  getAuditLogs: jest.fn().mockResolvedValue([]),
  getAuditEntries: jest.fn().mockResolvedValue([]),
  getAuditStats: jest.fn().mockResolvedValue({
    totalEntries: 0, deniedCount: 0, criticalCount: 0,
    csrfViolations: 0, rateLimitHits: 0, loginFailures: 0, recentDenials: [],
  }),
  flushAuditBuffer: jest.fn().mockResolvedValue(0),
  startAuditFlush: jest.fn(),
  stopAuditFlush: jest.fn(),
}))

// ─── Mock security module ──────────────────────────────────────────────────
jest.mock('@/lib/security', () => ({
  rateLimiter: jest.fn().mockResolvedValue({ allowed: true, remaining: 99 }),
  sanitizeInput: jest.fn((s: string) => s),
  validateCSRFToken: jest.fn().mockReturnValue(true),
  generateCSRFToken: jest.fn().mockReturnValue('mock-csrf-token-' + Date.now()),
  hashPassword: jest.fn().mockResolvedValue('$2a$10$mockhash'),
  verifyPassword: jest.fn().mockResolvedValue(true),
  encryptData: jest.fn().mockReturnValue('encrypted-mock'),
  decryptData: jest.fn().mockReturnValue('decrypted-mock'),
}))

// ─── Global exports for test files ──────────────────────────────────────────
export { mockPrismaClient, memoryRedis, MockRedisOTPStore, MockRedisRateLimiter }
