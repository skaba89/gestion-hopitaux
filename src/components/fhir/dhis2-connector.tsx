'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Globe,
  Activity,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  BarChart3,
  Shield,
  Bell,
  FileText,
  ArrowUpDown,
} from 'lucide-react'
import {
  INTEGRATION_STATUSES,
  DHIS2_DATA_ELEMENTS,
  generateDHIS2Report,
  toDHIS2Period,
  demoSNISReports,
  demoMTracAlerts,
  MTRAC_DISEASES,
  demoSyncOperations,
  type DHIS2Report,
  type DHIS2DataValueSet,
  type SNISReport,
  type MTracAlert,
  type SyncOperation,
} from '@/lib/national-integrations'

/* ─────────── Helpers ─────────── */

function formatRelativeDate(iso: string | null): string {
  if (!iso) return 'Jamais'
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Moins d'1 min"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}j`
  const months = Math.floor(days / 30)
  return `${months} mois`
}

function formatDateFR(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ─────────── Badge Helpers ─────────── */

function ConnectionStatusBadge({ status }: { status: 'connected' | 'syncing' | 'error' | 'disconnected' }) {
  const config = {
    connected: {
      label: 'Connecté',
      className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
      Icon: CheckCircle2,
    },
    syncing: {
      label: 'Synchronisation',
      className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
      Icon: RefreshCw,
    },
    error: {
      label: 'Erreur',
      className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
      Icon: XCircle,
    },
    disconnected: {
      label: 'Déconnecté',
      className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
      Icon: XCircle,
    },
  }
  const c = config[status]
  return (
    <Badge variant="outline" className={c.className}>
      <c.Icon className={`h-3 w-3 mr-1 ${status === 'syncing' ? 'animate-spin' : ''}`} />
      {c.label}
    </Badge>
  )
}

function ReportStatusBadge({ status }: { status: DHIS2Report['status'] }) {
  const config = {
    draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
    submitted: { label: 'Soumis', className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800' },
    accepted: { label: 'Accepté', className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800' },
    rejected: { label: 'Rejeté', className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800' },
  }
  const c = config[status]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function SNISStatusBadge({ status }: { status: SNISReport['status'] }) {
  const config = {
    brouillon: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
    soumis: { label: 'Soumis', className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800' },
    validé: { label: 'Validé', className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800' },
    rejeté: { label: 'Rejeté', className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800' },
  }
  const c = config[status]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function AlertLevelBadge({ level }: { level: MTracAlert['alertLevel'] }) {
  const config = {
    info: {
      label: 'Information',
      className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    },
    warning: {
      label: 'Attention',
      className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
    },
    critical: {
      label: 'Critique',
      className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
    },
  }
  const c = config[level]
  return <Badge variant="outline" className={`${c.className} ${level === 'critical' ? 'animate-pulse' : ''}`}>{c.label}</Badge>
}

function ResponseStatusBadge({ status }: { status: MTracAlert['responseStatus'] }) {
  const config = {
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800' },
    investigating: { label: 'Investigation', className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800' },
    responding: { label: 'Intervention', className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800' },
    resolved: { label: 'Résolu', className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800' },
  }
  const c = config[status]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function SyncStatusBadge({ status }: { status: SyncOperation['status'] }) {
  const config = {
    queued: { label: 'En file', className: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700', Icon: Clock },
    'in-progress': { label: 'En cours', className: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800', Icon: RefreshCw },
    completed: { label: 'Terminé', className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800', Icon: CheckCircle2 },
    failed: { label: 'Échoué', className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800', Icon: XCircle },
  }
  const c = config[status]
  return (
    <Badge variant="outline" className={c.className}>
      <c.Icon className={`h-3 w-3 mr-1 ${status === 'in-progress' ? 'animate-spin' : ''}`} />
      {c.label}
    </Badge>
  )
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
  return <Minus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
}

/* ─────────── Demo DHIS2 Reports ─────────── */

const demoDHIS2Reports: DHIS2Report[] = [
  {
    id: 'RPT-2026-04',
    period: '202604',
    orgUnitName: 'Hôpital National Donka',
    orgUnitCode: 'OU-DONKA',
    status: 'submitted',
    submittedAt: '2026-05-02T10:30:00Z',
    acceptedAt: null,
    dataValues: [
      { dataElement: 'DE-CONS-001', categoryOptionCombo: 'COC-DEFAULT', value: '1247' },
      { dataElement: 'DE-CONS-002', categoryOptionCombo: 'COC-DEFAULT', value: '389' },
      { dataElement: 'DE-CONS-003', categoryOptionCombo: 'COC-DEFAULT', value: '858' },
      { dataElement: 'DE-PATH-001', categoryOptionCombo: 'COC-DEFAULT', value: '312' },
      { dataElement: 'DE-PATH-002', categoryOptionCombo: 'COC-DEFAULT', value: '45' },
      { dataElement: 'DE-PATH-003', categoryOptionCombo: 'COC-DEFAULT', value: '267' },
      { dataElement: 'DE-PATH-004', categoryOptionCombo: 'COC-DEFAULT', value: '156' },
      { dataElement: 'DE-PATH-005', categoryOptionCombo: 'COC-DEFAULT', value: '198' },
      { dataElement: 'DE-PATH-006', categoryOptionCombo: 'COC-DEFAULT', value: '87' },
      { dataElement: 'DE-PATH-007', categoryOptionCombo: 'COC-DEFAULT', value: '34' },
      { dataElement: 'DE-MAT-001', categoryOptionCombo: 'COC-DEFAULT', value: '213' },
      { dataElement: 'DE-MAT-002', categoryOptionCombo: 'COC-DEFAULT', value: '89' },
      { dataElement: 'DE-CHILD-001', categoryOptionCombo: 'COC-DEFAULT', value: '145' },
      { dataElement: 'DE-LAB-001', categoryOptionCombo: 'COC-DEFAULT', value: '567' },
      { dataElement: 'DE-PHARM-001', categoryOptionCombo: 'COC-DEFAULT', value: '923' },
      { dataElement: 'DE-EMER-001', categoryOptionCombo: 'COC-DEFAULT', value: '134' },
      { dataElement: 'DE-FIN-001', categoryOptionCombo: 'COC-DEFAULT', value: '28450000' },
      { dataElement: 'DE-FIN-002', categoryOptionCombo: 'COC-DEFAULT', value: '8920000' },
    ],
    generatedAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 'RPT-2026-03',
    period: '202603',
    orgUnitName: 'Hôpital National Donka',
    orgUnitCode: 'OU-DONKA',
    status: 'accepted',
    submittedAt: '2026-04-03T09:15:00Z',
    acceptedAt: '2026-04-05T14:00:00Z',
    dataValues: [
      { dataElement: 'DE-CONS-001', categoryOptionCombo: 'COC-DEFAULT', value: '1189' },
      { dataElement: 'DE-PATH-001', categoryOptionCombo: 'COC-DEFAULT', value: '298' },
      { dataElement: 'DE-MAT-001', categoryOptionCombo: 'COC-DEFAULT', value: '198' },
      { dataElement: 'DE-EMER-001', categoryOptionCombo: 'COC-DEFAULT', value: '121' },
    ],
    generatedAt: '2026-04-01T08:00:00Z',
  },
  {
    id: 'RPT-2026-Q1',
    period: '2026Q1',
    orgUnitName: 'Hôpital National Donka',
    orgUnitCode: 'OU-DONKA',
    status: 'accepted',
    submittedAt: '2026-04-10T11:00:00Z',
    acceptedAt: '2026-04-12T16:30:00Z',
    dataValues: [
      { dataElement: 'DE-CONS-001', categoryOptionCombo: 'COC-DEFAULT', value: '3521' },
      { dataElement: 'DE-PATH-001', categoryOptionCombo: 'COC-DEFAULT', value: '876' },
      { dataElement: 'DE-MAT-001', categoryOptionCombo: 'COC-DEFAULT', value: '589' },
      { dataElement: 'DE-EMER-001', categoryOptionCombo: 'COC-DEFAULT', value: '367' },
    ],
    generatedAt: '2026-04-05T08:00:00Z',
  },
]

/* ─────────── Data Element Category Map ─────────── */

const DATA_ELEMENT_CATEGORIES: Record<string, { category: string; color: string; bg: string }> = {
  'DE-CONS': { category: 'Consultations', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950' },
  'DE-PATH': { category: 'Pathologies', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950' },
  'DE-MAT': { category: 'Santé maternelle', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950' },
  'DE-CHILD': { category: 'Santé infantile', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950' },
  'DE-LAB': { category: 'Laboratoire', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950' },
  'DE-PHARM': { category: 'Pharmacie', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950' },
  'DE-EMER': { category: 'Urgences', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950' },
  'DE-FIN': { category: 'Finances', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
}

function getDataElementCategory(deId: string) {
  const prefix = deId.split('-').slice(0, 2).join('-')
  return DATA_ELEMENT_CATEGORIES[prefix] ?? { category: 'Autre', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900' }
}

function getDataElementName(deId: string): string {
  for (const [, def] of Object.entries(DHIS2_DATA_ELEMENTS)) {
    if (def.id === deId) return def.name
  }
  return deId
}

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */

export function DHIS2Connector() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly'>('monthly')
  const [selectedPeriod, setSelectedPeriod] = useState('202604')
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewData, setPreviewData] = useState<DHIS2DataValueSet | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const dhis2Integration = INTEGRATION_STATUSES.find((i) => i.id === 'dhis2')!
  const snisIntegration = INTEGRATION_STATUSES.find((i) => i.id === 'snis')!
  const mtracIntegration = INTEGRATION_STATUSES.find((i) => i.id === 'mtrac')!

  /* ──────── Available periods ──────── */
  const availablePeriods = useMemo(() => {
    const periods = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      if (periodType === 'monthly') {
        periods.push({
          value: toDHIS2Period(d, 'monthly'),
          label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        })
      } else {
        const q = Math.ceil((d.getMonth() + 1) / 3)
        const val = `${d.getFullYear()}Q${q}`
        if (!periods.find((p) => p.value === val)) {
          periods.push({ value: val, label: `T${q} ${d.getFullYear()}` })
        }
      }
    }
    return periods
  }, [periodType])

  /* ──────── Generate report handler ──────── */
  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const period = selectedPeriod || toDHIS2Period(new Date(), periodType)
      const report = generateDHIS2Report(period, 'OU-DONKA', {
        consultations: 1247,
        newPatients: 389,
        followUps: 858,
        malariaCases: 312,
        malariaSevere: 45,
        diarrheaCases: 156,
        respiratoryInfections: 198,
        hypertensionCases: 87,
        diabetesCases: 34,
        antenatalVisits: 213,
        deliveries: 89,
        emergencyCases: 134,
        labTests: 567,
        revenue: 28450000,
        mobileMoneyPayments: 342,
      })
      setPreviewData(report)
      setShowPreview(true)
      setIsGenerating(false)
    }, 1200)
  }

  /* ──────── SNIS indicator category colors ──────── */
  const snisCategoryColors: Record<string, { color: string; bg: string }> = {
    'Activité': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950' },
    'Morbidité': { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950' },
    'Mortalité': { color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800' },
    'Prévention': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
    'Infrastructure': { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950' },
    'Pharmacie': { color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950' },
    'Finances': { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950' },
  }

  /* ═══════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-600" />
            Connecteur DHIS2 Guinée
          </h2>
          <p className="text-muted-foreground mt-1">
            Interopérabilité DHIS2 / OMS — Système national de rapportage sanitaire
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ConnectionStatusBadge status={dhis2Integration.status} />
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
            <Shield className="h-3 w-3 mr-1" /> v{dhis2Integration.version}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="grid w-full grid-cols-5 min-w-[600px]">
            <TabsTrigger value="dashboard" className="gap-1">
              <BarChart3 className="h-4 w-4 hidden sm:block" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1">
              <FileText className="h-4 w-4 hidden sm:block" />
              Rapports DHIS2
            </TabsTrigger>
            <TabsTrigger value="snis" className="gap-1">
              <Activity className="h-4 w-4 hidden sm:block" />
              SNIS National
            </TabsTrigger>
            <TabsTrigger value="mtrac" className="gap-1">
              <Bell className="h-4 w-4 hidden sm:block" />
              mTrac Surveillance
            </TabsTrigger>
            <TabsTrigger value="sync" className="gap-1">
              <ArrowUpDown className="h-4 w-4 hidden sm:block" />
              Historique Sync
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        {/* ══════════════════════════════════════════════════════
           Tab 1: Tableau de bord DHIS2
           ══════════════════════════════════════════════════════ */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Dernière sync', value: formatRelativeDate(dhis2Integration.lastSync), icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950' },
              { label: 'Enregistrements synchronisés', value: dhis2Integration.recordsSynced.toLocaleString('fr-FR'), icon: Database, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950' },
              { label: 'En attente', value: dhis2Integration.recordsPending.toString(), icon: RefreshCw, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950' },
              { label: 'Rapports soumis', value: demoDHIS2Reports.filter((r) => r.status === 'submitted' || r.status === 'accepted').length.toString(), icon: Send, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, ease: 'easeOut' }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Connection details + Period selector */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Connection details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, ease: 'easeOut' }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-5 w-5 text-emerald-600" />
                    Détails de connexion DHIS2
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Serveur', value: 'https://dhis2.sante.gov.gn' },
                    { label: 'Unité organisationnelle', value: 'Hôpital National Donka (OU-DONKA)' },
                    { label: 'Dataset', value: 'DS-HF-REPORT' },
                    { label: 'Intervalle de sync', value: dhis2Integration.syncInterval },
                    { label: 'Prochaine sync', value: formatRelativeDate(dhis2Integration.nextSync) },
                    { label: 'Version DHIS2', value: dhis2Integration.version },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                  {dhis2Integration.lastError && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm">
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                      {dhis2Integration.lastError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Period selector & Quick stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, ease: 'easeOut' }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Sélecteur de période
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Type de période</label>
                      <Select value={periodType} onValueChange={(v) => setPeriodType(v as 'monthly' | 'quarterly')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensuel</SelectItem>
                          <SelectItem value="quarterly">Trimestriel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Période</label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePeriods.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Quick stats for selected period */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Statistiques DHIS2 — {availablePeriods.find((p) => p.value === selectedPeriod)?.label ?? selectedPeriod}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Consultations', value: '1 247', icon: Activity },
                        { label: 'Paludisme', value: '312', icon: AlertTriangle },
                        { label: 'Accouchements', value: '89', icon: Shield },
                        { label: 'Urgences', value: '134', icon: Bell },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg border">
                          <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold">{item.value}</p>
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Integration statuses */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Statut des intégrations nationales</p>
                    {INTEGRATION_STATUSES.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{integration.icon}</span>
                          <span className="text-sm">{integration.name}</span>
                        </div>
                        <ConnectionStatusBadge status={integration.status} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════
           Tab 2: Rapports DHIS2
           ══════════════════════════════════════════════════════ */}
        <TabsContent value="reports" className="space-y-4 mt-4">
          {/* Actions bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {demoDHIS2Reports.length} rapport(s) DHIS2 généré(s)
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isGenerating ? 'Génération...' : 'Générer un rapport'}
              </Button>
            </div>
          </div>

          {/* Preview modal */}
          <AnimatePresence>
            {showPreview && previewData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ ease: 'easeOut' }}
              >
                <Card className="border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        Aperçu du Data Value Set
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                        Masquer
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Dataset:</span>
                        <p className="font-mono font-medium">{previewData.dataSet}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Période:</span>
                        <p className="font-mono font-medium">{previewData.period}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Org Unit:</span>
                        <p className="font-mono font-medium">{previewData.orgUnit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date complétion:</span>
                        <p className="font-mono font-medium">{previewData.completeDate}</p>
                      </div>
                    </div>

                    <Separator />

                    <ScrollArea className="max-h-64">
                      <div className="space-y-1 pr-4">
                        {previewData.dataValues.map((dv) => {
                          const cat = getDataElementCategory(dv.dataElement)
                          return (
                            <div key={dv.dataElement} className={`flex items-center justify-between p-2 rounded ${cat.bg}`}>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-mono ${cat.color}`}>{dv.dataElement}</span>
                                <span className="text-sm">{getDataElementName(dv.dataElement)}</span>
                              </div>
                              <span className="text-sm font-bold">{Number(dv.value).toLocaleString('fr-FR')}</span>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>

                    <div className="flex gap-2 pt-2">
                      <Button className="gap-2">
                        <Send className="h-4 w-4" />
                        Soumettre à DHIS2
                      </Button>
                      <Button variant="outline" onClick={() => setShowPreview(false)}>
                        Annuler
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reports list */}
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-3 pr-4">
              {demoDHIS2Reports.map((report, i) => {
                const isExpanded = expandedReport === report.id
                // Group data values by category
                const groupedValues = report.dataValues.reduce<Record<string, typeof report.dataValues>>((acc, dv) => {
                  const cat = getDataElementCategory(dv.dataElement).category
                  if (!acc[cat]) acc[cat] = []
                  acc[cat].push(dv)
                  return acc
                }, {})

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, ease: 'easeOut' }}
                  >
                    <Card className={`transition-all ${isExpanded ? 'ring-2 ring-emerald-300 dark:ring-emerald-700' : ''}`}>
                      <CardContent className="p-4 space-y-3">
                        {/* Header row */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold">{report.id}</span>
                            <Badge variant="secondary" className="text-xs font-mono">{report.period}</Badge>
                          </div>
                          <ReportStatusBadge status={report.status} />
                        </div>

                        {/* Org Unit & dates */}
                        <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{report.orgUnitName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Généré: {formatDateFR(report.generatedAt)}</span>
                          </div>
                        </div>

                        {/* Summary values */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {report.dataValues.slice(0, 4).map((dv) => {
                            const cat = getDataElementCategory(dv.dataElement)
                            return (
                              <div key={dv.dataElement} className={`p-2 rounded-lg ${cat.bg}`}>
                                <p className={`text-lg font-bold ${cat.color}`}>{Number(dv.value).toLocaleString('fr-FR')}</p>
                                <p className="text-xs text-muted-foreground truncate">{getDataElementName(dv.dataElement)}</p>
                              </div>
                            )
                          })}
                        </div>

                        {/* Expand button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                        >
                          {isExpanded ? 'Masquer les éléments de données' : `Voir les ${report.dataValues.length} éléments de données`}
                        </Button>

                        {/* Expanded data values */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 pt-2">
                                {Object.entries(groupedValues).map(([category, values]) => {
                                  const cat = getDataElementCategory(values[0].dataElement)
                                  return (
                                    <div key={category}>
                                      <p className={`text-xs font-medium mb-1 ${cat.color}`}>{category}</p>
                                      <div className="space-y-1">
                                        {values.map((dv) => (
                                          <div key={dv.dataElement} className={`flex items-center justify-between p-2 rounded ${cat.bg}`}>
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-mono text-muted-foreground">{dv.dataElement}</span>
                                              <span className="text-sm">{getDataElementName(dv.dataElement)}</span>
                                            </div>
                                            <span className="text-sm font-bold">{Number(dv.value).toLocaleString('fr-FR')}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════
           Tab 3: SNIS National
           ══════════════════════════════════════════════════════ */}
        <TabsContent value="snis" className="space-y-4 mt-4">
          {/* SNIS Integration Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Rapports SNIS — Système National d&apos;Information Sanitaire
            </p>
            <div className="flex gap-2">
              <ConnectionStatusBadge status={snisIntegration.status} />
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">
                <Activity className="h-3 w-3 mr-1" /> v{snisIntegration.version}
              </Badge>
            </div>
          </div>

          {demoSNISReports.map((report, ri) => (
            <div key={report.id} className="space-y-4">
              {/* Report header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ri * 0.1, ease: 'easeOut' }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        {report.facilityName} — {report.period}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <SNISStatusBadge status={report.status} />
                        <Badge variant="outline" className="text-xs">{report.healthZone}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type</span>
                        <p className="font-medium">{report.reportType === 'monthly' ? 'Mensuel' : report.reportType === 'quarterly' ? 'Trimestriel' : 'Annuel'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Soumis par</span>
                        <p className="font-medium">{report.submittedBy}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Soumis le</span>
                        <p className="font-medium">{formatDateFR(report.submittedAt)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Validé par</span>
                        <p className="font-medium">{report.validatedBy ?? 'En attente'}</p>
                      </div>
                    </div>
                    {report.comments.length > 0 && (
                      <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm text-muted-foreground">
                        {report.comments.map((c, ci) => (
                          <p key={ci}>{c}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Indicator cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {report.indicators.map((indicator, i) => {
                  const catColors = snisCategoryColors[indicator.category] ?? { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900' }
                  const progressPercent = Math.min(100, (indicator.value / indicator.target) * 100)
                  const isOnTrack = indicator.trend === 'up' && indicator.value >= indicator.target * 0.8
                  const isAtRisk = indicator.trend === 'down' || (indicator.value < indicator.target * 0.5)

                  return (
                    <motion.div
                      key={indicator.code}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06, ease: 'easeOut' }}
                    >
                      <Card className={`h-full border-l-4 ${
                        isOnTrack ? 'border-l-green-500' : isAtRisk ? 'border-l-red-500' : 'border-l-amber-500'
                      }`}>
                        <CardContent className="p-4 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{indicator.name}</p>
                              <Badge variant="secondary" className={`text-xs mt-1 ${catColors.color}`}>
                                {indicator.category}
                              </Badge>
                            </div>
                            <TrendIcon trend={indicator.trend} />
                          </div>

                          {/* Value */}
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold">
                              {indicator.unit === 'GNF'
                                ? indicator.value.toLocaleString('fr-FR')
                                : indicator.value}
                            </span>
                            <span className="text-sm text-muted-foreground">{indicator.unit}</span>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Objectif: {indicator.unit === 'GNF' ? indicator.target.toLocaleString('fr-FR') : indicator.target} {indicator.unit}</span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress value={progressPercent} className={`h-2 ${
                              isOnTrack ? '[&>[data-slot=progress-indicator]]:bg-green-500' :
                              isAtRisk ? '[&>[data-slot=progress-indicator]]:bg-red-500' :
                              '[&>[data-slot=progress-indicator]]:bg-amber-500'
                            }`} />
                          </div>

                          {/* Previous value */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Précédent: {indicator.unit === 'GNF' ? indicator.previousValue.toLocaleString('fr-FR') : indicator.previousValue} {indicator.unit}</span>
                            <span className={`font-medium ${
                              indicator.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                              indicator.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                              'text-gray-500 dark:text-gray-400'
                            }`}>
                              {indicator.trend === 'up' ? '+' : indicator.trend === 'down' ? '' : '='}
                              {indicator.unit === 'GNF'
                                ? (indicator.value - indicator.previousValue).toLocaleString('fr-FR')
                                : (indicator.value - indicator.previousValue).toFixed(1)
                              }
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ══════════════════════════════════════════════════════
           Tab 4: mTrac Surveillance
           ══════════════════════════════════════════════════════ */}
        <TabsContent value="mtrac" className="space-y-4 mt-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Alertes mTrac — Surveillance épidémiologique mobile
            </p>
            <div className="flex gap-2">
              <ConnectionStatusBadge status={mtracIntegration.status} />
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {demoMTracAlerts.filter((a) => a.alertLevel === 'critical').length} critique(s)
              </Badge>
            </div>
          </div>

          {/* Alerts list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {demoMTracAlerts.map((alert, i) => {
              const isExpanded = expandedAlert === alert.id
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, ease: 'easeOut' }}
                >
                  <Card className={`h-full border-l-4 ${
                    alert.alertLevel === 'critical'
                      ? 'border-l-red-500'
                      : alert.alertLevel === 'warning'
                      ? 'border-l-orange-500'
                      : 'border-l-blue-500'
                  }`}>
                    <CardContent className="p-4 space-y-3">
                      {/* Disease & Alert Level */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className={`h-5 w-5 ${
                            alert.alertLevel === 'critical' ? 'text-red-600 dark:text-red-400' :
                            alert.alertLevel === 'warning' ? 'text-orange-600 dark:text-orange-400' :
                            'text-blue-600 dark:text-blue-400'
                          }`} />
                          <span className="font-semibold">{alert.disease}</span>
                          <Badge variant="secondary" className="text-xs font-mono">{alert.id}</Badge>
                        </div>
                        <AlertLevelBadge level={alert.alertLevel} />
                      </div>

                      <Separator />

                      {/* Location */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Localisation</span>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Globe className="h-3 w-3" />
                          {alert.location}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Zone de santé</span>
                        <span className="text-sm">{alert.healthZone}</span>
                      </div>

                      {/* Case / Death counts */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`rounded-lg p-2 text-center ${
                          alert.alertLevel === 'critical' ? 'bg-red-50 dark:bg-red-950' :
                          alert.alertLevel === 'warning' ? 'bg-orange-50 dark:bg-orange-950' :
                          'bg-blue-50 dark:bg-blue-950'
                        }`}>
                          <p className={`text-lg font-bold ${
                            alert.alertLevel === 'critical' ? 'text-red-700 dark:text-red-400' :
                            alert.alertLevel === 'warning' ? 'text-orange-700 dark:text-orange-400' :
                            'text-blue-700 dark:text-blue-400'
                          }`}>{alert.caseCount}</p>
                          <p className="text-xs text-muted-foreground">Cas</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{alert.deathCount}</p>
                          <p className="text-xs text-muted-foreground">Décès</p>
                        </div>
                      </div>

                      {/* Response status */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Statut de réponse</span>
                        <ResponseStatusBadge status={alert.responseStatus} />
                      </div>

                      {/* Reported info */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Signalé par: {alert.reportedBy}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateFR(alert.reportedAt)}
                        </div>
                      </div>

                      {/* Verified */}
                      {alert.verifiedAt && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Vérifié par {alert.verifiedBy} le {formatDateFR(alert.verifiedAt)}
                        </div>
                      )}

                      {/* Expand for response actions */}
                      {alert.responseActions.length > 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                          >
                            {isExpanded ? 'Masquer les actions' : `Voir les ${alert.responseActions.length} action(s) de réponse`}
                          </Button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-1 pt-1">
                                  {alert.responseActions.map((action, ai) => (
                                    <div key={ai} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                      <span>{action}</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <Separator />

          {/* Diseases under surveillance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-emerald-600" />
                Maladies sous surveillance mTrac
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {MTRAC_DISEASES.map((disease) => {
                  const hasActiveAlert = demoMTracAlerts.some((a) => a.disease === disease)
                  return (
                    <Badge
                      key={disease}
                      variant={hasActiveAlert ? 'outline' : 'secondary'}
                      className={
                        hasActiveAlert
                          ? 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800'
                          : ''
                      }
                    >
                      {hasActiveAlert && <Bell className="h-3 w-3 mr-1" />}
                      {disease}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════
           Tab 5: Historique Sync
           ══════════════════════════════════════════════════════ */}
        <TabsContent value="sync" className="space-y-4 mt-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {demoSyncOperations.length} opération(s) de synchronisation
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Terminées: {demoSyncOperations.filter((s) => s.status === 'completed').length}
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                <XCircle className="h-3 w-3 mr-1" />
                Échouées: {demoSyncOperations.filter((s) => s.status === 'failed').length}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">
                <RefreshCw className="h-3 w-3 mr-1" />
                En cours: {demoSyncOperations.filter((s) => s.status === 'in-progress').length}
              </Badge>
            </div>
          </div>

          {/* Sync operations list */}
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-3 pr-4">
              {demoSyncOperations.map((op, i) => {
                const integration = INTEGRATION_STATUSES.find((int) => int.id === op.integrationId)
                const duration = op.startedAt && op.completedAt
                  ? Math.round((new Date(op.completedAt).getTime() - new Date(op.startedAt).getTime()) / 1000)
                  : null

                return (
                  <motion.div
                    key={op.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, ease: 'easeOut' }}
                  >
                    <Card className={`border-l-4 ${
                      op.status === 'completed' ? 'border-l-green-500' :
                      op.status === 'failed' ? 'border-l-red-500' :
                      op.status === 'in-progress' ? 'border-l-blue-500' :
                      'border-l-gray-400'
                    }`}>
                      <CardContent className="p-4 space-y-3">
                        {/* Header row */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{integration?.icon ?? '🔄'}</span>
                            <span className="font-semibold text-sm">{integration?.name ?? op.integrationId}</span>
                            <Badge variant="secondary" className="text-xs font-mono">{op.id}</Badge>
                          </div>
                          <SyncStatusBadge status={op.status} />
                        </div>

                        {/* Details */}
                        <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={op.type === 'push' ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800' : 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800'}>
                              <ArrowUpDown className="h-3 w-3 mr-1" />
                              {op.type === 'push' ? 'Envoi' : 'Réception'}
                            </Badge>
                            <span className="text-muted-foreground">{op.resourceType}</span>
                            <span className="font-medium">{op.recordCount} enregistrement(s)</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground">{op.details}</p>

                        {/* Timestamps */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Début: {formatDateFR(op.startedAt)}
                          </div>
                          {op.completedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Fin: {formatDateFR(op.completedAt)}
                            </div>
                          )}
                          {duration !== null && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              Durée: {duration}s
                            </div>
                          )}
                        </div>

                        {/* Error message */}
                        {op.errorMessage && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm">
                            <XCircle className="h-4 w-4 flex-shrink-0" />
                            {op.errorMessage}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
