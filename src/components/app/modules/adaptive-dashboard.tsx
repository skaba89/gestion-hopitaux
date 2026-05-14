'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, MapPin, Building2, Stethoscope, ChevronRight,
  Shield, Activity,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMultiHospitalStore } from '@/lib/hospital-store'
import {
  type GuineaRegion, type MultiHospitalRole,
  REGION_LABELS, ROLE_HIERARCHY,
} from '@/lib/hospital-model'
import { useStore } from '@/lib/store'
import { NationalDashboard } from '@/components/dashboard/national-dashboard'
import { RegionalDashboard } from '@/components/dashboard/regional-dashboard'
import { HospitalDashboard } from '@/components/dashboard/hospital-dashboard'
import { ServiceDashboard } from '@/components/dashboard/service-dashboard'

// ─────────── Scope Level Types ───────────

type ScopeLevel = 'national' | 'regional' | 'hospital' | 'service'

interface ScopeInfo {
  level: ScopeLevel
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const SCOPE_INFO: Record<ScopeLevel, ScopeInfo> = {
  national: {
    level: 'national',
    label: 'Vue Nationale',
    description: 'Supervision de tout le système de santé guinéen',
    icon: Globe,
    color: '#0d9488',
  },
  regional: {
    level: 'regional',
    label: 'Vue Régionale',
    description: 'Gestion de la région sanitaire',
    icon: MapPin,
    color: '#2563eb',
  },
  hospital: {
    level: 'hospital',
    label: 'Vue Hôpital',
    description: 'Gestion de l\'établissement hospitalier',
    icon: Building2,
    color: '#7c3aed',
  },
  service: {
    level: 'service',
    label: 'Vue Service',
    description: 'Gestion du service clinique',
    icon: Stethoscope,
    color: '#ea580c',
  },
}

// ─────────── Role-to-Scope Mapping ───────────

function getScopeForRole(role: string): ScopeLevel {
  const multiHospitalRoles: MultiHospitalRole[] = [
    'Directeur Général', 'Directeur Régional', 'Directeur Hôpital', 'Chef de Service',
  ]

  // Check if the role matches any multi-hospital role
  const matchedRole = multiHospitalRoles.find(r => role.includes(r.split(' ').pop() || '') || r.includes(role))

  if (matchedRole) {
    if (ROLE_HIERARCHY[matchedRole] >= ROLE_HIERARCHY['Directeur Général']) return 'national'
    if (ROLE_HIERARCHY[matchedRole] >= ROLE_HIERARCHY['Directeur Régional']) return 'regional'
    if (ROLE_HIERARCHY[matchedRole] >= ROLE_HIERARCHY['Directeur Hôpital']) return 'hospital'
    if (ROLE_HIERARCHY[matchedRole] >= ROLE_HIERARCHY['Chef de Service']) return 'service'
  }

  // Fallback: map common role names
  const roleLower = role.toLowerCase()
  if (roleLower.includes('général') || roleLower.includes('general') || roleLower.includes('ministre') || roleLower.includes('national')) return 'national'
  if (roleLower.includes('régional') || roleLower.includes('regional')) return 'regional'
  if (roleLower.includes('directeur') || roleLower.includes('hôpital') || roleLower.includes('hospital') || roleLower.includes('chef') || roleLower.includes('administrateur')) return 'hospital'
  if (roleLower.includes('service') || roleLower.includes('médecin') || roleLower.includes('medecin') || roleLower.includes('infirmier') || roleLower.includes('pharmacien')) return 'service'

  // Default: hospital scope for most users
  return 'hospital'
}

// Get region for a user based on establishment name
function getRegionForUser(establishment: string): GuineaRegion {
  const estabLower = establishment.toLowerCase()
  if (estabLower.includes('donka') || estabLower.includes('ignace') || estabLower.includes('kipé') || estabLower.includes('conakry')) return 'Conakry'
  if (estabLower.includes('kindia')) return 'Kindia'
  if (estabLower.includes('kankan')) return 'Kankan'
  if (estabLower.includes('nzérékoré') || estabLower.includes('nzerekore')) return 'Nzérékoré'
  if (estabLower.includes('labé') || estabLower.includes('labe')) return 'Labé'
  if (estabLower.includes('boké') || estabLower.includes('boke')) return 'Boké'
  if (estabLower.includes('mamou')) return 'Mamou'
  if (estabLower.includes('faranah')) return 'Faranah'
  return 'Conakry' // Default
}

// ─────────── Scope Selector Component ───────────

function ScopeSelector({
  currentScope,
  onScopeChange,
}: {
  currentScope: ScopeLevel
  onScopeChange: (scope: ScopeLevel) => void
}) {
  const scopes: ScopeLevel[] = ['national', 'regional', 'hospital', 'service']

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      {scopes.map((scope) => {
        const info = SCOPE_INFO[scope]
        const isActive = currentScope === scope
        return (
          <Button
            key={scope}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 text-xs px-3 transition-all ${
              isActive
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => onScopeChange(scope)}
          >
            <info.icon className="size-3.5 mr-1.5" />
            {info.label}
          </Button>
        )
      })}
    </div>
  )
}

