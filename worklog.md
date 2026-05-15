---
Task ID: 1
Agent: Main Agent
Task: End-to-end audit and implement top 10 immediate actions for HealthFlow Guinea

Work Log:
- Completed full codebase audit identifying 10 critical issues
- Implemented all 10 actions in sequence

Stage Summary:
- Action 1: Fixed .env DATABASE_URL from SQLite to PostgreSQL, added all missing env vars
- Action 2: Removed JWT tokens from localStorage in auth-store.ts and patient-auth-store.ts (partialize excludes token)
- Action 3: Added secureApiHandler with auth/RBAC to pharmacy, patients/[id], users, and health API routes
- Action 4: Added Zod validation (invoiceCreateSchema, stockEntryCreateSchema, patientUpdateSchema) to billing, pharmacy, patients routes
- Action 5: Migrated rate limiting from in-memory Map to Redis-backed (RedisRateLimiter) in middleware.ts, security.ts, api-middleware.ts
- Action 6: Removed fake guest user creation in auth.ts phone-otp provider - now throws "No account found"
- Action 7: Replaced Math.random() with generateSecureToken() in 6 API route files (teleconsultation, payments, alerts, laboratory, patient-auth/register, hospitalizations)
- Action 8: Completed i18n translations for 3 Guinean languages - added 315 keys to Pulaar (ff), 271 to Maninka (msk), 315 to Soussou (sus)
- Action 9: Added 11 module-specific error boundaries in (dashboard) directory
- Action 10: Enhanced partialize in data-store.ts and hospital-store.ts to exclude PHI/verificationCodes/delegations/auditLog from localStorage

Additional fixes:
- Fixed constantTimeEqual in security.ts to be truly constant-time (no early length return)
- Restricted /api/health endpoint - external requests only get minimal info
- Added RBAC permission checks (billing:create, patient:update, admin:read, admin:create)
- Build verified: `next build` succeeds
