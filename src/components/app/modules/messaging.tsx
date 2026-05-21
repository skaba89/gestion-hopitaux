'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Bell } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageCenter } from '@/components/messaging/message-center'
import { ReminderSettings } from '@/components/messaging/reminder-settings'
import { useTranslation } from '@/i18n/provider'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

export function MessagingPage() {
  const { t } = useTranslation('common')
  const { t: tc } = useTranslation('common')
  return (
    <motion.div className="p-4 lg:p-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-teal-500/20">
          <MessageSquare className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('messaging', 'Messagerie')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('messagingSubtitle', 'SMS & WhatsApp Business')}</p>
        </div>
      </motion.div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 mb-6">
          <TabsTrigger value="messages" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <MessageSquare className="size-3.5" /> {t('messages', 'Messages')}
          </TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <Bell className="size-3.5" /> {t('autoReminders', 'Rappels auto.')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <MessageCenter />
        </TabsContent>

        <TabsContent value="reminders">
          <div className="max-w-2xl mx-auto">
            <ReminderSettings />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
