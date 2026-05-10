'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Bell, MessageSquare, Phone, Clock, Syringe, TestTube, Pill, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useDataStore, type ReminderSettings } from '@/lib/data-store'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

type ChannelOption = 'SMS' | 'WhatsApp' | 'Les deux'

interface ReminderToggleProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  enabled: boolean
  channel: ChannelOption
  timing?: '24h' | '2h' | 'Les deux'
  onToggle: (enabled: boolean) => void
  onChannelChange: (channel: ChannelOption) => void
  onTimingChange?: (timing: '24h' | '2h' | 'Les deux') => void
}

function ReminderToggle({ icon: Icon, title, description, enabled, channel, timing, onToggle, onChannelChange, onTimingChange }: ReminderToggleProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
      <div className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${enabled ? 'bg-teal-50 dark:bg-teal-950/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
        <Icon className={`size-5 ${enabled ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
        {enabled && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500">Canal</Label>
              <Select value={channel} onValueChange={(v) => onChannelChange(v as ChannelOption)}>
                <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMS"><Phone className="size-3 mr-1 inline" /> SMS</SelectItem>
                  <SelectItem value="WhatsApp"><MessageSquare className="size-3 mr-1 inline" /> WhatsApp</SelectItem>
                  <SelectItem value="Les deux">Les deux</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {onTimingChange && timing !== undefined && (
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Délai</Label>
                <Select value={timing} onValueChange={onTimingChange}>
                  <SelectTrigger className="h-7 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24h avant</SelectItem>
                    <SelectItem value="2h">2h avant</SelectItem>
                    <SelectItem value="Les deux">Les deux</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export function ReminderSettings() {
  const { reminderSettings, updateReminderSettings } = useDataStore()
  const s = reminderSettings

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="size-4 text-teal-600" />
              Paramètres des rappels automatiques
            </CardTitle>
            <CardDescription className="text-xs">
              Configurez les notifications envoyées automatiquement aux patients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ReminderToggle
              icon={Clock}
              title="Rappels de rendez-vous"
              description="Envoyer un rappel avant chaque rendez-vous"
              enabled={s.appointmentReminders}
              channel={s.appointmentChannel}
              timing={s.appointmentTiming}
              onToggle={(v) => updateReminderSettings({ appointmentReminders: v })}
              onChannelChange={(v) => updateReminderSettings({ appointmentChannel: v })}
              onTimingChange={(v) => updateReminderSettings({ appointmentTiming: v })}
            />

            <Separator />

            <ReminderToggle
              icon={TestTube}
              title="Résultats d'analyse"
              description="Notifier quand les résultats de laboratoire sont disponibles"
              enabled={s.labResultNotifications}
              channel={s.labResultChannel}
              onToggle={(v) => updateReminderSettings({ labResultNotifications: v })}
              onChannelChange={(v) => updateReminderSettings({ labResultChannel: v })}
            />

            <Separator />

            <ReminderToggle
              icon={Syringe}
              title="Rappels de vaccination"
              description="Rappeler les parents pour les vaccins dus"
              enabled={s.vaccinationReminders}
              channel={s.vaccinationChannel}
              onToggle={(v) => updateReminderSettings({ vaccinationReminders: v })}
              onChannelChange={(v) => updateReminderSettings({ vaccinationChannel: v })}
            />

            <Separator />

            <ReminderToggle
              icon={CreditCard}
              title="Rappels de paiement"
              description="Rappeler les patients pour les factures impayées"
              enabled={s.paymentReminders}
              channel={s.paymentChannel}
              onToggle={(v) => updateReminderSettings({ paymentReminders: v })}
              onChannelChange={(v) => updateReminderSettings({ paymentChannel: v })}
            />

            <Separator />

            <ReminderToggle
              icon={Pill}
              title="Rappels de médicaments"
              description="Rappels de prise de médicaments pour les patients"
              enabled={s.prescriptionReminders}
              channel="SMS"
              onToggle={(v) => updateReminderSettings({ prescriptionReminders: v })}
              onChannelChange={() => {}}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
