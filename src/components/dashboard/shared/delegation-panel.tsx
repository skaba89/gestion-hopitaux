'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, ArrowRightLeft, CheckCircle2, XCircle, UserCheck, Clock,
  AlertTriangle, HandMetal,
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
import { useStore } from '@/lib/store'
import type { HospitalService, ServiceDelegation } from '@/lib/hospital-model'

interface DelegationPanelProps {
  hospitalId: string
  services: HospitalService[]
  showCreate?: boolean
}

const delegationStatusConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Active': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800', icon: CheckCircle2 },
  'Expirée': { color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-800', icon: Clock },
  'Révoquée': { color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800', icon: XCircle },
}

export function DelegationPanel({ hospitalId, services, showCreate = true }: DelegationPanelProps) {
  const { delegations, addDelegation, revokeDelegation, getActiveDelegations } = useMultiHospitalStore()
  const { user } = useStore()
  const [delegateOpen, setDelegateOpen] = useState(false)
  const [selectedService, setSelectedService] = useState('')
  const [delegateName, setDelegateName] = useState('')
  const [delegateReason, setDelegateReason] = useState('')

  const activeDelegations = getActiveDelegations(hospitalId)
  const hospitalDelegations = delegations.filter(d => d.hospitalId === hospitalId)

  const handleDelegate = (serviceId?: string) => {
    const targetServiceId = serviceId || selectedService
    if (!targetServiceId || !delegateName) return

    const service = services.find(s => s.id === targetServiceId)
    if (!service) return

    addDelegation({
      hospitalId,
      serviceId: targetServiceId,
      delegatedToUserId: `USR-${Date.now()}`,
      delegatedToUserName: delegateName,
      delegatedByUserId: user.name,
      delegatedByUserName: user.name,
      reason: delegateReason || `Prise en main du service ${service.name}`,
      startDate: new Date().toISOString(),
      endDate: undefined,
      status: 'Active',
    })

    setDelegateName('')
    setDelegateReason('')
    setSelectedService('')
    setDelegateOpen(false)
  }

  const handleRevoke = (delegationId: string) => {
    revokeDelegation(delegationId)
  }

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 h-full rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-purple-50 dark:bg-purple-950/40">
              <Shield className="size-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Délégations de service
              </CardTitle>
              <CardDescription className="text-xs">
                {activeDelegations.length} délégation{activeDelegations.length !== 1 ? 's' : ''} active{activeDelegations.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
          {showCreate && (
            <Button
              size="sm"
              className="h-8 text-xs bg-purple-600 hover:bg-purple-700"
              onClick={() => setDelegateOpen(true)}
            >
              <HandMetal className="size-3.5 mr-1" />
              Prendre en main
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Quick delegate buttons per service */}
        {services.length > 0 && showCreate && (
          <div className="mb-4 space-y-1.5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Actions rapides par service
            </p>
            <div className="flex flex-wrap gap-1.5">
              {services.filter(s => {
                const hasActiveDelegation = activeDelegations.some(d => d.serviceId === s.id)
                return !hasActiveDelegation
              }).slice(0, 8).map(service => (
                <Button
                  key={service.id}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] border-dashed"
                  onClick={() => {
                    setSelectedService(service.id)
                    setDelegateOpen(true)
                  }}
                >
                  <HandMetal className="size-3 mr-1" />
                  {service.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Active delegations list */}
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {hospitalDelegations.length === 0 ? (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500">
              <Shield className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucune délégation</p>
            </div>
          ) : (
            hospitalDelegations.map((delegation, index) => {
              const config = delegationStatusConfig[delegation.status] || delegationStatusConfig['Active']
              const StatusIcon = config.icon
              const service = services.find(s => s.id === delegation.serviceId)

              return (
                <motion.div
                  key={delegation.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {service?.name || delegation.serviceId}
                        </span>
                        <Badge className={`text-[10px] px-1.5 border ${config.color}`}>
                          <StatusIcon className="size-3 mr-0.5" />
                          {delegation.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <UserCheck className="size-3" />
                        Délégué à : {delegation.delegatedToUserName}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Par : {delegation.delegatedByUserName} — {delegation.reason}
                      </p>
                    </div>
                    {delegation.status === 'Active' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2 shrink-0 ml-2"
                        onClick={() => handleRevoke(delegation.id)}
                      >
                        <XCircle className="size-3 mr-0.5" />
                        Révoquer
                      </Button>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </CardContent>

      {/* Delegate Dialog */}
      <Dialog open={delegateOpen} onOpenChange={setDelegateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prendre en main un service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Service à déléguer</Label>
              <Select value={selectedService} onValueChange={(v) => setSelectedService(v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Sélectionner le service" />
                </SelectTrigger>
                <SelectContent>
                  {services.filter(s => {
                    const hasActiveDelegation = activeDelegations.some(d => d.serviceId === s.id)
                    return !hasActiveDelegation
                  }).map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.headDoctorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Nom du gestionnaire délégué</Label>
              <Input
                value={delegateName}
                onChange={(e) => setDelegateName(e.target.value)}
                placeholder="Nom du gestionnaire"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Raison de la délégation</Label>
              <Input
                value={delegateReason}
                onChange={(e) => setDelegateReason(e.target.value)}
                placeholder="Motif de la prise en main"
                className="h-9 text-sm"
              />
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" />
                La délégation accorde un accès complet au service sélectionné.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDelegateOpen(false)}>Annuler</Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleDelegate()}>
              Confirmer la délégation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </Card>
  )
}
