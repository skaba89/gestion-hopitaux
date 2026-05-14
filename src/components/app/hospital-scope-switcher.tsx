'use client'

import React from 'react'
import { Building2, Globe, MapPin, Stethoscope, ChevronDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useMultiHospitalStore } from '@/lib/hospital-store'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  SCOPE_LEVEL,
  MANAGEMENT_SCOPE_LABELS,
  CLINICAL_ROLE_LABELS,
  getAccessibleDataScope,
  getRoleDisplayLabel,
  type ManagementScope,
  type ScopeLevel,
} from '@/lib/unified-rbac'

// ─────────── Scope Icon ───────────

function ScopeIcon({ level, className }: { level: ScopeLevel; className?: string }) {
  switch (level) {
    case 'national':
      return <Globe className={className} />
    case 'region':
      return <MapPin className={className} />
    case 'hospital':
      return <Building2 className={className} />
    case 'service':
      return <Stethoscope className={className} />
  }
}

// ─────────── Scope Badge Color ───────────

function getScopeBadgeClasses(level: ScopeLevel): string {
  switch (level) {
    case 'national':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700'
    case 'region':
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
    case 'hospital':
      return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700'
    case 'service':
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600'
  }
}

// ─────────── Scope Badge Label ───────────

function getScopeBadgeLabel(level: ScopeLevel): string {
  switch (level) {
    case 'national':
      return 'National'
    case 'region':
      return 'Régional'
    case 'hospital':
      return 'Hôpital'
    case 'service':
      return 'Service'
  }
}

// ─────────── Main Component ───────────

