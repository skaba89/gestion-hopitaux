'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Database,
  Eye,
  ArrowRightLeft,
  TrendingUp,
  UserCheck,
  Fingerprint,
} from 'lucide-react'
import {
  mpiService,
  MPI_MATCH_RULES,
  type GoldenRecord,
  type MPIMatchResult,
} from '@/lib/master-patient-index'

/* ─────────── Helpers ─────────── */

function getDataQualityBadge(quality: string) {
  switch (quality) {
    case 'excellent':
      return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Excellent</Badge>
    case 'good':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Bon</Badge>
    case 'fair':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Moyen</Badge>
    case 'poor':
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Faible</Badge>
    default:
      return <Badge variant="outline">{quality}</Badge>
  }
}

function getConfidenceBadge(confidence: 'high' | 'medium' | 'low') {
  switch (confidence) {
    case 'high':
      return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Elevee</Badge>
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Moyenne</Badge>
    case 'low':
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Faible</Badge>
  }
}

function getSourceBadge(source: string) {
  switch (source) {
    case 'local':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Local</Badge>
    case 'hie':
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">HIE</Badge>
    case 'registry':
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">Registre</Badge>
    case 'santep':
      return <Badge className="bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-100">SANTEP</Badge>
    case 'dhis2':
      return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">DHIS2</Badge>
    case 'asc':
      return <Badge className="bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-100">ASC</Badge>
    default:
      return <Badge variant="outline">{source}</Badge>
  }
}

function getMatchStatusIcon(status: string) {
  switch (status) {
    case 'auto-merged':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'confirmed':
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />
    case 'manual-review':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'potential':
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
    default:
      return null
  }
}

function getMatchStatusLabel(status: string) {
  switch (status) {
    case 'auto-merged':
      return 'Fusion auto'
    case 'confirmed':
      return 'Confirme'
    case 'manual-review':
      return 'Revision manuelle'
    case 'rejected':
      return 'Rejete'
    case 'potential':
      return 'Potentiel'
    default:
      return status
  }
}

function getAlgorithmLabel(algorithm: string) {
  switch (algorithm) {
    case 'exact':
      return 'Exact'
    case 'deterministic':
      return 'Deterministe'
    case 'probabilistic':
      return 'Probabiliste'
    case 'identifier':
      return 'Identifiant'
    default:
      return algorithm
  }
}

/* ─────────── Sub-components ─────────── */

