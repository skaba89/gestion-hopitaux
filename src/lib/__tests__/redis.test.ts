// ============================================================================
// HealthFlow Guinea - Redis Module Tests
// Tests: MemoryRedis fallback, RedisOTPStore, RedisRateLimiter
// ============================================================================

// The redis module is mocked in setup.ts, so we test the mock behavior
// which mirrors the real implementation

describe('RedisOTPStore', () => {
  let RedisOTPStore: any
  let otpStore: any

  beforeEach(async () => {
    jest.clearAllMocks()
    const redis = await import('@/lib/redis')
    RedisOTPStore = redis.RedisOTPStore
    otpStore = new RedisOTPStore()
  })

  it('should store and verify an OTP', async () => {
    await otpStore.store('22462000000', '123456', 300)
    const result = await otpStore.verify('22462000000', '123456')
    expect(result.valid).toBe(true)
  })

  it('should reject wrong OTP', async () => {
    await otpStore.store('22462000001', '123456', 300)
    const result = await otpStore.verify('22462000001', '654321')
    expect(result.valid).toBe(false)
  })

  it('should reject OTP for non-existent phone', async () => {
    const result = await otpStore.verify('22469999999', '123456')
    expect(result.valid).toBe(false)
    expect(result.attempts).toBe(0)
  })

  it('should delete OTP after successful verification (single-use)', async () => {
    await otpStore.store('22462000002', '123456', 300)
    const result1 = await otpStore.verify('22462000002', '123456')
    expect(result1.valid).toBe(true)

    // Second attempt should fail (OTP deleted)
    const result2 = await otpStore.verify('22462000002', '123456')
    expect(result2.valid).toBe(false)
  })

  it('should track failed attempts', async () => {
    await otpStore.store('22462000003', '123456', 300)

    const result1 = await otpStore.verify('22462000003', '000000')
    expect(result1.valid).toBe(false)
    expect(result1.attempts).toBe(1)

    const result2 = await otpStore.verify('22462000003', '000000')
    expect(result2.valid).toBe(false)
    expect(result2.attempts).toBe(2)
  })

  it('should lock after 3 failed attempts', async () => {
    await otpStore.store('22462000004', '123456', 300)

    // 3 failed attempts
    await otpStore.verify('22462000004', '000000')
    await otpStore.verify('22462000004', '000000')
    await otpStore.verify('22462000004', '000000')

    // 4th attempt should be locked
    const result = await otpStore.verify('22462000004', '123456')
    expect(result.valid).toBe(false)
    expect(result.attempts).toBeGreaterThan(3)
  })

  it('should rate limit OTP requests', async () => {
    // Rate limit: increment on each request
    const count1 = await otpStore.incrementRateLimit('22462000005', 900)
    expect(count1).toBe(1)

    const count2 = await otpStore.incrementRateLimit('22462000005', 900)
    expect(count2).toBe(2)

    // Get rate limit info
    const rateInfo = await otpStore.getRateLimit('22462000005')
    expect(rateInfo.count).toBe(2)
  })
})

describe('RedisRateLimiter', () => {
  let RedisRateLimiter: any
  let rateLimiter: any

  beforeEach(async () => {
    jest.clearAllMocks()
    const redis = await import('@/lib/redis')
    RedisRateLimiter = redis.RedisRateLimiter
    rateLimiter = new RedisRateLimiter()
  })

  it('should allow requests within limit', async () => {
    const result = await rateLimiter.check('test-key', 10, 60)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
  })

  it('should block requests exceeding limit', async () => {
    // Use up the limit
    for (let i = 0; i < 10; i++) {
      await rateLimiter.check('limited-key', 10, 60)
    }
    // 11th should be blocked
    const result = await rateLimiter.check('limited-key', 10, 60)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should reset rate limit', async () => {
    await rateLimiter.check('reset-key', 5, 60)
    await rateLimiter.reset('reset-key')
    // Should be able to make requests again
    const result = await rateLimiter.check('reset-key', 5, 60)
    expect(result.allowed).toBe(true)
  })
})
