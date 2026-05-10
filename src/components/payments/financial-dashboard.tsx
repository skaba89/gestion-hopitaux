'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Smartphone, Banknote, ShieldCheck, AlertTriangle, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDataStore } from '@/lib/data-store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

const PIE_COLORS = ['#10b981', '#f59e0b', '#8b5cf6']
const PIE_COLORS_MM = ['#f97316', '#eab308']

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  
  useEffect(() => {
    const duration = 1000
    const start = display
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (value - start) * eased))
      
      if (progress < 1) requestAnimationFrame(animate)
    }
    
    requestAnimationFrame(animate)
  }, [value])

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>
}

export function FinancialDashboard() {
  const { invoices, mobileMoneyTransactions } = useDataStore()

  // Calculate stats
  const totalRevenue = invoices.filter(i => i.status === 'Payée' || i.status === 'Partielle').reduce((s, i) => s + i.paidAmount, 0)
  const outstandingAmount = invoices.filter(i => i.status === 'En attente' || i.status === 'Partielle').reduce((s, i) => s + i.total - i.paidAmount, 0)
  const mmRevenue = mobileMoneyTransactions.filter(t => t.status === 'Réussi').reduce((s, t) => s + t.amount, 0)
  const cashRevenue = invoices.filter(i => i.paymentMethod === 'Espèces' && i.paidAmount > 0).reduce((s, i) => s + i.paidAmount, 0)
  const insuranceRevenue = invoices.filter(i => i.paymentMethod?.includes('Assurance') && i.paidAmount > 0).reduce((s, i) => s + i.paidAmount, 0)

  const orangeCount = mobileMoneyTransactions.filter(t => t.provider === 'Orange Money').length
  const mtnCount = mobileMoneyTransactions.filter(t => t.provider === 'MTN MoMo').length

  // Revenue by service
  const serviceData = [
    { name: 'Consultations', value: 380000, color: '#10b981' },
    { name: 'Laboratoire', value: 150000, color: '#06b6d4' },
    { name: 'Pharmacie', value: 220000, color: '#f59e0b' },
    { name: 'Hospitalisation', value: 950000, color: '#8b5cf6' },
    { name: 'Urgences', value: 350000, color: '#ef4444' },
    { name: 'Maternité', value: 180000, color: '#ec4899' },
  ]

  // Daily revenue data
  const dailyData = [
    { name: 'Lun', revenu: 180000 },
    { name: 'Mar', revenu: 220000 },
    { name: 'Mer', revenu: 195000 },
    { name: 'Jeu', revenu: 310000 },
    { name: 'Ven', revenu: 275000 },
    { name: 'Sam', revenu: 340000 },
    { name: 'Dim', revenu: 290000 },
  ]

  // Monthly trend
  const monthlyData = [
    { name: 'Nov', revenu: 1800000 },
    { name: 'Déc', revenu: 2100000 },
    { name: 'Jan', revenu: 1950000 },
    { name: 'Fév', revenu: 2200000 },
    { name: 'Mar', revenu: 2400000 },
    { name: 'Avr', revenu: 2100000 },
    { name: 'Mai', revenu: 2450000 },
  ]

  // Payment method distribution
  const methodData = [
    { name: 'Mobile Money', value: mmRevenue || 45 },
    { name: 'Espèces', value: cashRevenue || 35 },
    { name: 'Assurance', value: insuranceRevenue || 20 },
  ]

  const mmSplitData = [
    { name: 'Orange Money', value: orangeCount || 1 },
    { name: 'MTN MoMo', value: mtnCount || 1 },
  ]

  // Top debtors
  const topDebtors = invoices
    .filter(i => i.status === 'En attente' || i.status === 'Partielle')
    .map(i => ({ name: i.patientName, amount: i.total - i.paidAmount, id: i.id }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Revenu total", value: totalRevenue, sub: 'GNF', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', trend: '+12%' },
          { label: 'Mobile Money', value: mmRevenue, sub: 'GNF', icon: Smartphone, color: 'from-orange-500 to-amber-600', trend: '+28%' },
          { label: 'Impayés', value: outstandingAmount, sub: 'GNF', icon: AlertTriangle, color: 'from-red-500 to-rose-600', trend: '-5%' },
          { label: 'Proj. mois prochain', value: 2600000, sub: 'GNF', icon: BarChart3, color: 'from-violet-500 to-purple-600', trend: '+8%' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <stat.icon className="size-4 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  <AnimatedCounter value={stat.value} suffix={` ${stat.sub}`} />
                </p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${stat.trend.startsWith('+') && stat.label !== 'Impayés' ? 'text-emerald-600' : stat.trend.startsWith('-') && stat.label === 'Impayés' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stat.trend.startsWith('+') ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {stat.trend} vs mois dernier
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1">
          <TabsTrigger value="revenue" className="text-xs">Revenus</TabsTrigger>
          <TabsTrigger value="methods" className="text-xs">Moyens de paiement</TabsTrigger>
          <TabsTrigger value="services" className="text-xs">Par service</TabsTrigger>
          <TabsTrigger value="debtors" className="text-xs">Impayés</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <Card className="border-slate-200/60 dark:border-slate-800/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Revenu quotidien (cette semaine)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`${v.toLocaleString()} GNF`, 'Revenu']} />
                      <Bar dataKey="revenu" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-slate-200/60 dark:border-slate-800/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tendance mensuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`${v.toLocaleString()} GNF`, 'Revenu']} />
                      <Line type="monotone" dataKey="revenu" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <Card className="border-slate-200/60 dark:border-slate-800/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Répartition par moyen de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={methodData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {methodData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v.toLocaleString()} GNF`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-slate-200/60 dark:border-slate-800/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Orange Money vs MTN MoMo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={mmSplitData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {mmSplitData.map((_, i) => <Cell key={i} fill={PIE_COLORS_MM[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Revenu par service</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString()} GNF`]} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {serviceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="debtors">
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Principaux débiteurs</CardTitle>
                <CardDescription className="text-xs">Factures impayées ou partielles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topDebtors.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Aucun impayé</p>
                  ) : (
                    topDebtors.map((debtor, i) => (
                      <div key={debtor.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-center size-8 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 text-xs font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{debtor.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{debtor.id}</p>
                        </div>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">{debtor.amount.toLocaleString()} GNF</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
