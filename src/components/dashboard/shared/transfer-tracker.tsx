'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRightLeft, Clock, AlertTriangle, CheckCircle2, XCircle,
  ArrowRight, User, FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useMultiHospitalStore } from '@/lib/hospital-store'
import type { InterServiceTransfer, HospitalService } from '@/lib/hospital-model'

interface TransferTrackerProps {
  hospitalId: string
  services?: HospitalService[]
  showCreate?: boolean
}

const statusConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  'En attente': { color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800', icon: Clock },
  'Accepté': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800', icon: CheckCircle2 },
  'Refusé': { color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800', icon: XCircle },
  'Annulé': { color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-800', icon: XCircle },
}

const priorityConfig: Record<string, string> = {
  'Normal': 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Urgent': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  'Stat': 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
}

export function TransferTracker({ hospitalId, services = [], showCreate = true }: TransferTrackerProps) {
  const { transfers, addTransfer, updateTransferStatus, getServicesByHospital } = useMultiHospitalStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [formState, setFormState] = useState({
    fromServiceId: '',
    toServiceId: '',
    patientName: '',
    patientId: '',
    reason: '',
    priority: 'Normal' as InterServiceTransfer['priority'],
  })

  const hospitalTransfers = transfers.filter(t => t.hospitalId === hospitalId)
  const availableServices = services.length > 0 ? services : getServicesByHospital(hospitalId)

  const handleCreate = () => {
    if (!formState.fromServiceId || !formState.toServiceId || !formState.patientName) return

    const fromService = availableServices.find(s => s.id === formState.fromServiceId)
    const toService = availableServices.find(s => s.id === formState.toServiceId)

    addTransfer({
      hospitalId,
      fromServiceId: formState.fromServiceId,
      fromServiceName: fromService?.name || '',
      toServiceId: formState.toServiceId,
      toServiceName: toService?.name || '',
      patientId: formState.patientId || `PAT-${Date.now()}`,
      patientName: formState.patientName,
      reason: formState.reason,
      priority: formState.priority,
      status: 'En attente',
    })

    setFormState({
      fromServiceId: '', toServiceId: '', patientName: '',
      patientId: '', reason: '', priority: 'Normal',
    })
    setCreateOpen(false)
  }

  const handleStatusUpdate = (transferId: string, status: InterServiceTransfer['status']) => {
    updateTransferStatus(transferId, status)
  }

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 h-full rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-teal-50 dark:bg-teal-950/40">
              <ArrowRightLeft className="size-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Transferts inter-services
              </CardTitle>
              <CardDescription className="text-xs">
                {hospitalTransfers.length} transfert{hospitalTransfers.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
          {showCreate && (
            <Button
              size="sm"
              className="h-8 text-xs bg-teal-600 hover:bg-teal-700"
              onClick={() => setCreateOpen(true)}
            >
              <ArrowRightLeft className="size-3.5 mr-1" />
              Nouveau
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
          {hospitalTransfers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <ArrowRightLeft className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun transfert en cours</p>
            </div>
          ) : (
            hospitalTransfers.map((transfer, index) => {
              const config = statusConfig[transfer.status] || statusConfig['En attente']
              const StatusIcon = config.icon
              return (
                <motion.div
                  key={transfer.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white">
                        <span className="truncate">{transfer.fromServiceName}</span>
                        <ArrowRight className="size-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{transfer.toServiceName}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <User className="size-3" />
                        {transfer.patientName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <Badge className={`text-[10px] px-1.5 ${priorityConfig[transfer.priority]}`}>
                        {transfer.priority}
                      </Badge>
                      <Badge className={`text-[10px] px-1.5 border ${config.color}`}>
                        <StatusIcon className="size-3 mr-0.5" />
                        {transfer.status}
                      </Badge>
                    </div>
                  </div>
                  {transfer.reason && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <FileText className="size-3" />
                      {transfer.reason}
                    </p>
                  )}
                  {transfer.status === 'En attente' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2"
                        onClick={() => handleStatusUpdate(transfer.id, 'Accepté')}
                      >
                        <CheckCircle2 className="size-3 mr-1" />
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2"
                        onClick={() => handleStatusUpdate(transfer.id, 'Refusé')}
                      >
                        <XCircle className="size-3 mr-1" />
                        Refuser
                      </Button>
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </div>
      </CardContent>

      {/* Create Transfer Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau transfert inter-service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Service d'origine</Label>
              <Select value={formState.fromServiceId} onValueChange={(v) => setFormState(s => ({ ...s, fromServiceId: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Sélectionner le service" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Service de destination</Label>
              <Select value={formState.toServiceId} onValueChange={(v) => setFormState(s => ({ ...s, toServiceId: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Sélectionner le service" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.filter(s => s.id !== formState.fromServiceId).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Nom du patient</Label>
              <Input
                value={formState.patientName}
                onChange={(e) => setFormState(s => ({ ...s, patientName: e.target.value }))}
                placeholder="Nom complet du patient"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Motif du transfert</Label>
              <Input
                value={formState.reason}
                onChange={(e) => setFormState(s => ({ ...s, reason: e.target.value }))}
                placeholder="Raison du transfert"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Priorité</Label>
              <Select value={formState.priority} onValueChange={(v) => setFormState(s => ({ ...s, priority: v as InterServiceTransfer['priority'] }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Stat">Stat (immédiat)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleCreate}>
              Créer le transfert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </Card>
  )
}
