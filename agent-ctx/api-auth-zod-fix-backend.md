# Task: Fix 6 API Route Files - Auth & Zod Validation

## Summary
Fixed all 6 API route files by adding `secureApiHandler` authentication and Zod validation, following the pattern from the already-correct `patients/route.ts`.

## Files Modified

### 1. `/src/app/api/appointments/route.ts`
- **GET**: Wrapped with `secureApiHandler` + `requireAuth: true` + audit logging
- **POST**: Wrapped with `secureApiHandler` + `requireAuth: true`, added `appointmentCreateSchema.parse()` for Zod validation with ZodError handling
- **OPTIONS**: Kept intact

### 2. `/src/app/api/appointments/[id]/route.ts`
- **GET**: Wrapped with `secureApiHandler` + `requireAuth: true` + audit
- **PUT**: Wrapped with `secureApiHandler` + `requireAuth: true` + audit, kept existing `appointmentUpdateSchema.parse()`, enhanced audit entries with user context
- **DELETE**: Wrapped with `secureApiHandler` + `requireAuth: true` + audit, enhanced audit entries with user context
- **OPTIONS**: Added (was missing)

### 3. `/src/app/api/establishments/route.ts`
- **GET**: Wrapped with `secureApiHandler` + `requireAuth: true` + audit (including stats/map-data sub-routes)
- **POST**: Wrapped with `secureApiHandler` + `requireAuth: true` + `permission: { resource: 'admin', action: 'write' }` + `establishmentCreateSchema.parse()`
- **PUT**: Wrapped with `secureApiHandler` + `requireAuth: true` + `permission: { resource: 'admin', action: 'write' }` + `establishmentUpdateSchema.parse()`
- **DELETE**: Wrapped with `secureApiHandler` + `requireAuth: true` + `permission: { resource: 'admin', action: 'write' }` (admin-only delete)
- **OPTIONS**: Kept intact

### 4. `/src/app/api/alerts/route.ts`
- **GET**: Wrapped with `secureApiHandler` + `requireAuth: true` + audit
- **POST**: Wrapped with `secureApiHandler` + `requireAuth: true` + audit, created `alertCreateInputSchema` (omits `alertCode` since auto-generated, transforms `measuresTaken` from array to JSON string) derived from `epidemiologicalAlertCreateSchema`
- **OPTIONS**: Kept intact

### 5. `/src/app/api/teleconsultation/route.ts`
- **GET**: Wrapped with `secureApiHandler` + `requireAuth: true` + audit
- **POST**: Wrapped with `secureApiHandler` + `requireAuth: true` + audit, created `teleconsultationInputSchema` extending `teleconsultationCreateSchema` with `followUpNeeded` and `followUpDate`
- **OPTIONS**: Kept intact

### 6. `/src/app/api/patient-auth/me/route.ts`
- **GET**: Kept existing JWT auth (no changes needed — this is a patient-facing route with its own jose JWT verification)
- **PUT**: Added `patientProfileUpdateSchema` (extends `patientUpdateSchema` with `preferredLanguage` and `notificationPrefs` validated by `notificationPrefsSchema`), replaced raw body field access with Zod-validated data, added ZodError handling
- **OPTIONS**: Added (was missing)

## Validation Schemas Used
| Route | Schema | Source |
|-------|--------|--------|
| Appointments POST | `appointmentCreateSchema` | `@/lib/validations/appointment` |
| Appointments [id] PUT | `appointmentUpdateSchema` | `@/lib/validations/appointment` |
| Establishments POST | `establishmentCreateSchema` | `@/lib/validations/establishment` |
| Establishments PUT | `establishmentUpdateSchema` | `@/lib/validations/establishment` |
| Alerts POST | `alertCreateInputSchema` | Derived from `@/lib/validations/health` |
| Teleconsultation POST | `teleconsultationInputSchema` | Derived from `@/lib/validations/telemedicine` |
| Patient-auth PUT | `patientProfileUpdateSchema` | Derived from `@/lib/validations/patient` |

## Verification
- TypeScript compilation: **0 errors**
- ESLint: No new errors introduced (all pre-existing)
