'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor,
  Image as ImageIcon,
  Server,
  Search,
  User,
  Calendar,
  Building2,
  FileText,
  Clock,
  Activity,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  ChevronRight,
} from 'lucide-react'
import {
  dicomService,
  type DICOMStudy,
  type DICOMGateway,
  MODALITY_LABELS,
  MODALITY_COLORS,
} from '@/lib/dicom-integration'

/* ─────────── Status Helpers ─────────── */

function getStudyStatusStyle(status: string) {
  switch (status) {
    case 'completed':
    case 'reported':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'in-progress':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'scheduled':
      return 'bg-gray-100 text-gray-600 border-gray-200'
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

function getStudyStatusLabel(status: string) {
  switch (status) {
    case 'completed':
      return 'Termine'
    case 'reported':
      return 'Rapporte'
    case 'in-progress':
      return 'En cours'
    case 'scheduled':
      return 'Programme'
    case 'cancelled':
      return 'Annule'
    default:
      return status
  }
}

function getReportStatusStyle(status: string | null) {
  switch (status) {
    case 'final':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'preliminary':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'draft':
      return 'bg-gray-100 text-gray-600 border-gray-200'
    case 'amended':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-50 text-gray-400 border-gray-200'
  }
}

function getReportStatusLabel(status: string | null) {
  switch (status) {
    case 'final':
      return 'Final'
    case 'preliminary':
      return 'Preliminaire'
    case 'draft':
      return 'Brouillon'
    case 'amended':
      return 'Modifie'
    case 'cancelled':
      return 'Annule'
    default:
      return 'Non disponible'
  }
}

function getPriorityStyle(priority: string) {
  switch (priority) {
    case 'stat':
      return 'bg-red-100 text-red-700 border-red-200 animate-pulse'
    case 'urgent':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'routine':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case 'stat':
      return 'STAT'
    case 'urgent':
      return 'Urgent'
    case 'routine':
      return 'Routine'
    default:
      return priority
  }
}

function getGatewayStatusStyle(status: string) {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-700'
    case 'offline':
      return 'bg-red-100 text-red-700'
    case 'degraded':
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getGatewayStatusLabel(status: string) {
  switch (status) {
    case 'online':
      return 'En ligne'
    case 'offline':
      return 'Hors ligne'
    case 'degraded':
      return 'Degrade'
    default:
      return status
  }
}

function getGatewayStatusIcon(status: string) {
  switch (status) {
    case 'online':
      return <CheckCircle2 className="size-4 text-green-600" />
    case 'offline':
      return <XCircle className="size-4 text-red-600" />
    case 'degraded':
      return <AlertCircle className="size-4 text-yellow-600" />
    default:
      return <AlertCircle className="size-4 text-gray-500" />
  }
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

/* ─────────── Study Card ─────────── */

function StudyCard({
  study,
  isSelected,
  onClick,
}: {
  study: DICOMStudy
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <Card
        className={`cursor-pointer transition-all duration-200 py-4 gap-3 ${
          isSelected
            ? 'ring-2 ring-primary shadow-md'
            : 'hover:shadow-md'
        }`}
        onClick={onClick}
      >
        <CardContent className="px-4 pt-0 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold border-0 ${MODALITY_COLORS[study.modality]}`}
                >
                  {study.modality}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs border ${getPriorityStyle(study.priority)}`}
                >
                  {getPriorityLabel(study.priority)}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs border ${getStudyStatusStyle(study.status)}`}
                >
                  {getStudyStatusLabel(study.status)}
                </Badge>
              </div>
              <p className="text-sm font-medium leading-snug truncate">
                {study.studyDescription}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  {study.patientName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDate(study.studyDate)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="size-3" />
                  {study.performingFacility}
                </span>
                <span className="flex items-center gap-1">
                  <ImageIcon className="size-3" />
                  {study.numberOfSeries} series / {study.numberOfInstances} images
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge
                variant="outline"
                className={`text-xs border ${getReportStatusStyle(study.reportStatus)}`}
              >
                {getReportStatusLabel(study.reportStatus)}
              </Badge>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─────────── Etudes Tab ─────────── */

function EtudesTab({
  studies,
  selectedStudyId,
  onSelectStudy,
}: {
  studies: DICOMStudy[]
  selectedStudyId: string | null
  onSelectStudy: (id: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStudies = useMemo(() => {
    if (!searchQuery.trim()) return studies
    const query = searchQuery.toLowerCase()
    return studies.filter(
      (s) =>
        s.patientName.toLowerCase().includes(query) ||
        s.studyDescription.toLowerCase().includes(query) ||
        s.accessionNumber.toLowerCase().includes(query) ||
        s.modality.toLowerCase().includes(query) ||
        s.performingFacility.toLowerCase().includes(query) ||
        s.patientId.toLowerCase().includes(query)
    )
  }, [studies, searchQuery])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par patient, description, accession, modalite..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredStudies.length} etude(s) trouvee(s)</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-0 bg-blue-50 text-blue-700">
            {studies.filter((s) => s.priority === 'routine').length} routine
          </Badge>
          <Badge variant="outline" className="text-xs border-0 bg-orange-50 text-orange-700">
            {studies.filter((s) => s.priority === 'urgent').length} urgent
          </Badge>
          <Badge variant="outline" className="text-xs border-0 bg-red-50 text-red-700">
            {studies.filter((s) => s.priority === 'stat').length} stat
          </Badge>
        </div>
      </div>

      <ScrollArea className="max-h-[600px]">
        <div className="space-y-3 pr-2">
          <AnimatePresence mode="popLayout">
            {filteredStudies.map((study) => (
              <StudyCard
                key={study.id}
                study={study}
                isSelected={selectedStudyId === study.id}
                onClick={() => onSelectStudy(study.id)}
              />
            ))}
          </AnimatePresence>
          {filteredStudies.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-muted-foreground"
            >
              <ImageIcon className="size-12 mb-3 opacity-30" />
              <p className="text-sm">Aucune etude trouvee</p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

/* ─────────── Detail Tab ─────────── */

function DetailTab({ study }: { study: DICOMStudy | null }) {
  if (!study) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-muted-foreground"
      >
        <Monitor className="size-16 mb-4 opacity-20" />
        <p className="text-sm">Selectionnez une etude pour voir les details</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`text-xs font-semibold border-0 ${MODALITY_COLORS[study.modality]}`}
            >
              {MODALITY_LABELS[study.modality]}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs border ${getPriorityStyle(study.priority)}`}
            >
              {getPriorityLabel(study.priority)}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs border ${getStudyStatusStyle(study.status)}`}
            >
              {getStudyStatusLabel(study.status)}
            </Badge>
          </div>
          <h3 className="text-base font-semibold leading-snug">
            {study.studyDescription}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Eye className="size-3.5" />
            Visualiser
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-3.5" />
            Telecharger
          </Button>
        </div>
      </div>

      <Separator />

      {/* Patient Info */}
      <Card className="py-4 gap-3">
        <CardHeader className="pb-0 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            Informations Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Nom :</span>{' '}
              <span className="font-medium">{study.patientName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ID Patient :</span>{' '}
              <span className="font-mono text-xs">{study.patientId}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Info */}
      <Card className="py-4 gap-3">
        <CardHeader className="pb-0 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            Informations Etude
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">UID Etude :</span>{' '}
              <span className="font-mono text-xs break-all">{study.studyInstanceUID}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Numero d'accession :</span>{' '}
              <span className="font-mono text-xs">{study.accessionNumber}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Date de l'etude :</span>{' '}
              <span className="font-medium">{formatDate(study.studyDate)} - {study.studyTime}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Medecin prescripteur :</span>{' '}
              <span className="font-medium">{study.referringDoctor}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facility & Technical */}
      <Card className="py-4 gap-3">
        <CardHeader className="pb-0 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            Etablissement et Technique
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Etablissement :</span>{' '}
              <span className="font-medium">{study.performingFacility}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Code etablissement :</span>{' '}
              <span className="font-mono text-xs">{study.performingFacilityCode}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Nombre de series :</span>{' '}
              <span className="font-medium">{study.numberOfSeries}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Nombre d'images :</span>{' '}
              <span className="font-medium">{study.numberOfInstances}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Taille estimee :</span>{' '}
              <span className="font-medium">{study.estimatedSizeMB >= 1024 ? `${(study.estimatedSizeMB / 1024).toFixed(2)} Go` : `${study.estimatedSizeMB} Mo`}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Contexte clinique :</span>{' '}
              <span className="font-medium">{study.clinicalContext}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radiologist & Report */}
      <Card className="py-4 gap-3">
        <CardHeader className="pb-0 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="size-4 text-muted-foreground" />
            Radiologue et Rapport
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Radiologue :</span>{' '}
                <span className="font-medium">{study.radiologist || 'Non assigne'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Statut du rapport :</span>{' '}
                <Badge
                  variant="outline"
                  className={`text-xs border ${getReportStatusStyle(study.reportStatus)}`}
                >
                  {getReportStatusLabel(study.reportStatus)}
                </Badge>
              </div>
              {study.reportDate && (
                <div>
                  <span className="text-muted-foreground">Date du rapport :</span>{' '}
                  <span className="font-medium">{formatDate(study.reportDate)}</span>
                </div>
              )}
            </div>
            {study.reportText && (
              <>
                <Separator />
                <div className="text-sm">
                  <span className="text-muted-foreground block mb-1">Texte du rapport :</span>
                  <div className="bg-muted/50 rounded-md p-3 text-sm leading-relaxed">
                    {study.reportText}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WADO-RS URL */}
      <Card className="py-4 gap-3">
        <CardHeader className="pb-0 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Server className="size-4 text-muted-foreground" />
            Acces WADO-RS
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <div className="bg-muted/50 rounded-md p-3">
            <code className="text-xs break-all font-mono">{study.wadoRsUrl}</code>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {study.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {study.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ─────────── PACS Tab ─────────── */

function PACSTab({ gateways }: { gateways: DICOMGateway[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {gateways.length} serveur(s) PACS connecte(s)
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="size-3" />
            {gateways.filter((g) => g.status === 'online').length} en ligne
          </span>
          <span className="flex items-center gap-1 text-xs text-yellow-600">
            <AlertCircle className="size-3" />
            {gateways.filter((g) => g.status === 'degraded').length} degrade
          </span>
          <span className="flex items-center gap-1 text-xs text-red-600">
            <XCircle className="size-3" />
            {gateways.filter((g) => g.status === 'offline').length} hors ligne
          </span>
        </div>
      </div>

      <ScrollArea className="max-h-[600px]">
        <div className="space-y-4 pr-2">
          {gateways.map((gateway, index) => (
            <motion.div
              key={gateway.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              <Card className="py-4 gap-3">
                <CardHeader className="pb-0 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Server className="size-4 text-muted-foreground" />
                      {gateway.facilityName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getGatewayStatusIcon(gateway.status)}
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${getGatewayStatusStyle(gateway.status)}`}
                      >
                        {getGatewayStatusLabel(gateway.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-0 space-y-4">
                  {/* AETitle & Latency */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">AE Title :</span>{' '}
                      <span className="font-mono text-xs font-semibold">{gateway.dicomAETitle}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Latence :</span>{' '}
                      <span className={`font-medium ${gateway.latencyMs > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {gateway.latencyMs} ms
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total etudes :</span>{' '}
                      <span className="font-medium">{gateway.totalStudies.toLocaleString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Supported Modalities */}
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1.5">Modalites supportees :</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {gateway.supportedModalities.map((mod) => (
                        <Badge
                          key={mod}
                          variant="outline"
                          className={`text-xs border-0 ${MODALITY_COLORS[mod]}`}
                        >
                          {mod}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Storage Utilization */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <HardDrive className="size-3" />
                        Stockage
                      </span>
                      <span className="font-medium">
                        {gateway.storageUsedGB.toLocaleString('fr-FR')} / {gateway.storageCapacityGB.toLocaleString('fr-FR')} Go
                        <span className="text-muted-foreground ml-1">
                          ({((gateway.storageUsedGB / gateway.storageCapacityGB) * 100).toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <Progress
                      value={(gateway.storageUsedGB / gateway.storageCapacityGB) * 100}
                      className={`h-2 ${
                        (gateway.storageUsedGB / gateway.storageCapacityGB) > 0.85
                          ? '[&>div]:bg-red-500'
                          : (gateway.storageUsedGB / gateway.storageCapacityGB) > 0.7
                          ? '[&>div]:bg-yellow-500'
                          : '[&>div]:bg-green-500'
                      }`}
                    />
                  </div>

                  {/* Last Ping */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    Dernier ping : {formatDateTime(gateway.lastPing)}
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

/* ─────────── Metriques Tab ─────────── */

function MetriquesTab() {
  const metrics = dicomService.getMetrics()

  const modalityEntries = Object.entries(metrics.studiesByModality)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)

  const facilityEntries = Object.entries(metrics.studiesByFacility)
    .sort(([, a], [, b]) => b - a)

  const maxModalityCount = Math.max(...modalityEntries.map(([, c]) => c), 1)
  const maxFacilityCount = Math.max(...facilityEntries.map(([, c]) => c), 1)

  const metricCards = [
    {
      label: 'Total etudes',
      value: metrics.totalStudies,
      icon: ImageIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Etudes aujourd\'hui',
      value: metrics.studiesToday,
      icon: Calendar,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Rapports en attente',
      value: metrics.pendingReports,
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Temps moyen rapport',
      value: metrics.averageReportTime,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Urgentes en attente',
      value: metrics.urgentPending,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Utilisation stockage',
      value: `${metrics.storageUtilization}%`,
      icon: HardDrive,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="py-3 gap-2">
              <CardContent className="px-3 pb-0 pt-0">
                <div className={`inline-flex items-center justify-center rounded-md p-2 mb-2 ${card.bg}`}>
                  <card.icon className={`size-4 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* By Modality */}
      <Card className="py-4 gap-3">
        <CardHeader className="pb-0 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Monitor className="size-4 text-muted-foreground" />
            Etudes par modalite
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <div className="space-y-3">
            {modalityEntries.map(([mod, count], index) => (
              <motion.div
                key={mod}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold border-0 w-24 justify-center ${MODALITY_COLORS[mod as keyof typeof MODALITY_COLORS]}`}
                >
                  {mod}
                </Badge>
                <div className="flex-1 bg-muted/50 rounded-full h-6 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxModalityCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                    className={`h-full rounded-full flex items-center justify-end pr-2 ${
                      MODALITY_COLORS[mod as keyof typeof MODALITY_COLORS]
                        .replace('bg-', 'bg-')
                        .split(' ')[0]
                    }`}
                    style={{
                      minWidth: count > 0 ? '2rem' : '0',
                    }}
                  >
                    <span className="text-xs font-semibold">{count}</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
            {modalityEntries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* By Facility */}
      <Card className="py-4 gap-3">
        <CardHeader className="pb-0 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            Etudes par etablissement
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <div className="space-y-3">
            {facilityEntries.map(([facility, count], index) => (
              <motion.div
                key={facility}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-muted-foreground w-48 truncate shrink-0">
                  {facility}
                </span>
                <div className="flex-1 bg-muted/50 rounded-full h-6 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxFacilityCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                    className="h-full rounded-full bg-primary/70 flex items-center justify-end pr-2"
                    style={{
                      minWidth: count > 0 ? '2rem' : '0',
                    }}
                  >
                    <span className="text-xs font-semibold text-primary-foreground">{count}</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
            {facilityEntries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─────────── Main Component ─────────── */

export function DICOMViewer() {
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('etudes')

  const studies = dicomService.getStudies()
  const gateways = dicomService.getGateways()
  const selectedStudy = selectedStudyId
    ? dicomService.getStudy(selectedStudyId) ?? null
    : null

  function handleSelectStudy(id: string) {
    setSelectedStudyId(id)
    setActiveTab('detail')
  }

  return (
    <Card className="py-4 gap-3">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="size-5" />
            Visualiseur DICOM - Imagerie Medicale
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            HealthFlow Guinee
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="etudes" className="gap-1.5">
              <ImageIcon className="size-3.5" />
              Etudes
            </TabsTrigger>
            <TabsTrigger value="detail" className="gap-1.5">
              <FileText className="size-3.5" />
              Detail
            </TabsTrigger>
            <TabsTrigger value="pacs" className="gap-1.5">
              <Server className="size-3.5" />
              PACS
            </TabsTrigger>
            <TabsTrigger value="metriques" className="gap-1.5">
              <Activity className="size-3.5" />
              Metriques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="etudes">
            <EtudesTab
              studies={studies}
              selectedStudyId={selectedStudyId}
              onSelectStudy={handleSelectStudy}
            />
          </TabsContent>

          <TabsContent value="detail">
            <DetailTab study={selectedStudy} />
          </TabsContent>

          <TabsContent value="pacs">
            <PACSTab gateways={gateways} />
          </TabsContent>

          <TabsContent value="metriques">
            <MetriquesTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
