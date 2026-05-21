'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { InsurancePanel } from '@/components/insurance/insurance-panel'
import { useTranslation } from '@/i18n/provider'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

export function InsurancePage() {
  const { t } = useTranslation('billing')
  const { t: tc } = useTranslation('common')
  return (
    <motion.div className="p-4 lg:p-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('insurance', 'Assurance Santé')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('insuranceSubtitle', 'Couverture, réclamations & pré-autorisations')}</p>
          </div>
        </div>
      </motion.div>

      <InsurancePanel />
    </motion.div>
  )
}