// ─────────── Breadcrumb Navigation ───────────

function BreadcrumbNav({
  scope,
  regionCode,
  hospitalId,
  serviceId,
  hospitalName,
  serviceName,
  onNavigate,
}: {
  scope: ScopeLevel
  regionCode?: GuineaRegion
  hospitalId?: string
  serviceId?: string
  hospitalName?: string
  serviceName?: string
  onNavigate: (scope: ScopeLevel) => void
}) {
  const items: { label: string; scope: ScopeLevel; active: boolean }[] = [
    { label: 'Guinée', scope: 'national', active: scope === 'national' },
  ]

  if (regionCode || scope === 'regional') {
    items.push({
      label: REGION_LABELS[regionCode || 'Conakry'],
      scope: 'regional',
      active: scope === 'regional',
    })
  }

  if (hospitalId || scope === 'hospital') {
    items.push({
      label: hospitalName || 'Hôpital',
      scope: 'hospital',
      active: scope === 'hospital',
    })
  }

  if (serviceId || scope === 'service') {
    items.push({
      label: serviceName || 'Service',
      scope: 'service',
      active: scope === 'service',
    })
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {items.map((item, i) => (
        <React.Fragment key={item.scope}>
          {i > 0 && <ChevronRight className="size-3.5 text-slate-400 dark:text-slate-500" />}
          <button
            onClick={() => onNavigate(item.scope)}
            className={`px-2 py-1 rounded-md transition-colors ${
              item.active
                ? 'text-slate-900 dark:text-white font-semibold bg-slate-100 dark:bg-slate-800'
                : 'text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30'
            }`}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}

// ─────────── Main Adaptive Dashboard ───────────

export function AdaptiveDashboard() {
  const { user } = useStore()
  const {
    hospitals, selectedHospitalId, selectedServiceId,
    selectHospital, selectService, getSelectedHospital, getSelectedService,
  } = useMultiHospitalStore()

  // Auto-detect scope based on user role
  const detectedScope = useMemo(() => getScopeForRole(user.role), [user.role])
  const detectedRegion = useMemo(() => getRegionForUser(user.establishment), [user.establishment])

  // Current scope state
  const [currentScope, setCurrentScope] = React.useState<ScopeLevel>(detectedScope)
  const [currentRegion, setCurrentRegion] = React.useState<GuineaRegion>(detectedRegion)

  // When hospital or service is selected in the store, navigate to that scope
  React.useEffect(() => {
    if (selectedServiceId && selectedHospitalId) {
      setCurrentScope('service')
    } else if (selectedHospitalId) {
      setCurrentScope('hospital')
    }
  }, [selectedHospitalId, selectedServiceId])

  // Get current hospital and service info
  const selectedHospital = getSelectedHospital()
  const selectedService = getSelectedService()

  // Determine the default hospital ID for the user's establishment
  const defaultHospitalId = useMemo(() => {
    if (selectedHospitalId) return selectedHospitalId
    const estabLower = user.establishment.toLowerCase()
    const match = hospitals.find(h =>
      estabLower.includes(h.shortName.toLowerCase()) ||
      estabLower.includes(h.name.toLowerCase())
    )
    return match?.id || hospitals[0]?.id
  }, [hospitals, user.establishment, selectedHospitalId])

  const handleScopeChange = (scope: ScopeLevel) => {
    setCurrentScope(scope)
    if (scope === 'national') {
      selectHospital(null)
    } else if (scope === 'regional') {
      selectHospital(null)
    }
  }

  // Render the appropriate dashboard
  const renderDashboard = () => {
    switch (currentScope) {
      case 'national':
        return <NationalDashboard />
      case 'regional':
        return <RegionalDashboard regionCode={currentRegion} />
      case 'hospital':
        return <HospitalDashboard hospitalId={selectedHospitalId || defaultHospitalId} />
      case 'service':
        if (selectedHospitalId && selectedServiceId) {
          return <ServiceDashboard hospitalId={selectedHospitalId} serviceId={selectedServiceId} />
        }
        // Fallback to hospital if no service selected
        return <HospitalDashboard hospitalId={selectedHospitalId || defaultHospitalId} />
      default:
        return <NationalDashboard />
    }
  }

  const currentScopeInfo = SCOPE_INFO[currentScope]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 lg:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <BreadcrumbNav
            scope={currentScope}
            regionCode={currentRegion}
            hospitalId={selectedHospitalId || undefined}
            serviceId={selectedServiceId || undefined}
            hospitalName={selectedHospital?.shortName}
            serviceName={selectedService?.name}
            onNavigate={handleScopeChange}
          />
          <ScopeSelector currentScope={currentScope} onScopeChange={handleScopeChange} />
        </div>
      </div>

      {/* Dashboard Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScope}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderDashboard()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
