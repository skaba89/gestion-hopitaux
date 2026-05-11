'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  MapPin,
  Send,
  Bell,
  Activity,
  Lock,
  Clock,
  Plane,
  Flag,
  Building2,
  Zap,
} from 'lucide-react'
import {
  crossBorderService,
  ECOWAS_COUNTRIES,
  type CrossBorderExchange,
  type ECOWASHealthAlert,
} from '@/lib/cross-border-exchange'

/* ─────────── Helper: border status badge ─────────── */

function BorderStatusBadge({ status }: { status: 'open' | 'restricted' | 'closed' }) {
  const config = {
    open: { label: 'Ouvert', className: 'bg-green-100 text-green-700 border-green-300' },
    restricted: { label: 'Restreint', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    closed: { label: 'Ferme', className: 'bg-red-100 text-red-700 border-red-300' },
  }
  const c = config[status]
  return (
    <Badge variant="outline" className={c.className}>
      {status === 'open' && <CheckCircle2 className="h-3 w-3 mr-1" />}
      {status === 'restricted' && <AlertTriangle className="h-3 w-3 mr-1" />}
      {status === 'closed' && <XCircle className="h-3 w-3 mr-1" />}
      {c.label}
    </Badge>
  )
}

/* ─────────── Helper: agreement status badge ─────────── */

function AgreementStatusBadge({ status }: { status: 'active' | 'pending' | 'none' }) {
  const config = {
    active: { label: 'Actif', className: 'bg-green-100 text-green-700 border-green-300' },
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    none: { label: 'Aucun', className: 'bg-red-100 text-red-700 border-red-300' },
  }
  const c = config[status]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

/* ─────────── Helper: alert level badge ─────────── */

function AlertLevelBadge({ level }: { level: 'information' | 'warning' | 'emergency' }) {
  const config = {
    information: { label: 'Information', className: 'bg-blue-100 text-blue-700 border-blue-300', Icon: Bell },
    warning: { label: 'Alerte', className: 'bg-amber-100 text-amber-700 border-amber-300', Icon: AlertTriangle },
    emergency: { label: 'Urgence', className: 'bg-red-100 text-red-700 border-red-300', Icon: AlertTriangle },
  }
  const c = config[level]
  return (
    <Badge variant="outline" className={c.className}>
      <c.Icon className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  )
}

/* ─────────── Helper: risk level badge ─────────── */

function RiskLevelBadge({ level }: { level: 'low' | 'moderate' | 'high' | 'critical' }) {
  const config = {
    low: { label: 'Faible', className: 'bg-green-100 text-green-700 border-green-300', pulse: false },
    moderate: { label: 'Modere', className: 'bg-yellow-100 text-yellow-700 border-yellow-300', pulse: false },
    high: { label: 'Eleve', className: 'bg-orange-100 text-orange-700 border-orange-300', pulse: true },
    critical: { label: 'Critique', className: 'bg-red-100 text-red-700 border-red-300', pulse: true },
  }
  const c = config[level]
  return (
    <Badge variant="outline" className={`${c.className} ${c.pulse ? 'animate-pulse' : ''}`}>
      {c.label}
    </Badge>
  )
}

/* ─────────── Helper: purpose badge ─────────── */

function PurposeBadge({ purpose }: { purpose: 'treatment' | 'public-health' | 'referral' | 'repatriation' }) {
  const config = {
    treatment: { label: 'Traitement', className: 'bg-blue-100 text-blue-700 border-blue-300' },
    'public-health': { label: 'Sante publique', className: 'bg-orange-100 text-orange-700 border-orange-300' },
    referral: { label: 'Reference', className: 'bg-purple-100 text-purple-700 border-purple-300' },
    repatriation: { label: 'Rapatriement', className: 'bg-red-100 text-red-700 border-red-300' },
  }
  const c = config[purpose]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

/* ─────────── Helper: exchange status badge ─────────── */

function ExchangeStatusBadge({ status }: { status: CrossBorderExchange['status'] }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    authorized: { label: 'Autorise', className: 'bg-blue-100 text-blue-700 border-blue-300' },
    'in-transit': { label: 'En transit', className: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    delivered: { label: 'Livre', className: 'bg-green-100 text-green-700 border-green-300' },
    acknowledged: { label: 'Acquitte', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    rejected: { label: 'Rejete', className: 'bg-red-100 text-red-700 border-red-300' },
    failed: { label: 'Echoue', className: 'bg-red-100 text-red-700 border-red-300' },
  }
  const c = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 border-gray-300' }
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

/* ─────────── Helper: data category label ─────────── */

function DataCategoryBadge({ category }: { category: string }) {
  const labels: Record<string, string> = {
    demographic: 'Demographique',
    clinical: 'Clinique',
    laboratory: 'Laboratoire',
    pharmacy: 'Pharmacie',
    vaccination: 'Vaccination',
    epidemiological: 'Epidemiologique',
    insurance: 'Assurance',
  }
  return <Badge variant="secondary" className="text-xs">{labels[category] ?? category}</Badge>
}

/* ─────────── Helper: protocol badge ─────────── */

function ProtocolBadge({ protocol }: { protocol: string }) {
  const colors: Record<string, string> = {
    'FHIR-R4': 'bg-blue-100 text-blue-700 border-blue-300',
    'HL7v2': 'bg-purple-100 text-purple-700 border-purple-300',
    'IHE-XDS': 'bg-teal-100 text-teal-700 border-teal-300',
    'WHO-IDSR': 'bg-orange-100 text-orange-700 border-orange-300',
  }
  return (
    <Badge variant="outline" className={colors[protocol] ?? 'bg-gray-100 text-gray-700 border-gray-300'}>
      {protocol}
    </Badge>
  )
}

/* ─────────── Helper: encryption badge ─────────── */

function EncryptionBadge({ encryption }: { encryption: 'AES-256' | 'TLS-1.3' }) {
  return (
    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
      <Lock className="h-3 w-3 mr-1" />
      {encryption}
    </Badge>
  )
}

/* ─────────── Helper: format relative date ─────────── */

function formatRelativeDate(iso: string | null): string {
  if (!iso) return 'Jamais'
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return "Moins d'1h"
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}j`
  const months = Math.floor(days / 30)
  return `${months}mois`
}

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */

export function CrossBorderExchange() {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedExchange, setExpandedExchange] = useState<string | null>(null)

  const metrics = crossBorderService.getMetrics()
  const exchanges = crossBorderService.getExchanges()
  const alerts = crossBorderService.getAlerts()
  const countries = crossBorderService.getCountries()

  /* ──────── Tab 1: Vue d'ensemble ──────── */

  const overviewStats = [
    { label: 'Total echanges', value: metrics.totalExchanges, icon: ArrowRightLeft, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Reussis', value: metrics.successfulExchanges, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'En attente', value: metrics.pendingExchanges, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Echoues', value: metrics.failedExchanges, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Accords actifs', value: metrics.activeAgreements, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Alertes actives', value: metrics.healthAlertsActive, icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Temps moyen', value: metrics.averageProcessingTime, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  /* ──────── Tab 2: Exchanges ──────── */

  const directionConfig = {
    outbound: { label: 'Sortant', className: 'bg-blue-100 text-blue-700 border-blue-300', Icon: Send },
    inbound: { label: 'Entrant', className: 'bg-green-100 text-green-700 border-green-300', Icon: ArrowRightLeft },
  }

  /* ──────── Tab 4: Security data ──────── */

  const encryptionStandards = [
    { standard: 'AES-256', description: 'Chiffrement des donnees au repos', status: 'Actif', scope: 'Tous les echanges' },
    { standard: 'TLS-1.3', description: 'Chiffrement des donnees en transit', status: 'Actif', scope: 'Tous les echanges' },
    { standard: 'SHA-256', description: 'Hachage des identifiants patient', status: 'Actif', scope: 'Donnees demographiques' },
    { standard: 'RSA-4096', description: 'Signature numerique des consentements', status: 'Actif', scope: 'Documents de consentement' },
  ]

  const retentionPolicies = [
    { category: 'Donnees cliniques', period: '90 jours', regulation: 'Accord CEDEAO', icon: Activity },
    { category: 'Donnees epidemiologiques', period: '365 jours', regulation: 'OMS - RSI 2005', icon: Globe },
    { category: 'Donnees vaccinales', period: 'Permanant', regulation: 'Reglement national', icon: Shield },
    { category: 'Donnees assurance', period: '180 jours', regulation: 'Accord bilatéral', icon: Building2 },
  ]

  const consentRequirements = [
    { requirement: 'Consentement explicite du patient', mandatory: true, regulation: 'Loi guinenne LPD' },
    { requirement: 'Notification du pays destinataire', mandatory: true, regulation: 'Accord CEDEAO Art.12' },
    { requirement: 'Verification identite praticien', mandatory: true, regulation: 'Reglement interne' },
    { requirement: 'Enregistrement audit trail', mandatory: true, regulation: 'ISO 27799' },
    { requirement: 'Droit de retrait du consentement', mandatory: true, regulation: 'Loi guinenne LPD Art.8' },
    { requirement: 'Notification de violation de donnees', mandatory: true, regulation: 'RSI 2005 OMS' },
  ]

  const borderProtocols = [
    { protocol: 'FHIR R4 International Patient Summary', status: 'Deploye', countries: 4 },
    { protocol: 'WHO IDSR Cross-Border Notification', status: 'Deploye', countries: 3 },
    { protocol: 'IHE XDS Document Sharing', status: 'En developpement', countries: 1 },
    { protocol: 'HL7 v2 ADT Messaging', status: 'Deploye', countries: 2 },
  ]

  /* ═══════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-emerald-600" />
            Echanges Transfrontaliers CEDEAO
          </h2>
          <p className="text-muted-foreground mt-1">
            Plateforme regionale d&apos;echange de donnees de sante — Guinee &amp; CEDEAO
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
            <Activity className="h-3 w-3 mr-1" /> CEDEAO Active
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Shield className="h-3 w-3 mr-1" /> Conforme LPD
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="exchanges">Echanges</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="security">Securite</TabsTrigger>
        </TabsList>

        {/* ────── Tab 1: Vue d'ensemble ────── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {overviewStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
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

          {/* Country cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-emerald-600" />
                Pays CEDEAO partenaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {countries.map((country, i) => (
                  <motion.div
                    key={country.code}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="h-full border-l-4"
                      style={{
                        borderLeftColor:
                          country.borderStatus === 'open'
                            ? '#22c55e'
                            : country.borderStatus === 'restricted'
                            ? '#eab308'
                            : '#ef4444',
                      }}
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Country header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border">
                              {country.code}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{country.nameFr}</p>
                              <p className="text-xs text-muted-foreground">{country.healthMinistry}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Status row */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Statut frontalier</span>
                          <BorderStatusBadge status={country.borderStatus} />
                        </div>

                        {/* Exchange info */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Dernier echange</span>
                          <span className="text-xs font-medium">{formatRelativeDate(country.lastExchange)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Total echanges</span>
                          <span className="text-xs font-semibold">{country.totalExchanges}</span>
                        </div>

                        {/* Agreement */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Accord bilatéral</span>
                          <AgreementStatusBadge status={country.agreementStatus} />
                        </div>

                        {/* Protocols */}
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">Protocoles supportes</span>
                          <div className="flex flex-wrap gap-1">
                            {country.supportedProtocols.map((p) => (
                              <ProtocolBadge key={p} protocol={p} />
                            ))}
                          </div>
                        </div>

                        {/* Alert count */}
                        {country.healthAlertCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Bell className="h-3 w-3" />
                            <span>{country.healthAlertCount} alerte(s) sanitaire(s)</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────── Tab 2: Echanges ────── */}
        <TabsContent value="exchanges" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {exchanges.length} echange(s) transfrontalier(s)
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                <Send className="h-3 w-3 mr-1" />
                Sortants: {exchanges.filter((e) => e.direction === 'outbound').length}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <ArrowRightLeft className="h-3 w-3 mr-1" />
                Entrants: {exchanges.filter((e) => e.direction === 'inbound').length}
              </Badge>
            </div>
          </div>

          <ScrollArea className="max-h-[600px]">
            <div className="space-y-3 pr-4">
              {exchanges.map((exchange, i) => {
                const dir = directionConfig[exchange.direction]
                const isExpanded = expandedExchange === exchange.id

                return (
                  <motion.div
                    key={exchange.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`transition-all ${isExpanded ? 'ring-2 ring-emerald-300' : ''}`}>
                      <CardContent className="p-4 space-y-3">
                        {/* Header row */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={dir.className}>
                              <dir.Icon className="h-3 w-3 mr-1" />
                              {dir.label}
                            </Badge>
                            <span className="text-xs font-mono text-muted-foreground">{exchange.id}</span>
                          </div>
                          <ExchangeStatusBadge status={exchange.status} />
                        </div>

                        {/* Source / Target */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{exchange.sourceFacility}</span>
                            <Badge variant="secondary" className="text-xs">{exchange.sourceCountryCode}</Badge>
                          </div>
                          <Plane className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{exchange.targetFacility}</span>
                            <Badge variant="secondary" className="text-xs">{exchange.targetCountryCode}</Badge>
                          </div>
                        </div>

                        {/* Patient */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-sm">
                            Patient: <span className="font-medium">{exchange.patientName}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {exchange.sentAt ? new Date(exchange.sentAt).toLocaleString('fr-FR') : 'Non envoye'}
                            </span>
                          </div>
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap gap-1">
                          {exchange.dataCategories.map((cat) => (
                            <DataCategoryBadge key={cat} category={cat} />
                          ))}
                          <ProtocolBadge protocol={exchange.protocol} />
                          <EncryptionBadge encryption={exchange.dataEncryption} />
                          <PurposeBadge purpose={exchange.purpose} />
                        </div>

                        {/* Expand button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setExpandedExchange(isExpanded ? null : exchange.id)}
                        >
                          {isExpanded ? 'Masquer le resume clinique' : 'Voir le resume clinique'}
                        </Button>

                        {/* Expandable clinical summary */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Resume clinique</p>
                                <p className="text-sm">{exchange.clinicalSummary}</p>
                                <Separator />
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Consentement: </span>
                                    <span className="font-medium">{exchange.consentId}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Autorise par: </span>
                                    <span className="font-medium">{exchange.authorizedBy}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Retention: </span>
                                    <span className="font-medium">{exchange.retentionDays} jours</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Expiration: </span>
                                    <span className="font-medium">{new Date(exchange.expiresAt).toLocaleDateString('fr-FR')}</span>
                                  </div>
                                </div>
                                {exchange.errorMessage && (
                                  <div className="flex items-center gap-1 text-xs text-red-600">
                                    <XCircle className="h-3 w-3" />
                                    {exchange.errorMessage}
                                  </div>
                                )}
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

        {/* ────── Tab 3: Alertes ────── */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {alerts.length} alerte(s) sanitaire(s) CEDEAO active(s)
            </p>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {alerts.filter((a) => a.alertLevel === 'emergency').length} urgence(s)
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
              >
                <Card className={`h-full border-l-4 ${
                  alert.alertLevel === 'emergency'
                    ? 'border-l-red-500'
                    : alert.alertLevel === 'warning'
                    ? 'border-l-amber-500'
                    : 'border-l-blue-500'
                }`}>
                  <CardContent className="p-4 space-y-3">
                    {/* Disease & Level */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className={`h-5 w-5 ${
                          alert.alertLevel === 'emergency'
                            ? 'text-red-600'
                            : alert.alertLevel === 'warning'
                            ? 'text-amber-600'
                            : 'text-blue-600'
                        }`} />
                        <span className="font-semibold">{alert.disease}</span>
                        <Badge variant="secondary" className="text-xs font-mono">{alert.diseaseCode}</Badge>
                      </div>
                      <AlertLevelBadge level={alert.alertLevel} />
                    </div>

                    <Separator />

                    {/* Source country */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Pays source</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm font-medium">{alert.sourceCountry}</span>
                        <Badge variant="secondary" className="text-xs">{alert.sourceCountryCode}</Badge>
                      </div>
                    </div>

                    {/* Affected regions */}
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Regions affectees</span>
                      <div className="flex flex-wrap gap-1">
                        {alert.affectedRegions.map((region) => (
                          <Badge key={region} variant="outline" className="text-xs">
                            <MapPin className="h-2.5 w-2.5 mr-1" />
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Case / Death counts */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-orange-700 dark:text-orange-400">{alert.caseCount}</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">Cas confirmes</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-red-700 dark:text-red-400">{alert.deathCount}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Deces</p>
                      </div>
                    </div>

                    {/* WHO notification */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Notification OMS</span>
                      {alert.whoNotified ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Notifiee
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                          Non notifiee
                        </Badge>
                      )}
                    </div>

                    {/* Guinea risk */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Risque pour la Guinee</span>
                      <RiskLevelBadge level={alert.guineaRiskLevel} />
                    </div>

                    {/* Response measures */}
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Mesures de response</span>
                      <div className="flex flex-wrap gap-1">
                        {alert.responseMeasures.map((measure) => (
                          <Badge key={measure} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">
                            <Shield className="h-2.5 w-2.5 mr-1" />
                            {measure}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Emise le {new Date(alert.issuedAt).toLocaleString('fr-FR')} — Expire le {new Date(alert.expiresAt).toLocaleDateString('fr-FR')}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ────── Tab 4: Securite ────── */}
        <TabsContent value="security" className="space-y-4 mt-4">
          {/* Encryption standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-600" />
                Standards de chiffrement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {encryptionStandards.map((enc) => (
                  <div key={enc.standard} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                      <Lock className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{enc.standard}</span>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                          {enc.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{enc.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Portee: {enc.scope}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Politiques de retention des donnees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {retentionPolicies.map((policy) => (
                  <div key={policy.category} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <policy.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{policy.category}</p>
                      <p className="text-xs text-muted-foreground">
                        Duree: <span className="font-medium text-foreground">{policy.period}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reglementation: {policy.regulation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Consent tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Exigences de consentement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consentRequirements.map((req) => (
                  <div key={req.requirement} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {req.mandatory ? (
                        <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-sm">{req.requirement}</span>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {req.regulation}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Border protocols */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-600" />
                Protocoles transfrontaliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {borderProtocols.map((bp) => (
                  <div key={bp.protocol} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <ArrowRightLeft className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{bp.protocol}</p>
                        <p className="text-xs text-muted-foreground">
                          Deploie dans {bp.countries} pays CEDEAO
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        bp.status === 'Deploye'
                          ? 'bg-green-100 text-green-700 border-green-300 text-xs'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-300 text-xs'
                      }
                    >
                      {bp.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
