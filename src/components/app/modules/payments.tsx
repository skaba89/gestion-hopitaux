'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, QrCode, BarChart3, Receipt } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MobileMoneyForm } from '@/components/payments/mobile-money-form'
import { TransactionHistory } from '@/components/payments/transaction-history'
import { QRPayment } from '@/components/payments/qr-payment'
import { FinancialDashboard } from '@/components/payments/financial-dashboard'
import { CreditSante } from '@/components/payments/credit-sante'
import { useTranslation } from '@/i18n/provider'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

export function PaymentsPage() {
  const { t } = useTranslation('billing')
  const { t: tc } = useTranslation('common')
  return (
    <motion.div className="p-4 lg:p-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20">
          <CreditCard className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('paymentsTitle', 'Paiements')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('paymentsSubtitle', 'Mobile Money, QR Code & Crédit Santé')}</p>
        </div>
      </motion.div>

      <Tabs defaultValue="mobile-money" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="mobile-money" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <Smartphone className="size-3.5" /> {t('paymentMethods.mobileMoney', 'Mobile Money')}
          </TabsTrigger>
          <TabsTrigger value="qr" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <QrCode className="size-3.5" /> {t('qrCode', 'QR Code')}
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <BarChart3 className="size-3.5" /> {t('dashboard', 'Tableau de bord')}
          </TabsTrigger>
          <TabsTrigger value="credit" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <Receipt className="size-3.5" /> {t('creditSante', 'Crédit Santé')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile-money" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MobileMoneyForm />
            <TransactionHistory />
          </div>
        </TabsContent>

        <TabsContent value="qr">
          <div className="max-w-md mx-auto">
            <QRPayment />
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="credit">
          <div className="max-w-2xl mx-auto">
            <CreditSante />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