export function HospitalScopeSwitcher() {
  const { user, scopeLevel, activeHospitalScope, setActiveScope } = useStore()
  const { hospitals, getHospitalsByRegion } = useMultiHospitalStore()

  const managementScope = user.managementScope as ManagementScope
  const scopeLevelNum = SCOPE_LEVEL[managementScope]

  // Determine available options based on management scope
  const availableLevels: ScopeLevel[] = []

  if (scopeLevelNum >= SCOPE_LEVEL['directeur_general']) {
    availableLevels.push('national', 'region', 'hospital')
  } else if (scopeLevelNum >= SCOPE_LEVEL['directeur_regional']) {
    availableLevels.push('region', 'hospital')
  } else if (scopeLevelNum >= SCOPE_LEVEL['directeur_hopital']) {
    availableLevels.push('hospital')
  } else if (scopeLevelNum >= SCOPE_LEVEL['chef_service']) {
    availableLevels.push('service')
  } else {
    availableLevels.push('hospital')
  }

  // Get hospitals available to the user
  const userRegionCode = user.regionCode
  const hospitalsInView =
    scopeLevelNum >= SCOPE_LEVEL['directeur_general']
      ? hospitals
      : userRegionCode
        ? getHospitalsByRegion(userRegionCode as Parameters<typeof getHospitalsByRegion>[0])
        : hospitals.filter(h => h.id === user.hospitalId)

  // Current selection display
  const currentScopeLevel = scopeLevel
  const currentIcon = <ScopeIcon level={currentScopeLevel} className="size-4" />
  const badgeClasses = getScopeBadgeClasses(currentScopeLevel)
  const badgeLabel = getScopeBadgeLabel(currentScopeLevel)

  // Determine the current "value" for the Select component
  const currentValue = React.useMemo(() => {
    if (currentScopeLevel === 'national') return 'scope:national'
    if (currentScopeLevel === 'region') return `scope:region:${userRegionCode ?? 'all'}`
    if (currentScopeLevel === 'hospital') return `hospital:${activeHospitalScope ?? user.hospitalId ?? 'none'}`
    if (currentScopeLevel === 'service') return `service:${user.serviceId ?? 'none'}`
    return 'scope:hospital'
  }, [currentScopeLevel, userRegionCode, activeHospitalScope, user.hospitalId, user.serviceId])

  const handleValueChange = React.useCallback(
    (value: string) => {
      if (value === 'scope:national') {
        setActiveScope('national')
      } else if (value.startsWith('scope:region:')) {
        const regionCode = value.replace('scope:region:', '')
        setActiveScope('region', regionCode === 'all' ? undefined : regionCode)
      } else if (value.startsWith('hospital:')) {
        const hospitalId = value.replace('hospital:', '')
        setActiveScope('hospital', hospitalId === 'none' ? undefined : hospitalId)
      } else if (value.startsWith('service:')) {
        const serviceId = value.replace('service:', '')
        setActiveScope('service', serviceId === 'none' ? undefined : serviceId)
      }
    },
    [setActiveScope],
  )

  // If user has no management scope at all, show a simple badge
  if (managementScope === 'none') {
    const userHospital = hospitals.find(h => h.id === user.hospitalId)
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Building2 className="size-4 text-teal-500" />
          <span className="hidden sm:inline max-w-[160px] truncate">
            {userHospital?.shortName ?? user.establishment}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`text-[10px] px-1.5 py-0 h-5 font-semibold transition-colors ${badgeClasses}`}
      >
        {badgeLabel}
      </Badge>

      <Select value={currentValue} onValueChange={handleValueChange}>
        <SelectTrigger
          size="sm"
          className="w-auto max-w-[220px] h-8 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {currentIcon}
            <SelectValue />
          </div>
        </SelectTrigger>

        <SelectContent className="w-[280px]">
          {/* National View - Directeur Général only */}
          {availableLevels.includes('national') && (
            <SelectGroup>
              <SelectLabel className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Globe className="size-3 inline mr-1" />
                Vue Nationale
              </SelectLabel>
              <SelectItem value="scope:national">
                <span className="flex items-center gap-2">
                  <Globe className="size-3.5 text-amber-500" />
                  <span className="font-medium">Vue Nationale</span>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    Tous les hôpitaux
                  </span>
                </span>
              </SelectItem>
            </SelectGroup>
          )}

          {/* Regional View - Directeur Régional and above */}
          {availableLevels.includes('region') && userRegionCode && (
            <SelectGroup>
              <SelectLabel className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <MapPin className="size-3 inline mr-1" />
                Vue Régionale
              </SelectLabel>
              <SelectItem value={`scope:region:${userRegionCode}`}>
                <span className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-purple-500" />
                  <span className="font-medium">Région {userRegionCode}</span>
                </span>
              </SelectItem>
            </SelectGroup>
          )}

          {/* Hospital Level */}
          {availableLevels.includes('hospital') && (
            <SelectGroup>
              <SelectLabel className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                <Building2 className="size-3 inline mr-1" />
                Hôpitaux
              </SelectLabel>
              {scopeLevelNum >= SCOPE_LEVEL['directeur_general'] && (
                <SelectItem value="scope:region:all">
                  <span className="flex items-center gap-2">
                    <Building2 className="size-3.5 text-teal-500" />
                    <span className="font-medium">Tous les hôpitaux</span>
                  </span>
                </SelectItem>
              )}
              {hospitalsInView.map((hospital) => (
                <SelectItem key={hospital.id} value={`hospital:${hospital.id}`}>
                  <span className="flex items-center gap-2">
                    <Building2 className="size-3.5 text-slate-400" />
                    <span className="truncate">{hospital.shortName}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {hospital.type}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* Service Level - Chef de Service only */}
          {availableLevels.includes('service') && user.serviceId && (
            <SelectGroup>
              <SelectLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Stethoscope className="size-3 inline mr-1" />
                Service
              </SelectLabel>
              <SelectItem value={`service:${user.serviceId}`}>
                <span className="flex items-center gap-2">
                  <Stethoscope className="size-3.5 text-slate-400" />
                  <span className="font-medium">Mon Service</span>
                </span>
              </SelectItem>
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