function OverviewTab({ metrics }: { metrics: ReturnType<typeof mpiService.getMetrics> }) {
  const metricCards = [
    {
      label: 'Enregistrements dor',
      value: metrics.totalGoldenRecords,
      icon: Fingerprint,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Enregistrements source',
      value: metrics.totalSourceRecords,
      icon: Database,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Revision en attente',
      value: metrics.pendingReviews,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Fusions automatiques',
      value: metrics.autoMergedRecords,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Taux de doublons',
      value: `${metrics.duplicateRate}%`,
      icon: ArrowRightLeft,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Precision de correspondance',
      value: `${metrics.matchAccuracy}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  const qualityDistribution = [
    { key: 'excellent', label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' },
    { key: 'good', label: 'Bon', color: 'bg-blue-500', textColor: 'text-blue-700' },
    { key: 'fair', label: 'Moyen', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { key: 'poor', label: 'Faible', color: 'bg-red-500', textColor: 'text-red-700' },
  ]

  const totalQuality = Object.values(metrics.dataQualityDistribution).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
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

      {/* Data Quality Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-amber-600" />
              Distribution de la qualite des donnees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qualityDistribution.map((q) => {
                const count = metrics.dataQualityDistribution[q.key] || 0
                const pct = totalQuality > 0 ? Math.round((count / totalQuality) * 100) : 0
                return (
                  <div key={q.key} className="flex items-center gap-3">
                    <span className={`text-sm font-medium w-24 ${q.textColor}`}>{q.label}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${q.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.6 }}
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

      {/* Match Rules Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Fingerprint className="h-5 w-5 text-amber-600" />
              Regles de correspondance MPI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Champ</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Algorithme</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Poids</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Seuil</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {MPI_MATCH_RULES.map((rule, i) => (
                    <motion.tr
                      key={rule.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.05 }}
                    >
                      <td className="py-2 px-3">
                        <code className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                          {rule.field}
                        </code>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-xs">
                          {getAlgorithmLabel(rule.algorithm)}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${rule.weight * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{(rule.weight * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-xs">{(rule.threshold * 100).toFixed(0)}%</span>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground text-xs">{rule.description}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function RegistryTab({
  records,
  onSelect,
  selectedId,
}: {
  records: GoldenRecord[]
  onSelect: (gr: GoldenRecord) => void
  selectedId: string | null
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return records
    return mpiService.searchGoldenRecords(searchQuery)
  }, [records, searchQuery])

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, ID national, telephone..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="shrink-0">
          {filtered.length} enregistrement(s)
        </Badge>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
          {filtered.map((gr, i) => (
            <motion.div
              key={gr.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                  selectedId === gr.id
                    ? 'border-l-amber-500 ring-2 ring-amber-200'
                    : 'border-l-amber-400'
                }`}
                onClick={() => onSelect(gr)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Fingerprint className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {gr.firstName} {gr.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{gr.id}</p>
                      </div>
                    </div>
                    {getDataQualityBadge(gr.dataQuality)}
                  </div>

                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ID National</span>
                      <span className="font-mono">{gr.nationalId}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Date de naissance</span>
                      <span>{gr.dateOfBirth}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Enregistrements source</span>
                      <span className="font-medium">{gr.sourceRecords.length}</span>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center gap-2 flex-wrap">
                    {gr.insuranceStatus === 'insured' && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs">
                        Assure
                      </Badge>
                    )}
                    {gr.insuranceStatus === 'uninsured' && (
                      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-xs">
                        Non assure
                      </Badge>
                    )}
                    {gr.insuranceStatus === 'unknown' && (
                      <Badge variant="outline" className="text-xs">
                        Assurance inconnue
                      </Badge>
                    )}
                    {gr.vaccinationStatus === 'complete' && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs">
                        Vaccination complete
                      </Badge>
                    )}
                    {gr.vaccinationStatus === 'partial' && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100 text-xs">
                        Vaccination partielle
                      </Badge>
                    )}
                    {gr.vaccinationStatus === 'unknown' && (
                      <Badge variant="outline" className="text-xs">
                        Vaccination inconnue
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {Array.from(new Set(gr.sourceRecords.map((sr) => sr.source))).map((source) => (
                      <span key={source}>{getSourceBadge(source)}</span>
                    ))}
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

function DetailsTab({ record }: { record: GoldenRecord | null }) {
  if (!record) {
    return (
      <Card className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Selectionnez un enregistrement dore pour voir ses details</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Demographics Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Fingerprint className="h-7 w-7 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">
                    {record.firstName} {record.lastName}
                  </h3>
                  {getDataQualityBadge(record.dataQuality)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">ID Dore</p>
                    <p className="font-mono font-medium">{record.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ID National</p>
                    <p className="font-mono font-medium">{record.nationalId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date de naissance</p>
                    <p className="font-medium">{record.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sexe</p>
                    <p className="font-medium">{record.gender === 'M' ? 'Masculin' : 'Feminin'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telephone</p>
                    <p className="font-medium">{record.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Adresse</p>
                    <p className="font-medium">{record.address}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Groupe sanguin</p>
                    <p className="font-medium">{record.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Visites totales</p>
                    <p className="font-medium">{record.totalVisits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cree le</p>
                    <p className="font-medium">{record.createdAt}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Records Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-5 w-5 text-blue-600" />
                Enregistrements source ({record.sourceRecords.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-80">
                <div className="space-y-2 pr-4">
                  {record.sourceRecords.map((sr, i) => (
                    <motion.div
                      key={sr.patientId}
                      className={`p-3 rounded-lg border ${
                        sr.isPrimary ? 'border-amber-300 bg-amber-50/50' : 'border-border'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {sr.isPrimary && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs">
                              Principal
                            </Badge>
                          )}
                          {getSourceBadge(sr.source)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Confiance:</span>
                          <span className="text-xs font-medium">{(sr.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="text-xs space-y-0.5 text-muted-foreground">
                        <p>Etablissement: {sr.sourceFacility}</p>
                        <p>Systeme: {sr.sourceSystem} | ID local: {sr.localId}</p>
                        <p>Derniere MAJ: {sr.lastUpdated}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Match History */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                Historique des correspondances ({record.matchHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-80">
                {record.matchHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-sm">
                    Aucun historique de correspondance
                  </div>
                ) : (
                  <div className="space-y-2 pr-4">
                    {record.matchHistory.map((mh, i) => (
                      <motion.div
                        key={`${mh.patientId}-${mh.matchedAt}`}
                        className="p-3 rounded-lg border"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getMatchStatusIcon(mh.matchStatus)}
                            <span className="text-sm font-medium font-mono">{mh.patientId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getConfidenceBadge(mh.confidence)}
                            <Badge variant="outline" className="text-xs">
                              Score: {mh.matchScore}%
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>
                            Algorithme: {getAlgorithmLabel(mh.matchAlgorithm)} | Statut: {getMatchStatusLabel(mh.matchStatus)}
                          </p>
                          <p>Date: {new Date(mh.matchedAt).toLocaleDateString('fr-FR')}</p>
                          {mh.reviewedBy && (
                            <p>Revu par: {mh.reviewedBy} le {mh.reviewedAt ? new Date(mh.reviewedAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
                          )}
                        </div>
                        <div className="flex gap-4 mt-2">
                          <div className="text-xs">
                            <span className="text-green-600 font-medium">Correspond:</span>{' '}
                            {mh.matchedFields.join(', ')}
                          </div>
                        </div>
                        {mh.unmatchedFields.length > 0 && (
                          <div className="text-xs mt-0.5">
                            <span className="text-red-600 font-medium">Non correspond:</span>{' '}
                            {mh.unmatchedFields.join(', ')}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Problems */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Problemes actifs ({record.activeProblems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.activeProblems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun probleme actif enregistre</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {record.activeProblems.map((problem) => (
                    <Badge key={problem} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50">
                      {problem}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Allergies */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-red-600" />
                Allergies ({record.allergies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.allergies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune allergie enregistree</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {record.allergies.map((allergy) => (
                    <Badge key={allergy} variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function ReviewsTab({
  pendingReviews,
  onApprove,
  onReject,
}: {
  pendingReviews: MPIMatchResult[]
  onApprove: (goldenRecordId: string, patientId: string) => void
  onReject: (goldenRecordId: string, patientId: string) => void
}) {
  if (pendingReviews.length === 0) {
    return (
      <Card className="flex items-center justify-center min-h-[300px]">
        <div className="text-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Aucune revision en attente</p>
          <p className="text-xs mt-1">Toutes les correspondances ont ete traitees</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pendingReviews.length} correspondance(s) necessitent une revision manuelle
        </p>
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
          En attente
        </Badge>
      </div>

      <div className="space-y-3">
        {pendingReviews.map((mr, i) => (
          <motion.div
            key={`${mr.patientId}-${mr.goldenRecordId}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-l-4 border-l-yellow-400">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-50">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        Patient ID: <span className="font-mono">{mr.patientId}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Enregistrement dore: <span className="font-mono">{mr.goldenRecordId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getConfidenceBadge(mr.confidence)}
                    <Badge variant="outline" className="text-xs">
                      Score: {mr.matchScore}%
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <p className="font-medium text-green-700 mb-1">Champs correspondants</p>
                    <div className="flex flex-wrap gap-1">
                      {mr.matchedFields.map((f) => (
                        <Badge key={f} className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-red-700 mb-1">Champs non correspondants</p>
                    <div className="flex flex-wrap gap-1">
                      {mr.unmatchedFields.length === 0 ? (
                        <span className="text-muted-foreground">Aucun</span>
                      ) : (
                        mr.unmatchedFields.map((f) => (
                          <Badge key={f} className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 text-xs">
                            {f}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mb-3">
                  <p>
                    Algorithme: {getAlgorithmLabel(mr.matchAlgorithm)} | Date: {new Date(mr.matchedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <Separator className="mb-3" />

                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onReject(mr.goldenRecordId, mr.patientId)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onApprove(mr.goldenRecordId, mr.patientId)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ─────────── Main Component ─────────── */

export function MPIDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedRecord, setSelectedRecord] = useState<GoldenRecord | null>(null)
  const [pendingReviews, setPendingReviews] = useState<MPIMatchResult[]>(
    mpiService.getPendingReviews()
  )
  const [records] = useState<GoldenRecord[]>(mpiService.getGoldenRecords())

  const metrics = useMemo(() => mpiService.getMetrics(), [records])

  const handleSelectRecord = (gr: GoldenRecord) => {
    setSelectedRecord(gr)
    setActiveTab('details')
  }

  const handleApprove = (goldenRecordId: string, patientId: string) => {
    mpiService.reviewMatch(goldenRecordId, patientId, 'confirmed', 'Administrateur')
    setPendingReviews(mpiService.getPendingReviews())
    // Refresh selected record if it matches
    if (selectedRecord?.id === goldenRecordId) {
      const updated = mpiService.getGoldenRecord(goldenRecordId)
      if (updated) setSelectedRecord(updated)
    }
  }

  const handleReject = (goldenRecordId: string, patientId: string) => {
    mpiService.reviewMatch(goldenRecordId, patientId, 'rejected', 'Administrateur')
    setPendingReviews(mpiService.getPendingReviews())
    // Refresh selected record if it matches
    if (selectedRecord?.id === goldenRecordId) {
      const updated = mpiService.getGoldenRecord(goldenRecordId)
      if (updated) setSelectedRecord(updated)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Fingerprint className="h-6 w-6 text-amber-600" />
            MPI - Registre Principal des Patients
          </h2>
          <p className="text-muted-foreground mt-1">
            Master Patient Index - Gestion des enregistrements dores et correspondance
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
            <Database className="h-3 w-3 mr-1" /> MPI Actif
          </Badge>
          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
            <Shield className="h-3 w-3 mr-1" /> Conforme HL7
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="registry" className="flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            Registre
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-1.5 relative">
            <AlertTriangle className="h-4 w-4" />
            Revisions
            {pendingReviews.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-white text-xs font-bold">
                {pendingReviews.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="registry" className="mt-4">
          <RegistryTab
            records={records}
            onSelect={handleSelectRecord}
            selectedId={selectedRecord?.id ?? null}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <DetailsTab record={selectedRecord} />
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <ReviewsTab
            pendingReviews={pendingReviews}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
