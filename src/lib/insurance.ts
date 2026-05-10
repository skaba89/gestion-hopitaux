/**
 * Insurance Service Layer — HealthFlow Africa
 * Provider management, coverage verification, claims, pre-authorization
 * Demo/Sandbox mode
 */

import type { InsuranceProvider, InsuranceClaim } from '@/lib/data-store'

/* ─────────── Types ─────────── */

export interface CoverageCheckResult {
  isCovered: boolean
  providerId: string
  providerName: string
  policyNumber: string
  coveragePercentage: number
  coveredAmount: number
  patientAmount: number
  message: string
}

export interface ClaimSubmissionResult {
  success: boolean
  claimId: string
  status: InsuranceClaim['status']
  message: string
}

export interface PreAuthResult {
  success: boolean
  preAuthId: string
  authorizationCode: string | null
  status: 'Demandée' | 'Approuvée' | 'Rejetée'
  message: string
}

/* ─────────── Coverage Verification (Demo) ─────────── */

export function checkCoverage(
  patientId: string,
  provider: InsuranceProvider,
  amount: number
): CoverageCheckResult {
  // In demo mode, simulate coverage check
  // 85% chance patient is covered
  const isCovered = Math.random() > 0.15

  if (!isCovered) {
    return {
      isCovered: false,
      providerId: provider.id,
      providerName: provider.name,
      policyNumber: '',
      coveragePercentage: 0,
      coveredAmount: 0,
      patientAmount: amount,
      message: 'Patient non couvert par cette assurance. Vérifiez le numéro de police.',
    }
  }

  const policyNumber = `${provider.code}-${2024}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`
  const coveredAmount = Math.round(amount * provider.coveragePercentage / 100)
  const patientAmount = amount - coveredAmount

  return {
    isCovered: true,
    providerId: provider.id,
    providerName: provider.name,
    policyNumber,
    coveragePercentage: provider.coveragePercentage,
    coveredAmount,
    patientAmount,
    message: `Couverture vérifiée. ${provider.coveragePercentage}% couvert par ${provider.name}.`,
  }
}

/* ─────────── Claim Submission (Demo) ─────────── */

export async function submitClaim(params: {
  providerId: string
  providerName: string
  patientId: string
  patientName: string
  invoiceId: string
  amount: number
  coveredAmount: number
  patientAmount: number
  policyNumber: string
  notes: string
}): Promise<ClaimSubmissionResult> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

  const claimId = `CLM-${Date.now()}`
  const success = Math.random() > 0.1

  return {
    success,
    claimId,
    status: success ? 'Soumise' : 'Rejetée',
    message: success
      ? `Réclamation ${claimId} soumise à ${params.providerName}. Délai de traitement estimé: 48h.`
      : 'Échec de la soumission. Vérifiez les informations et réessayez.',
  }
}

/* ─────────── Pre-Authorization (Demo) ─────────── */

export async function requestPreAuthorization(params: {
  providerId: string
  providerName: string
  patientId: string
  patientName: string
  procedureDescription: string
  estimatedCost: number
}): Promise<PreAuthResult> {
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))

  const preAuthId = `PREAUTH-${Date.now()}`
  
  // 75% auto-approval in demo
  const approved = Math.random() > 0.25
  const authCode = approved ? `AUTH-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}` : null

  return {
    success: true,
    preAuthId,
    authorizationCode: authCode,
    status: approved ? 'Approuvée' : 'Rejetée',
    message: approved
      ? `Pré-autorisation accordée. Code: ${authCode}. Valable 30 jours.`
      : 'Pré-autorisation rejetée. Contactez l\'assureur pour plus d\'informations.',
  }
}

/* ─────────── Reimbursement Tracking (Demo) ─────────── */

export function calculateReimbursement(
  claimAmount: number,
  coveragePercentage: number,
  deductible: number = 0
): { totalReimbursement: number; deductible: number; patientPays: number } {
  const afterDeductible = Math.max(0, claimAmount - deductible)
  const totalReimbursement = Math.round(afterDeductible * coveragePercentage / 100)
  const patientPays = claimAmount - totalReimbursement
  return { totalReimbursement, deductible, patientPays }
}

/* ─────────── Provider Helpers ─────────── */

export function getProviderInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
}

export function formatClaimStatus(status: InsuranceClaim['status']): { label: string; color: string } {
  const map: Record<InsuranceClaim['status'], { label: string; color: string }> = {
    'Soumise': { label: 'Soumise', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
    'En cours': { label: 'En cours', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
    'Approuvée': { label: 'Approuvée', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
    'Rejetée': { label: 'Rejetée', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
    'Remboursée': { label: 'Remboursée', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' },
  }
  return map[status]
}
