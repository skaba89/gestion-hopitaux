'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import {
  Fingerprint,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Users,
  MapPin,
  QrCode,
  Eye,
  FileText,
  Building2,
  Phone,
  CreditCard,
  TrendingUp,
  Activity,
  ScanLine,
  UserPlus,
  Fingerprint as BiometricIcon,
  BadgeCheck,
  MessageSquare,
  UserCheck,
  HeartHandshake,
  ChevronRight,
  Hash,
  Calendar,
  Map,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import {
  insService,
  generateHealthId,
  validateHealthIdFormat,
  type NationalHealthID,
  type INSVerificationRequest,
  type INSVerificationMethod,
  type INSStatus,
  type INSVerificationStatus,
} from '@/lib/national-health-id'

/* ─────────── Helpers ─────────── */

function getStatusBadge(status: INSStatus) {
  const config: Record<INSStatus, { label: string; className: string }> = {
    active: { label: 'Actif', className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100' },
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
    suspended: { label: 'Suspendu', className: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100' },
    expired: { label: 'Expiré', className: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100' },
    revoked: { label: 'Révoqué', className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100' },
  }
  const c = config[status]
  return <Badge className={c.className}>{c.label}</Badge>
}

function getVerificationStatusBadge(status: INSVerificationStatus) {
  const config: Record<INSVerificationStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
    verified: { label: 'Vérifié', className: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle2 },
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: Clock },
    failed: { label: 'Échoué', className: 'bg-red-100 text-red-700 border-red-200', Icon: XCircle },
    expired: { label: 'Expiré', className: 'bg-gray-100 text-gray-600 border-gray-200', Icon: AlertCircle },
  }
  const c = config[status]
  return (
    <Badge className={c.className}>
      <c.Icon className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  )
}

function getVerificationMethodBadge(method: INSVerificationMethod) {
  const config: Record<INSVerificationMethod, { label: string; className: string; Icon: typeof Fingerprint }> = {
    biometric: { label: 'Biométrique', className: 'bg-purple-100 text-purple-700 border-purple-200', Icon: BiometricIcon },
    document: { label: 'Document', className: 'bg-blue-100 text-blue-700 border-blue-200', Icon: FileText },
    'phone-otp': { label: 'OTP Téléphone', className: 'bg-teal-100 text-teal-700 border-teal-200', Icon: Phone },
    'in-person': { label: 'En personne', className: 'bg-amber-100 text-amber-700 border-amber-200', Icon: UserCheck },
    'asc-vouch': { label: 'Garante ASC', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: HeartHandshake },
  }
  const c = config[method]
  return (
    <Badge variant="outline" className={c.className}>
      <c.Icon className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  )
}

function getVerificationMethodIcon(method: INSVerificationMethod) {
  const icons: Record<INSVerificationMethod, typeof Fingerprint> = {
    biometric: BiometricIcon,
    document: FileText,
    'phone-otp': Phone,
    'in-person': UserCheck,
    'asc-vouch': HeartHandshake,
  }
  return icons[method]
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'text-green-600'
  if (confidence >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

function getConfidenceBg(confidence: number): string {
  if (confidence >= 90) return 'bg-green-500'
  if (confidence >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getHealthZoneLabel(zone: string): string {
  const labels: Record<string, string> = {
    conakry: 'Conakry',
    nzerekore: "N'Zérékoré",
    kindia: 'Kindia',
    kankan: 'Kankan',
    labe: 'Labé',
    mamou: 'Mamou',
    boke: 'Boké',
    faranah: 'Faranah',
    kissidougou: 'Kissidougou',
  }
  return labels[zone] ?? zone
}

/* ─────────── Tab 1: Tableau de bord ─────────── */

function DashboardTab({ stats }: { stats: ReturnType<typeof insService.getStatistics> }) {
  const metricCards = [
    {
      label: 'INS émis',
      value: stats.totalIssued,
      icon: Fingerprint,
      color: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-950',
    },
    {
      label: 'INS actifs',
      value: stats.activeIDs,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Vérifications en attente',
      value: stats.pendingVerifications,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      label: 'Taux de succès vérification',
      value: `${stats.verificationSuccessRate}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Émissions récentes (30j)',
      value: stats.recentIssuances,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Temps moyen de liaison',
      value: stats.averageLinkageTime,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
  ]

  const zoneEntries = Object.entries(stats.byHealthZone)
  const totalZoneRecords = zoneEntries.reduce((sum, [, count]) => sum + count, 0)

  const methodEntries = Object.entries(stats.byVerificationMethod).filter(([, count]) => count > 0)
  const totalMethodRecords = methodEntries.reduce((sum, [, count]) => sum + count, 0)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, ease: 'easeOut' }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown by Health Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ease: 'easeOut' }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-teal-600" />
                Répartition par zone de santé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {zoneEntries.map(([zone, count]) => {
                  const pct = totalZoneRecords > 0 ? Math.round((count / totalZoneRecords) * 100) : 0
                  return (
                    <div key={zone} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-28 truncate">{getHealthZoneLabel(zone)}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {count} ({pct}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Breakdown by Verification Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, ease: 'easeOut' }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-emerald-600" />
                Répartition par méthode de vérification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {methodEntries.map(([method, count]) => {
                  const pct = totalMethodRecords > 0 ? Math.round((count / totalMethodRecords) * 100) : 0
                  const methodKey = method as INSVerificationMethod
                  const Icon = getVerificationMethodIcon(methodKey)
                  return (
                    <div key={method} className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 w-28">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium truncate">
                          {getVerificationMethodBadge(methodKey).props.children?.[1] ?? method}
                        </span>
                      </div>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {count} ({pct}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

/* ─────────── Tab 2: Registre INS ─────────── */

function RegistryTab({
  records,
  onSelectRecord,
  selectedId,
}: {
  records: NationalHealthID[]
  onSelectRecord: (record: NationalHealthID) => void
  selectedId: string | null
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    let result = records
    if (searchQuery.trim()) {
      result = insService.searchRecords(searchQuery)
    }
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter)
    }
    return result
  }, [records, searchQuery, statusFilter])

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par INS, nom, téléphone..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="suspended">Suspendu</SelectItem>
            <SelectItem value="expired">Expiré</SelectItem>
            <SelectItem value="revoked">Révoqué</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="shrink-0">
          {filtered.length} enregistrement(s)
        </Badge>
      </div>

      {/* Records List */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
          {filtered.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ease: 'easeOut' }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                  selectedId === record.id
                    ? 'border-l-teal-500 ring-2 ring-teal-200'
                    : 'border-l-teal-400'
                }`}
                onClick={() => onSelectRecord(record)}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900 dark:to-emerald-900 flex items-center justify-center">
                        <Fingerprint className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {record.firstName} {record.lastName}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">{record.healthId}</p>
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Zone de santé</span>
                      <span className="font-medium">{getHealthZoneLabel(record.healthZone)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Méthode de vérification</span>
                      {getVerificationMethodBadge(record.verificationMethod)}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Établissements liés</span>
                      <span className="font-medium">{record.linkedFacilities.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Dernière vérification</span>
                      <span className="font-medium">{record.lastVerifiedAt}</span>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* Badges Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {getVerificationStatusBadge(record.verificationStatus)}
                    {record.linkedSANTEPCard && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        <CreditCard className="h-3 w-3 mr-1" />
                        SANTEP
                      </Badge>
                    )}
                    {record.biometricHash && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        <BiometricIcon className="h-3 w-3 mr-1" />
                        Biométrie
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

/* ─────────── Tab 3: Vérification ─────────── */

function VerificationTab({
  verificationHistory,
  onVerify,
}: {
  verificationHistory: INSVerificationRequest[]
  onVerify: (healthId: string, method: INSVerificationMethod, requestedBy: string) => INSVerificationRequest
}) {
  const [insInput, setInsInput] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<INSVerificationMethod>('document')
  const [verificationResult, setVerificationResult] = useState<INSVerificationRequest | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleVerify = () => {
    if (!insInput.trim()) return
    setIsValidating(true)
    // Simulate a small delay for UX
    setTimeout(() => {
      const result = onVerify(insInput.trim(), selectedMethod, 'Opérateur — HealthFlow')
      setVerificationResult(result)
      setIsValidating(false)
    }, 800)
  }

  const formatValidation = useMemo(() => {
    if (!insInput.trim()) return null
    return validateHealthIdFormat(insInput.trim())
  }, [insInput])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: 'easeOut' }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ScanLine className="h-5 w-5 text-teal-600" />
                Vérifier une identité INS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* INS Input */}
              <div className="space-y-2">
                <Label htmlFor="ins-verify-input">Identifiant National de Santé</Label>
                <div className="relative">
                  <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ins-verify-input"
                    placeholder="GN-YYYY-MMDD-XX"
                    className="pl-9 font-mono"
                    value={insInput}
                    onChange={(e) => setInsInput(e.target.value)}
                  />
                </div>
                {formatValidation && insInput.trim() && (
                  <div className="space-y-1">
                    {formatValidation.valid ? (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Format valide
                      </p>
                    ) : (
                      <div className="space-y-0.5">
                        {formatValidation.errors.map((err, idx) => (
                          <p key={idx} className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {err}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Method Selection */}
              <div className="space-y-2">
                <Label>Méthode de vérification</Label>
                <Select value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as INSVerificationMethod)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biometric">
                      <div className="flex items-center gap-2">
                        <BiometricIcon className="h-4 w-4" />
                        Biométrique
                      </div>
                    </SelectItem>
                    <SelectItem value="document">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Document
                      </div>
                    </SelectItem>
                    <SelectItem value="phone-otp">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        OTP Téléphone
                      </div>
                    </SelectItem>
                    <SelectItem value="in-person">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        En personne
                      </div>
                    </SelectItem>
                    <SelectItem value="asc-vouch">
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="h-4 w-4" />
                        Garante ASC
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verify Button */}
              <Button
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                onClick={handleVerify}
                disabled={!insInput.trim() || isValidating}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4 mr-2" />
                    Vérifier l&apos;identité
                  </>
                )}
              </Button>

              {/* Result */}
              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ease: 'easeOut' }}
                >
                  <Separator className="my-3" />
                  <div className={`p-4 rounded-lg border ${
                    verificationResult.status === 'verified'
                      ? 'bg-green-50 dark:bg-green-950 border-green-200'
                      : verificationResult.status === 'pending'
                      ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200'
                      : 'bg-red-50 dark:bg-red-950 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {verificationResult.status === 'verified' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : verificationResult.status === 'pending' ? (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-semibold text-sm">
                          {verificationResult.status === 'verified'
                            ? 'Identité vérifiée'
                            : verificationResult.status === 'pending'
                            ? 'Vérification en attente'
                            : 'Vérification échouée'}
                        </span>
                      </div>
                      {getVerificationStatusBadge(verificationResult.status)}
                    </div>

                    {verificationResult.result && (
                      <div className="space-y-2">
                        {/* Confidence Score */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Score de confiance</span>
                          <span className={`text-lg font-bold ${getConfidenceColor(verificationResult.result.confidence)}`}>
                            {verificationResult.result.confidence}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${getConfidenceBg(verificationResult.result.confidence)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${verificationResult.result.confidence}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>

                        {/* Matched Fields */}
                        {verificationResult.result.matchedFields.length > 0 && (
                          <div>
                            <p className="text-xs text-green-600 font-medium mb-1">Champs correspondants</p>
                            <div className="flex flex-wrap gap-1">
                              {verificationResult.result.matchedFields.map((field) => (
                                <Badge key={field} className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs">
                                  <CheckCircle className="h-2.5 w-2.5 mr-1" />
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mismatches */}
                        {verificationResult.result.mismatches.length > 0 && (
                          <div>
                            <p className="text-xs text-red-600 font-medium mb-1">Non correspondants</p>
                            <div className="flex flex-wrap gap-1">
                              {verificationResult.result.mismatches.map((field) => (
                                <Badge key={field} className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-xs">
                                  <XCircle className="h-2.5 w-2.5 mr-1" />
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-3">
                      <p>Demandé par: {verificationResult.requestedBy}</p>
                      <p>Date: {new Date(verificationResult.requestedAt).toLocaleString('fr-FR')}</p>
                      {verificationResult.completedAt && (
                        <p>Complété: {new Date(verificationResult.completedAt).toLocaleString('fr-FR')}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: 'easeOut' }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-blue-600" />
                Historique des vérifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-3 pr-4">
                  {verificationHistory.map((req, i) => (
                    <motion.div
                      key={req.id}
                      className="p-3 rounded-lg border"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, ease: 'easeOut' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-medium">{req.healthId}</span>
                        </div>
                        {getVerificationStatusBadge(req.status)}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        {getVerificationMethodBadge(req.method)}
                      </div>

                      {req.result && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Confiance</span>
                            <span className={`font-semibold ${getConfidenceColor(req.result.confidence)}`}>
                              {req.result.confidence}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getConfidenceBg(req.result.confidence)}`}
                              style={{ width: `${req.result.confidence}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        <p>Par: {req.requestedBy}</p>
                        <p>{new Date(req.requestedAt).toLocaleString('fr-FR')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

/* ─────────── Tab 4: Émettre INS ─────────── */

function IssueINSTab({ onIssued }: { onIssued: () => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'M' as 'M' | 'F',
    phone: '',
    address: '',
    birthPlace: '',
    healthZone: 'conakry',
    verificationMethod: 'document' as INSVerificationMethod,
  })
  const [isIssuing, setIsIssuing] = useState(false)
  const [issuedId, setIssuedId] = useState<string | null>(null)

  const generatedHealthId = useMemo(() => {
    if (form.firstName && form.lastName && form.dateOfBirth) {
      return generateHealthId(form.dateOfBirth, form.firstName, form.lastName)
    }
    return null
  }, [form.firstName, form.lastName, form.dateOfBirth])

  const formatValidation = useMemo(() => {
    if (!generatedHealthId) return null
    return validateHealthIdFormat(generatedHealthId)
  }, [generatedHealthId])

  const isFormValid = form.firstName && form.lastName && form.dateOfBirth && form.phone && form.address && form.birthPlace

  const handleIssue = () => {
    if (!isFormValid || !generatedHealthId) return
    setIsIssuing(true)
    setTimeout(() => {
      setIssuedId(generatedHealthId)
      setIsIssuing(false)
      onIssued()
    }, 1200)
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: 'easeOut' }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-5 w-5 text-teal-600" />
                Nouvel Identifiant National de Santé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ins-firstname">Prénom</Label>
                  <Input
                    id="ins-firstname"
                    placeholder="Prénom"
                    value={form.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ins-lastname">Nom</Label>
                  <Input
                    id="ins-lastname"
                    placeholder="Nom de famille"
                    value={form.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                  />
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ins-dob">Date de naissance</Label>
                  <Input
                    id="ins-dob"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sexe</Label>
                  <Select value={form.gender} onValueChange={(v) => updateField('gender', v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="ins-phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ins-phone"
                    placeholder="+224 6XX XX XX XX"
                    className="pl-9"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="ins-address">Adresse</Label>
                <Input
                  id="ins-address"
                  placeholder="Adresse de résidence"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>

              {/* Birth Place & Health Zone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ins-birthplace">Lieu de naissance</Label>
                  <Input
                    id="ins-birthplace"
                    placeholder="Ville de naissance"
                    value={form.birthPlace}
                    onChange={(e) => updateField('birthPlace', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zone de santé</Label>
                  <Select value={form.healthZone} onValueChange={(v) => updateField('healthZone', v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conakry">Conakry</SelectItem>
                      <SelectItem value="nzerekore">N'Zérékoré</SelectItem>
                      <SelectItem value="kindia">Kindia</SelectItem>
                      <SelectItem value="kankan">Kankan</SelectItem>
                      <SelectItem value="labe">Labé</SelectItem>
                      <SelectItem value="mamou">Mamou</SelectItem>
                      <SelectItem value="boke">Boké</SelectItem>
                      <SelectItem value="faranah">Faranah</SelectItem>
                      <SelectItem value="kissidougou">Kissidougou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Verification Method */}
              <div className="space-y-2">
                <Label>Méthode de vérification</Label>
                <Select value={form.verificationMethod} onValueChange={(v) => updateField('verificationMethod', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biometric">Biométrique</SelectItem>
                    <SelectItem value="document">Document d&apos;identité</SelectItem>
                    <SelectItem value="phone-otp">OTP Téléphone</SelectItem>
                    <SelectItem value="in-person">En personne</SelectItem>
                    <SelectItem value="asc-vouch">Garante ASC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <Button
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                onClick={handleIssue}
                disabled={!isFormValid || isIssuing}
              >
                {isIssuing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Émission en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Émettre l&apos;INS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: 'easeOut' }}
        >
          <div className="space-y-6">
            {/* Auto-generated Health ID Preview */}
            <Card className="border-2 border-dashed border-teal-300 dark:border-teal-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <QrCode className="h-5 w-5 text-teal-600" />
                  Aperçu de l&apos;INS
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedHealthId ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 p-6 rounded-xl text-center">
                      <p className="text-xs text-teal-600 font-semibold mb-1">Identité Nationale de Santé</p>
                      <p className="text-3xl font-bold font-mono tracking-wider bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        {generatedHealthId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        République de Guinée — Direction Nationale de la Santé
                      </p>
                    </div>

                    {/* Format Validation */}
                    {formatValidation && (
                      <div>
                        {formatValidation.valid ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Format INS valide — conforme au standard GN-YYYY-MMDD-XX
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {formatValidation.errors.map((err, idx) => (
                              <p key={idx} className="text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {err}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summary */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          Nom complet
                        </span>
                        <span className="font-medium">{form.firstName} {form.lastName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Date de naissance
                        </span>
                        <span className="font-medium">{form.dateOfBirth || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5" />
                          Sexe
                        </span>
                        <span className="font-medium">{form.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Map className="h-3.5 w-3.5" />
                          Zone de santé
                        </span>
                        <span className="font-medium">{getHealthZoneLabel(form.healthZone)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5" />
                          Vérification
                        </span>
                        {getVerificationMethodBadge(form.verificationMethod)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Fingerprint className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Remplissez le formulaire pour voir</p>
                    <p className="text-sm">l&apos;aperçu de l&apos;Identité Nationale de Santé</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Success Card */}
            {issuedId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ease: 'easeOut' }}
              >
                <Card className="border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-2">
                      INS émise avec succès !
                    </h3>
                    <p className="text-2xl font-bold font-mono text-green-800 dark:text-green-300 mb-2">
                      {issuedId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      L&apos;Identité Nationale de Santé a été enregistrée dans le système.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 border-green-300 text-green-700 hover:bg-green-100"
                      onClick={() => {
                        setIssuedId(null)
                        setForm({
                          firstName: '',
                          lastName: '',
                          dateOfBirth: '',
                          gender: 'M',
                          phone: '',
                          address: '',
                          birthPlace: '',
                          healthZone: 'conakry',
                          verificationMethod: 'document',
                        })
                      }}
                    >
                      Émettre un autre INS
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* INS Format Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BadgeCheck className="h-5 w-5 text-emerald-600" />
                  Format de l&apos;INS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <p className="font-mono text-lg font-bold tracking-wider">GN-YYYY-MMDD-XX</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-start gap-2 p-2 rounded border">
                      <span className="font-mono text-teal-600 font-bold shrink-0">GN</span>
                      <span className="text-muted-foreground">Préfixe national Guinée</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded border">
                      <span className="font-mono text-teal-600 font-bold shrink-0">YYYY</span>
                      <span className="text-muted-foreground">Année de naissance</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded border">
                      <span className="font-mono text-teal-600 font-bold shrink-0">MMDD</span>
                      <span className="text-muted-foreground">Mois et jour de naissance</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded border">
                      <span className="font-mono text-teal-600 font-bold shrink-0">XX</span>
                      <span className="text-muted-foreground">Initiales (prénom + nom)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ─────────── Audit Trail Dialog ─────────── */

function AuditTrailDialog({ record }: { record: NationalHealthID }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Eye className="h-3 w-3 mr-1" />
          Piste d&apos;audit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            Piste d&apos;audit — {record.healthId}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-3 pr-4">
            {record.auditTrail.map((entry, i) => (
              <motion.div
                key={`${entry.action}-${i}`}
                className="flex gap-3 p-3 rounded-lg border"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, ease: 'easeOut' }}
              >
                <div className="mt-0.5">
                  {entry.action.includes('ISSUED') || entry.action.includes('ISSUE') ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                  ) : entry.action.includes('VERIFY') ? (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                  ) : entry.action.includes('LINK') ? (
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-purple-600" />
                    </div>
                  ) : entry.action.includes('PENDING') ? (
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs font-mono">{entry.action}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.performedAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm">{entry.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Par: {entry.performedBy}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

/* ─────────── Record Detail Dialog ─────────── */

function RecordDetailDialog({ record }: { record: NationalHealthID }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-teal-600" />
            Détails INS — {record.healthId}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4 pr-4">
            {/* Identity Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900 dark:to-emerald-900 flex items-center justify-center shrink-0">
                <Fingerprint className="h-7 w-7 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold">{record.firstName} {record.lastName}</h3>
                  {getStatusBadge(record.status)}
                </div>
                <p className="font-mono text-sm text-muted-foreground">{record.healthId}</p>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">ID National</p>
                <p className="font-mono font-medium">{record.nationalId}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Date de naissance</p>
                <p className="font-medium">{record.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Sexe</p>
                <p className="font-medium">{record.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Lieu de naissance</p>
                <p className="font-medium">{record.birthPlace}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Téléphone</p>
                <p className="font-medium">{record.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Adresse</p>
                <p className="font-medium">{record.address}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Zone de santé</p>
                <p className="font-medium">{getHealthZoneLabel(record.healthZone)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Émis le</p>
                <p className="font-medium">{record.issuedAt}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Expire le</p>
                <p className="font-medium">{record.expiresAt}</p>
              </div>
            </div>

            <Separator />

            {/* Verification Info */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-600" />
                Informations de vérification
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Méthode</p>
                  <div className="mt-1">{getVerificationMethodBadge(record.verificationMethod)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Statut</p>
                  <div className="mt-1">{getVerificationStatusBadge(record.verificationStatus)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Dernière vérification</p>
                  <p className="font-medium">{record.lastVerifiedAt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Tentatives</p>
                  <p className="font-medium">{record.verificationAttempts}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Linked Facilities */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Établissements liés ({record.linkedFacilities.length})
              </h4>
              <div className="space-y-2">
                {record.linkedFacilities.map((facility) => (
                  <div key={facility.facilityId} className="flex items-center justify-between p-2 rounded border text-sm">
                    <div>
                      <p className="font-medium">{facility.facilityName}</p>
                      <p className="text-xs text-muted-foreground">ID local: {facility.localPatientId}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Lié le {facility.linkedAt}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Linked SANTEP */}
            {record.linkedSANTEPCard && (
              <>
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    Carte SANTEP
                  </h4>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {record.linkedSANTEPCard}
                  </Badge>
                </div>
                <Separator />
              </>
            )}

            {/* Audit Trail */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-600" />
                Piste d&apos;audit
              </h4>
              <div className="space-y-2">
                {record.auditTrail.map((entry, i) => (
                  <div key={`${entry.action}-${i}`} className="p-2 rounded border text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs font-mono">{entry.action}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.performedAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-xs">{entry.details}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Par: {entry.performedBy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

/* ─────────── Main Component ─────────── */

export function NationalHealthIDPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedRecord, setSelectedRecord] = useState<NationalHealthID | null>(null)
  const [records, setRecords] = useState<NationalHealthID[]>(insService.getRecords())
  const [verificationRequests, setVerificationRequests] = useState<INSVerificationRequest[]>(
    insService.getVerificationRequests()
  )

  const stats = useMemo(() => insService.getStatistics(), [records])

  const handleVerify = (healthId: string, method: INSVerificationMethod, requestedBy: string): INSVerificationRequest => {
    const result = insService.verifyIdentity(healthId, method, requestedBy)
    setVerificationRequests(insService.getVerificationRequests())
    setRecords(insService.getRecords())
    return result
  }

  const handleIssued = () => {
    setRecords(insService.getRecords())
    setVerificationRequests(insService.getVerificationRequests())
  }

  const handleSelectRecord = (record: NationalHealthID) => {
    setSelectedRecord(record)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Fingerprint className="h-6 w-6 text-teal-600" />
            INS — Identité Nationale de Santé
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestion des identifiants nationaux de santé — République de Guinée
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-700">
            <Activity className="h-3 w-3 mr-1" /> INS Actif
          </Badge>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-700">
            <Shield className="h-3 w-3 mr-1" /> Conforme DNS
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-700">
            <Users className="h-3 w-3 mr-1" /> {stats.totalIssued} INS
          </Badge>
        </div>
      </div>

      {/* Selected Record Summary */}
      {selectedRecord && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: 'easeOut' }}
        >
          <Card className="border-l-4 border-l-teal-500 bg-gradient-to-r from-teal-50/50 to-emerald-50/50 dark:from-teal-950/30 dark:to-emerald-950/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900 dark:to-emerald-900 flex items-center justify-center">
                    <Fingerprint className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {selectedRecord.firstName} {selectedRecord.lastName}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">{selectedRecord.healthId}</p>
                  </div>
                  {getStatusBadge(selectedRecord.status)}
                  {getVerificationMethodBadge(selectedRecord.verificationMethod)}
                </div>
                <div className="flex items-center gap-2">
                  <AuditTrailDialog record={selectedRecord} />
                  <RecordDetailDialog record={selectedRecord} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
            <Activity className="h-4 w-4" />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="registry" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Registre INS
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-1.5 relative">
            <ScanLine className="h-4 w-4" />
            Vérification
            {stats.pendingVerifications > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-white text-xs font-bold">
                {stats.pendingVerifications}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="issue" className="flex items-center gap-1.5">
            <UserPlus className="h-4 w-4" />
            Émettre INS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <DashboardTab stats={stats} />
        </TabsContent>

        <TabsContent value="registry" className="mt-4">
          <RegistryTab
            records={records}
            onSelectRecord={handleSelectRecord}
            selectedId={selectedRecord?.id ?? null}
          />
        </TabsContent>

        <TabsContent value="verification" className="mt-4">
          <VerificationTab
            verificationHistory={verificationRequests}
            onVerify={handleVerify}
          />
        </TabsContent>

        <TabsContent value="issue" className="mt-4">
          <IssueINSTab onIssued={handleIssued} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
