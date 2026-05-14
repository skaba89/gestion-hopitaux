# Task 7-8: Wire Delegations/Transfers + Apply RLS in API Routes with Hospital Scoping

## Agent: Main Agent
## Date: 2026-03-04

## Work Completed

### Part A: Wired Delegation and Transfer System

#### Step 1: Updated hospital-model.ts
- Extended `ServiceDelegation` interface with new fields:
  - `expiresAt` (ISO timestamp for auto-expiration)
  - `status` expanded to include `'En attente' | 'Approuvée'` (two-step approval)
  - `isEmergency` (boolean for emergency takeover)
  - `approvedByUserId`, `approvedByUserName`, `approvedAt` (approval tracking)
- Created new `DelegationAuditEntry` interface for audit trail

#### Step 2: Updated hospital-store.ts
- **addDelegation()**: Added validation — checks delegatedTo !== delegatedBy, verifies hospital/service existence, creates audit entry, returns `string | null`
- **approveDelegation(id, approverId, approverName)**: Two-step approval — only 'En attente' delegations can be approved, tracks who approved and when
- **revokeDelegation(id, revokedByUserId?, revokedByUserName?)**: Added optional audit parameters, logs revocation with user info
- **emergencyTakeover(serviceId, managerId, managerName, reason)**: Creates emergency delegation with `isEmergency: true`, 24h expiry, immediately Active, logged in audit trail
- **getActiveDelegationsForService(serviceId)**: Returns active delegations for a specific service
- **getActiveDelegationsForHospital(hospitalId)**: Returns all active delegations in a hospital
- **getActiveDelegations()**: Enhanced with auto-expiration — checks `expiresAt` vs `Date.now()`, automatically marks expired delegations, returns only Active/Approuvée/En attente
- **addTransfer()**: Added validation — fromServiceId !== toServiceId, creates audit entry
- **updateTransferStatus()**: Added validation of status transitions (En attente → Accepté/Refusé/Annulé, Accepté → Annulé), returns boolean
- Added `auditLog` to store state and all mutations

#### Step 3: Updated multi-hospital-dashboard.tsx
- Added `useToast` import for user feedback
- **ServiceDashboard**:
  - Added state for transfer dialog: `transferPatientName`, `transferToServiceId`, `transferReason`, `transferPriority`
  - Added state for delegation dialog: `delegatedToName`, `delegationReason`, `delegationDuration`
  - Wired Transfer dialog: onChange handlers on all inputs, Select components with value bindings, confirm button calls `addTransfer()` with validation, shows toast on success/error, resets form on close
  - Wired Delegation dialog: onChange handlers, Select with duration options (1h/4h/1j/1s), calculates expiry based on duration, confirm button calls `addDelegation()`, shows toast feedback
- **CrossServiceManager**:
  - Wired "Prendre en main" button: Opens inline emergency takeover form with reason input
  - Emergency takeover calls `emergencyTakeover()` with hospital director info
  - Wired "Révoquer" button: Calls `revokeDelegation()` with director info, shows toast
  - Enhanced transfers tab: Shows real transfer data from store with status badges and priority

### Part B: Applied RLS in API Routes with Hospital Scoping

#### Step 1: Updated /api/dashboard/route.ts
- Accepts query parameters: `hospitalId`, `region`, `scope`, `mode`
- When `hospitalId` provided: filters all Prisma queries by `establishmentId: hospitalId`
- When `region` provided: finds all establishments in region, filters by their IDs
- When `scope=national`: returns aggregated data across all hospitals
- RLS: non-admin users scoped to their `establishmentId` from context
- Added `mode=comparison`: returns stats grouped by hospital
- Response includes: `scope`, `scopeEntity`, `stats`, `comparison?`, `timestamp`
- Proper error handling with try/catch and mock data fallback

#### Step 2: Updated /api/establishments/route.ts
- **PUT handler**: Update establishment (name, type, isActive, region, etc.) with existence check
- **DELETE handler**: Soft delete (sets `isActive: false`) with existence check
- **GET /api/establishments/stats**: Returns aggregated stats per establishment (patient counts, bed occupancy, departments)
- **GET /api/establishments/map-data**: Returns GeoJSON FeatureCollection with coordinates for map visualization, includes known Guinean hospital coordinates and region-based defaults

#### Step 3: Created /api/delegations/route.ts
- **GET**: List delegations with filters (hospitalId, serviceId, status, isActive), auto-expires delegations, RLS scoping to establishment
- **POST**: Create delegation with validation (no self-delegation, required fields), calculates expiry from duration, status starts as 'En attente'
- **PUT**: Update delegation status (approve, activate, revoke, expire) with authorization checks and RLS
- In-memory store with full type safety

#### Step 4: Created /api/transfers/route.ts
- **GET**: List transfers with filters (fromServiceId, toServiceId, fromHospitalId, toHospitalId, status, patientId), sorted by priority and date, RLS scoping
- **POST**: Create transfer with validation (from ≠ to, required fields), priority validation, status starts as 'En attente'
- **PUT**: Update transfer status (accept, reject, complete, cancel) with valid state transitions and RLS
- In-memory store with full type safety

## Files Modified
- `src/lib/hospital-model.ts` — Extended ServiceDelegation, added DelegationAuditEntry
- `src/lib/hospital-store.ts` — Complete delegation/transfer system overhaul
- `src/components/hospital/multi-hospital-dashboard.tsx` — Wired all dialogs and buttons
- `src/app/api/dashboard/route.ts` — Hospital scoping, RLS, comparison mode
- `src/app/api/establishments/route.ts` — PUT, DELETE, stats, map-data
- `src/app/api/delegations/route.ts` — New file
- `src/app/api/transfers/route.ts` — New file

## Verification
- ESLint: 0 errors in modified files
- TypeScript: 0 compilation errors in modified files (pre-existing errors in unrelated files remain)
- Dev server: Running without errors related to our changes
