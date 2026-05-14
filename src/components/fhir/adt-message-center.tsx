'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  ArrowRightLeft,
  BedDouble,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  FileJson,
  Filter,
  Heart,
  MapPin,
  Phone,
  AlertTriangle,
  Activity,
  User,
  XCircle,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Stethoscope,
  Shield,
  ClipboardList,
  Send,
} from 'lucide-react'
import {
  adtService,
  ADTMessage,
  ADT_EVENT_LABELS,
  ADTEventType,
  ADTMessageStatus,
  adtToFHIRBundle,
  adtToEncounter,
} from '@/lib/adt-messages'
import type { FHIREncounter, FHIRBundle } from '@/lib/fhir'

/* ─────────── Helpers ─────────── */

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const STATUS_CONFIG: Record<ADTMessageStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  acknowledged: { label: 'Acquitte', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  processed: { label: 'Traite', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Activity },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  error: { label: 'Erreur', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  rejected: { label: 'Rejete', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  A01: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  A02: 'bg-amber-100 text-amber-700 border-amber-200',
  A03: 'bg-rose-100 text-rose-700 border-rose-200',
  A04: 'bg-sky-100 text-sky-700 border-sky-200',
  A05: 'bg-violet-100 text-violet-700 border-violet-200',
  A06: 'bg-teal-100 text-teal-700 border-teal-200',
  A07: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  A08: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

const ALL_STATUSES: ADTMessageStatus[] = ['pending', 'processed', 'acknowledged', 'error', 'rejected']

function getEventTypeColor(type: ADTEventType): string {
  return EVENT_TYPE_COLORS[type] || 'bg-gray-100 text-gray-700 border-gray-200'
}

/* ─────────── Status Badge ─────────── */

function StatusBadge({ status }: { status: ADTMessageStatus }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  return (
    <Badge variant="outline" className={`${config.color} text-xs font-medium gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

/* ─────────── Messages List Panel ─────────── */

interface MessagesListPanelProps {
  messages: ADTMessage[]
  selectedMessageId: string | null
  filterType: ADTEventType | 'all'
  filterStatus: ADTMessageStatus | 'all'
  onSelectMessage: (id: string) => void
  onFilterType: (type: ADTEventType | 'all') => void
  onFilterStatus: (status: ADTMessageStatus | 'all') => void
}

function MessagesListPanel({
  messages,
  selectedMessageId,
  filterType,
  filterStatus,
  onSelectMessage,
  onFilterType,
  onFilterStatus,
}: MessagesListPanelProps) {
  const eventTypes = Object.keys(ADT_EVENT_LABELS) as ADTEventType[]

  return (
    <div className="lg:col-span-1 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </h3>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => {
            onFilterType('all')
            onFilterStatus('all')
          }}
        >
          Reinitialiser
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Type d&apos;evenement</p>
        <ScrollArea className="h-32">
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={filterType === 'all' ? 'default' : 'outline'}
              className="h-7 text-xs"
              onClick={() => onFilterType('all')}
            >
              Tous
            </Button>
            {eventTypes.map((type) => (
              <Button
                key={type}
                size="sm"
                variant={filterType === type ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => onFilterType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Statut</p>
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => onFilterStatus('all')}
          >
            Tous
          </Button>
          {ALL_STATUSES.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filterStatus === status ? 'default' : 'outline'}
              className="h-7 text-xs"
              onClick={() => onFilterStatus(status)}
            >
              {STATUS_CONFIG[status].label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <p className="text-xs text-muted-foreground">
        {messages.length} message{messages.length !== 1 ? 's' : ''} trouve{messages.length !== 1 ? 's' : ''}
      </p>

      <ScrollArea className="h-[480px]">
        <div className="space-y-2 pr-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">Aucun message ADT</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMessageId === msg.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onSelectMessage(msg.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-xs ${getEventTypeColor(msg.messageType)}`}>
                            {msg.messageType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {ADT_EVENT_LABELS[msg.messageType]}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {msg.patient.firstName} {msg.patient.lastName}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">
                            {msg.sendingFacility}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Send className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">
                            {msg.receivingFacility}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={msg.status} />
                        <span className="text-xs text-muted-foreground">
                          {formatShortDate(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

/* ─────────── Message Detail Panel (Messages tab) ─────────── */

interface MessageDetailPanelProps {
  selectedMessage: ADTMessage
  encounter: FHIREncounter
}

function MessageDetailPanel({ selectedMessage, encounter }: MessageDetailPanelProps) {
  return (
    <motion.div
      key={selectedMessage.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-[620px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Message {selectedMessage.id}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getEventTypeColor(selectedMessage.messageType)}>
                {selectedMessage.messageType} - {ADT_EVENT_LABELS[selectedMessage.messageType]}
              </Badge>
              <StatusBadge status={selectedMessage.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {/* Patient Info */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  Informations Patient
                </h4>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Nom complet</p>
                    <p className="text-sm font-medium">
                      {selectedMessage.patient.firstName} {selectedMessage.patient.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID Patient</p>
                    <p className="text-sm font-medium">{selectedMessage.patient.patientId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID National</p>
                    <p className="text-sm font-medium">{selectedMessage.patient.nationalId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date de naissance</p>
                    <p className="text-sm font-medium">{selectedMessage.patient.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sexe</p>
                    <p className="text-sm font-medium">
                      {selectedMessage.patient.gender === 'M' ? 'Masculin' : 'Feminin'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Groupe sanguin</p>
                    <p className="text-sm font-medium">{selectedMessage.patient.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telephone</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedMessage.patient.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Adresse</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedMessage.patient.address}
                    </p>
                  </div>
                  {selectedMessage.patient.allergies.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Allergies</p>
                      <div className="flex gap-1 mt-1">
                        {selectedMessage.patient.allergies.map((a) => (
                          <Badge key={a} variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Visit Info */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-blue-600" />
                  Informations de Sejour
                </h4>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Numero de sejour</p>
                    <p className="text-sm font-medium">{selectedMessage.visit.visitNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Classe de patient</p>
                    <p className="text-sm font-medium capitalize">{selectedMessage.visit.patientClass}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Medecin admetteur</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" />
                      {selectedMessage.visit.admittingDoctor}
                    </p>
                  </div>
                  {selectedMessage.visit.referringDoctor && (
                    <div>
                      <p className="text-xs text-muted-foreground">Medecin referent</p>
                      <p className="text-sm font-medium">{selectedMessage.visit.referringDoctor}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Departement / Chambre</p>
                    <p className="text-sm font-medium">
                      {selectedMessage.visit.department} - {selectedMessage.visit.ward}
                      {selectedMessage.visit.bed ? ` - Lit ${selectedMessage.visit.bed}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Motif</p>
                    <p className="text-sm font-medium">{selectedMessage.visit.admissionReason}</p>
                  </div>
                  {selectedMessage.visit.diagnosisCode && (
                    <div>
                      <p className="text-xs text-muted-foreground">Diagnostic (CIM)</p>
                      <p className="text-sm font-medium">
                        {selectedMessage.visit.diagnosisCode} - {selectedMessage.visit.diagnosisDescription}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Classe financiere</p>
                    <p className="text-sm font-medium">{selectedMessage.visit.financialClass}</p>
                  </div>
                  {selectedMessage.visit.expectedLengthOfStay !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Duree de sejour prevue</p>
                      <p className="text-sm font-medium">{selectedMessage.visit.expectedLengthOfStay} jours</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Facilities & Timestamps */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-violet-600" />
                  Etablissements et Horodatage
                </h4>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Etablissement emetteur</p>
                    <p className="text-sm font-medium">{selectedMessage.sendingFacility}</p>
                    <p className="text-xs text-muted-foreground">Code: {selectedMessage.sendingFacilityCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Etablissement recepteur</p>
                    <p className="text-sm font-medium">{selectedMessage.receivingFacility}</p>
                    <p className="text-xs text-muted-foreground">Code: {selectedMessage.receivingFacilityCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID de controle</p>
                    <p className="text-sm font-medium font-mono">{selectedMessage.messageControlId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Horodatage</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(selectedMessage.timestamp)}
                    </p>
                  </div>
                  {selectedMessage.processedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Traite le</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {formatDate(selectedMessage.processedAt)}
                      </p>
                    </div>
                  )}
                  {selectedMessage.relatedMessageId && (
                    <div>
                      <p className="text-xs text-muted-foreground">Message lie</p>
                      <p className="text-sm font-medium font-mono">{selectedMessage.relatedMessageId}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedMessage.error && (
                <>
                  <Separator />
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Erreur
                    </p>
                    <p className="text-sm text-red-600 mt-1">{selectedMessage.error}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* FHIR Preview */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  Apercu Conversion FHIR
                </h4>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Ressource Encounter</p>
                    <p className="text-sm font-medium font-mono">{encounter.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Statut Encounter</p>
                    <p className="text-sm font-medium">{encounter.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Classe</p>
                    <p className="text-sm font-medium">{encounter.class.display}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bundle FHIR</p>
                    <p className="text-sm font-medium font-mono">
                      {selectedMessage.fhirBundleId || 'Non genere'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─────────── Details Tab Content ─────────── */

interface DetailsTabProps {
  selectedMessage: ADTMessage | null
  encounter: FHIREncounter | null
}

function DetailsTab({ selectedMessage, encounter }: DetailsTabProps) {
  if (!selectedMessage) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Selectionnez un message ADT pour voir les details complets</p>
          <p className="text-xs mt-1">Utilisez l&apos;onglet Messages pour choisir un message</p>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      key={selectedMessage.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Details du Message {selectedMessage.id}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getEventTypeColor(selectedMessage.messageType)}>
                {selectedMessage.messageType} - {ADT_EVENT_LABELS[selectedMessage.messageType]}
              </Badge>
              <StatusBadge status={selectedMessage.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-6 pr-4">
              {/* Patient */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  Informations du Patient
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Nom complet</p>
                    <p className="text-sm font-medium">
                      {selectedMessage.patient.firstName} {selectedMessage.patient.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID Patient</p>
                    <p className="text-sm font-mono">{selectedMessage.patient.patientId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID National</p>
                    <p className="text-sm font-mono">{selectedMessage.patient.nationalId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date de naissance</p>
                    <p className="text-sm">{selectedMessage.patient.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sexe</p>
                    <p className="text-sm">
                      {selectedMessage.patient.gender === 'M' ? 'Masculin' : 'Feminin'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Groupe sanguin</p>
                    <p className="text-sm font-medium">{selectedMessage.patient.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telephone</p>
                    <p className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {selectedMessage.patient.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Adresse</p>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {selectedMessage.patient.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact d&apos;urgence</p>
                    <p className="text-sm">{selectedMessage.patient.emergencyContact}</p>
                    <p className="text-xs text-muted-foreground">{selectedMessage.patient.emergencyPhone}</p>
                  </div>
                  {selectedMessage.patient.allergies.length > 0 && (
                    <div className="col-span-full">
                      <p className="text-xs text-muted-foreground mb-1">Allergies</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedMessage.patient.allergies.map((a) => (
                          <Badge key={a} variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Visit */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-blue-600" />
                  Informations de Sejour
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Numero de sejour</p>
                    <p className="text-sm font-mono">{selectedMessage.visit.visitNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Classe de patient</p>
                    <Badge variant="outline" className="mt-0.5 capitalize">{selectedMessage.visit.patientClass}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Medecin admetteur</p>
                    <p className="text-sm flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" /> {selectedMessage.visit.admittingDoctor}
                    </p>
                  </div>
                  {selectedMessage.visit.referringDoctor && (
                    <div>
                      <p className="text-xs text-muted-foreground">Medecin referent</p>
                      <p className="text-sm">{selectedMessage.visit.referringDoctor}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Departement</p>
                    <p className="text-sm">{selectedMessage.visit.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Chambre / Lit</p>
                    <p className="text-sm">
                      {selectedMessage.visit.ward}
                      {selectedMessage.visit.bed ? ` - Lit ${selectedMessage.visit.bed}` : ''}
                    </p>
                  </div>
                  <div className="col-span-full">
                    <p className="text-xs text-muted-foreground">Motif d&apos;admission</p>
                    <p className="text-sm font-medium">{selectedMessage.visit.admissionReason}</p>
                  </div>
                  {selectedMessage.visit.diagnosisCode && (
                    <div>
                      <p className="text-xs text-muted-foreground">Code diagnostic (CIM-10)</p>
                      <p className="text-sm font-mono">{selectedMessage.visit.diagnosisCode}</p>
                    </div>
                  )}
                  {selectedMessage.visit.diagnosisDescription && (
                    <div>
                      <p className="text-xs text-muted-foreground">Description du diagnostic</p>
                      <p className="text-sm">{selectedMessage.visit.diagnosisDescription}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Date d&apos;admission</p>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatDate(selectedMessage.visit.admissionDate)}
                    </p>
                  </div>
                  {selectedMessage.visit.dischargeDate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Date de sortie</p>
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(selectedMessage.visit.dischargeDate)}
                      </p>
                    </div>
                  )}
                  {selectedMessage.visit.dischargeDisposition && (
                    <div>
                      <p className="text-xs text-muted-foreground">Mode de sortie</p>
                      <p className="text-sm">{selectedMessage.visit.dischargeDisposition}</p>
                    </div>
                  )}
                  {selectedMessage.visit.expectedLengthOfStay !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Duree prevue</p>
                      <p className="text-sm">{selectedMessage.visit.expectedLengthOfStay} jours</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Classe financiere</p>
                    <p className="text-sm">{selectedMessage.visit.financialClass}</p>
                  </div>
                  {selectedMessage.visit.insuranceProvider && (
                    <div>
                      <p className="text-xs text-muted-foreground">Assurance</p>
                      <p className="text-sm">{selectedMessage.visit.insuranceProvider}</p>
                      <p className="text-xs text-muted-foreground">N. police: {selectedMessage.visit.insurancePolicyNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* ADT Type & Facilities */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-violet-600" />
                  Type ADT et Etablissements
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Type de message</p>
                    <Badge variant="outline" className={`mt-0.5 ${getEventTypeColor(selectedMessage.messageType)}`}>
                      {selectedMessage.messageType} - {ADT_EVENT_LABELS[selectedMessage.messageType]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID de controle du message</p>
                    <p className="text-sm font-mono">{selectedMessage.messageControlId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Horodatage du message</p>
                    <p className="text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatDate(selectedMessage.timestamp)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Etablissement emetteur</p>
                    <p className="text-sm font-medium">{selectedMessage.sendingFacility}</p>
                    <p className="text-xs text-muted-foreground">Code: {selectedMessage.sendingFacilityCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Etablissement recepteur</p>
                    <p className="text-sm font-medium">{selectedMessage.receivingFacility}</p>
                    <p className="text-xs text-muted-foreground">Code: {selectedMessage.receivingFacilityCode}</p>
                  </div>
                  {selectedMessage.processedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Date de traitement</p>
                      <p className="text-sm flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {formatDate(selectedMessage.processedAt)}
                      </p>
                    </div>
                  )}
                  {selectedMessage.relatedMessageId && (
                    <div>
                      <p className="text-xs text-muted-foreground">Message lie</p>
                      <p className="text-sm font-mono">{selectedMessage.relatedMessageId}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedMessage.error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Erreur de Traitement
                  </p>
                  <p className="text-sm text-red-600 mt-1">{selectedMessage.error}</p>
                </div>
              )}

              <Separator />

              {/* FHIR Conversion Preview */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  Apercu de la Conversion FHIR
                </h4>
                {encounter ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Ressource Encounter generee</p>
                      <p className="text-sm font-mono">{encounter.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Statut FHIR Encounter</p>
                      <Badge variant="outline" className="mt-0.5">{encounter.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Classe Encounter</p>
                      <p className="text-sm">{encounter.class.display} ({encounter.class.code})</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bundle FHIR genere</p>
                      <p className="text-sm font-mono">{selectedMessage.fhirBundleId || 'Non genere'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Conversion FHIR non disponible pour ce message</p>
                )}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─────────── FHIR Bundle Tab ─────────── */

interface FHIRBundleTabProps {
  selectedMessage: ADTMessage | null
  fhirBundle: FHIRBundle | null
  copied: boolean
  onCopy: () => void
}

function FHIRBundleTab({ selectedMessage, fhirBundle, copied, onCopy }: FHIRBundleTabProps) {
  if (!selectedMessage || !fhirBundle) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileJson className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Selectionnez un message ADT pour generer le Bundle FHIR</p>
          <p className="text-xs mt-1">Allez dans l&apos;onglet Messages et selectionnez un message</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <motion.div
        key={fhirBundle.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Bundle FHIR - {fhirBundle.id}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  type: {fhirBundle.type}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {fhirBundle.entry?.length || 0} entree{fhirBundle.entry?.length !== 1 ? 's' : ''}
                </Badge>
                <Button size="sm" variant="outline" onClick={onCopy}>
                  {copied ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? 'Copie' : 'Copier'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <pre className="text-xs bg-slate-950 text-green-400 p-4 rounded-lg font-mono whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(fhirBundle, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                Ressource Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fhirBundle.entry?.[0]?.resource && (
                <ScrollArea className="h-[280px]">
                  <pre className="text-xs bg-slate-950 text-green-400 p-4 rounded-lg font-mono whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(fhirBundle.entry[0].resource, null, 2)}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-blue-600" />
                Ressource Encounter
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fhirBundle.entry?.[1]?.resource && (
                <ScrollArea className="h-[280px]">
                  <pre className="text-xs bg-slate-950 text-green-400 p-4 rounded-lg font-mono whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(fhirBundle.entry[1].resource, null, 2)}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

/* ─────────── Metrics Tab ─────────── */

interface MetricsTabProps {
  messages: ADTMessage[]
}

function MetricsTab({ messages }: MetricsTabProps) {
  const metrics = useMemo(() => adtService.getMetrics(), [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Messages',
            value: metrics.total,
            icon: ClipboardList,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'En attente',
            value: metrics.pending,
            icon: Clock,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
          },
          {
            label: 'Erreurs',
            value: metrics.errors,
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
          {
            label: 'Taux de succes',
            value: `${metrics.successRate}%`,
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-600" />
                Repartition par Type d&apos;Evenement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.byType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <Badge variant="outline" className={`w-14 justify-center text-xs ${getEventTypeColor(type as ADTEventType)}`}>
                          {type}
                        </Badge>
                        <span className="text-xs w-36 text-muted-foreground">
                          {ADT_EVENT_LABELS[type as ADTEventType]}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          />
                        </div>
                        <span className="text-xs font-medium w-12 text-right">{count} ({pct}%)</span>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Repartition par Statut
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ALL_STATUSES.map((status) => {
                  const count = metrics.byStatus[status] || 0
                  const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0
                  const config = STATUS_CONFIG[status]
                  const Icon = config.icon
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${config.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-medium w-24">{config.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            status === 'acknowledged'
                              ? 'bg-green-500'
                              : status === 'processed'
                              ? 'bg-blue-500'
                              : status === 'pending'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{count} ({pct}%)</span>
                    </div>
                  )
                })}
              </div>

              <Separator className="my-4" />

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Taux de traitement reussi</span>
                  <span className="text-sm font-bold text-green-600">{metrics.successRate}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.successRate}%` }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.processed} sur {metrics.total} messages traites avec succes
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-teal-600" />
              Activite Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {messages.slice(0, 8).map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Badge variant="outline" className={`text-xs ${getEventTypeColor(msg.messageType)}`}>
                      {msg.messageType}
                    </Badge>
                    <span className="text-sm flex-1">
                      {msg.patient.firstName} {msg.patient.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {msg.sendingFacility}
                    </span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {msg.receivingFacility}
                    </span>
                    <StatusBadge status={msg.status} />
                    <span className="text-xs text-muted-foreground w-32 text-right">
                      {formatShortDate(msg.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

/* ─────────── Main Component ─────────── */

export function ADTMessageCenter() {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<ADTEventType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<ADTMessageStatus | 'all'>('all')
  const [copied, setCopied] = useState(false)

  const messages = useMemo(() => {
    return adtService.getMessages({
      type: filterType === 'all' ? undefined : filterType,
      status: filterStatus === 'all' ? undefined : filterStatus,
    })
  }, [filterType, filterStatus])

  const selectedMessage = useMemo(() => {
    return selectedMessageId ? adtService.getMessage(selectedMessageId) ?? null : null
  }, [selectedMessageId])

  const fhirBundle = useMemo(() => {
    return selectedMessage ? adtToFHIRBundle(selectedMessage) : null
  }, [selectedMessage])

  const encounter = useMemo(() => {
    return selectedMessage ? adtToEncounter(selectedMessage) : null
  }, [selectedMessage])

  const handleCopyJson = () => {
    if (!fhirBundle) return
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6 text-emerald-600" />
            Centre de Messages ADT
          </h2>
          <p className="text-muted-foreground mt-1">
            Messages HL7 v2.x Admit/Discharge/Transfer pour les etablissements de Guinee
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <Activity className="h-3 w-3 mr-1" /> HL7 v2.x Actif
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Heart className="h-3 w-3 mr-1" /> FHIR R4
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="messages">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages" className="flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-1.5">
            <FileJson className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="fhir" className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            FHIR Bundle
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Metriques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <MessagesListPanel
              messages={messages}
              selectedMessageId={selectedMessageId}
              filterType={filterType}
              filterStatus={filterStatus}
              onSelectMessage={setSelectedMessageId}
              onFilterType={setFilterType}
              onFilterStatus={setFilterStatus}
            />
            <div className="lg:col-span-2">
              {selectedMessage && encounter ? (
                <MessageDetailPanel selectedMessage={selectedMessage} encounter={encounter} />
              ) : (
                <Card className="h-[620px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Selectionnez un message ADT pour voir les details</p>
                    <p className="text-xs mt-1">Cliquez sur un message dans la liste de gauche</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <DetailsTab selectedMessage={selectedMessage} encounter={encounter} />
        </TabsContent>

        <TabsContent value="fhir" className="mt-4">
          <FHIRBundleTab
            selectedMessage={selectedMessage}
            fhirBundle={fhirBundle}
            copied={copied}
            onCopy={handleCopyJson}
          />
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <MetricsTab messages={messages} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
