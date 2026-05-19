/**
 * HealthFlow Guinea - Redis Client
 * Used for: OTP store, rate limiting, session caching, audit log buffer
 * SERVER-ONLY: This module must never be imported on the client side
 */

// Runtime guard: prevent client-side execution
if (typeof window !== 'undefined') {
  throw new Error('[Redis] This module must only be used on the server side')
}

interface RedisCommand {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ...args: unknown[]): Promise<string | null>
  del(key: string): Promise<number>
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
  ttl(key: string): Promise<number>
  exists(key: string): Promise<number>
  hset(key: string, ...args: unknown[]): Promise<number>
  hget(key: string, field: string): Promise<string | null>
  hgetall(key: string): Promise<Record<string, string>>
  hdel(key: string, ...fields: string[]): Promise<number>
  lpush(key: string, ...values: string[]): Promise<number>
  lrange(key: string, start: number, stop: number): Promise<string[]>
  ltrim(key: string, start: number, stop: number): Promise<string>
  llen(key: string): Promise<number>
  ping(): Promise<string>
  quit(): Promise<string>
}

// In-memory fallback when Redis is unavailable
class MemoryRedis implements RedisCommand {
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
      if (args[i] === 'EX' && args[i + 1]) {
        exSeconds = Number(args[i + 1])
      }
    }
    this.store.set(key, {
      value,
      expiresAt: exSeconds ? Date.now() + exSeconds * 1000 : undefined,
    })
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
}

// Redis client singleton
let redisClient: RedisCommand | null = null
let redisConnected = false

export async function getRedis(): Promise<RedisCommand> {
  if (redisClient && redisConnected) return redisClient

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  try {
    // Dynamic import of ioredis (won't be bundled client-side)
    const Redis = (await import('ioredis')).default
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null // Stop retrying
        return Math.min(times * 200, 2000)
      },
      lazyConnect: true,
      connectTimeout: 5000,
      enableReadyCheck: true,
    })

    // FIX: Explicitly connect before pinging to avoid first-connect parse errors
    await client.connect()
    await client.ping()
    redisClient = client as unknown as RedisCommand
    redisConnected = true

    client.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err.message)
      redisConnected = false
    })

    client.on('close', () => {
      console.warn('[Redis] Connection closed')
      redisConnected = false
    })

    console.log('[Redis] Connected to', redisUrl.replace(/\/\/.*@/, '//***@'))
    return redisClient
  } catch (error) {
    console.warn('[Redis] Failed to connect, using in-memory fallback:', (error as Error).message)
    redisClient = new MemoryRedis()
    redisConnected = false
    return redisClient
  }
}

/**
 * Redis-backed OTP Store
 * Replaces in-memory Map for production multi-instance support
 */
export class RedisOTPStore {
  private prefix = 'otp'

  async store(phone: string, otp: string, ttlSeconds = 300): Promise<void> {
    const redis = await getRedis()
    const key = `${this.prefix}:${phone}`
    const data = JSON.stringify({
      otp,
      attempts: 0,
      createdAt: Date.now(),
    })
    await redis.set(key, data, 'EX', ttlSeconds)
  }

  async verify(phone: string, otp: string): Promise<{ valid: boolean; attempts: number }> {
    const redis = await getRedis()
    const key = `${this.prefix}:${phone}`
    const stored = await redis.get(key)

    if (!stored) {
      return { valid: false, attempts: 0 }
    }

    const data = JSON.parse(stored)
    data.attempts = (data.attempts || 0) + 1

    // Max 3 attempts
    if (data.attempts > 3) {
      await redis.del(key)
      return { valid: false, attempts: data.attempts }
    }

    if (data.otp === otp) {
      await redis.del(key)
      return { valid: true, attempts: data.attempts }
    }

    // Update attempts count
    const ttl = await redis.ttl(key)
    if (ttl > 0) {
      await redis.set(key, JSON.stringify(data), 'EX', ttl)
    }

    return { valid: false, attempts: data.attempts }
  }

  async getRateLimit(phone: string): Promise<{ count: number; resetIn: number }> {
    const redis = await getRedis()
    const key = `${this.prefix}:ratelimit:${phone}`
    const count = parseInt((await redis.get(key)) || '0')
    const ttl = await redis.ttl(key)
    return { count, resetIn: ttl > 0 ? ttl : 0 }
  }

  async incrementRateLimit(phone: string, windowSeconds = 900): Promise<number> {
    const redis = await getRedis()
    const key = `${this.prefix}:ratelimit:${phone}`
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, windowSeconds)
    }
    return count
  }
}

/**
 * Redis-backed Rate Limiter
 * Replaces in-memory Map for production multi-instance support
 */
export class RedisRateLimiter {
  private prefix = 'ratelimit'

  async check(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const redis = await getRedis()
    const key = `${this.prefix}:${identifier}`
    const current = parseInt((await redis.get(key)) || '0')

    if (current >= limit) {
      const ttl = await redis.ttl(key)
      return {
        allowed: false,
        remaining: 0,
        resetIn: ttl > 0 ? ttl : windowSeconds,
      }
    }

    const newCount = await redis.incr(key)
    if (newCount === 1) {
      await redis.expire(key, windowSeconds)
    }

    const ttl = await redis.ttl(key)
    return {
      allowed: newCount <= limit,
      remaining: Math.max(0, limit - newCount),
      resetIn: ttl > 0 ? ttl : windowSeconds,
    }
  }

  async reset(identifier: string): Promise<void> {
    const redis = await getRedis()
    await redis.del(`${this.prefix}:${identifier}`)
  }
}

/**
 * Redis-backed Audit Log Buffer
 * Buffers audit logs in Redis before batch-writing to PostgreSQL
 */
export class RedisAuditBuffer {
  private prefix = 'audit:buffer'

  async push(entry: string): Promise<number> {
    const redis = await getRedis()
    const key = this.prefix
    const len = await redis.lpush(key, entry)
    // Keep only last 10000 entries in buffer
    if (len > 10000) {
      await redis.ltrim(key, 0, 9999)
    }
    return len
  }

  async flush(count = 100): Promise<string[]> {
    const redis = await getRedis()
    const entries = await redis.lrange(this.prefix, 0, count - 1)
    if (entries.length > 0) {
      // Remove flushed entries
      await redis.ltrim(this.prefix, entries.length, -1)
    }
    return entries
  }

  async size(): Promise<number> {
    const redis = await getRedis()
    return redis.llen(this.prefix)
  }
}
