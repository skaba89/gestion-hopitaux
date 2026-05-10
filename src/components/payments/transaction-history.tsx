'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, ChevronLeft, ChevronRight, Smartphone, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDataStore, type MobileMoneyTransaction, type MobileMoneyProvider, type TransactionStatus } from '@/lib/data-store'
import { PaymentStatusBadge } from './payment-status-badge'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

const PAGE_SIZE = 10

export function TransactionHistory() {
  const { mobileMoneyTransactions, updateMobileMoneyTransaction } = useDataStore()
  const [search, setSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let result = [...mobileMoneyTransactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t => 
        t.reference.toLowerCase().includes(q) || 
        t.patientName.toLowerCase().includes(q) ||
        t.phoneNumber.includes(q) ||
        t.id.toLowerCase().includes(q)
      )
    }
    
    if (providerFilter !== 'all') {
      result = result.filter(t => t.provider === providerFilter)
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter)
    }
    
    return result
  }, [mobileMoneyTransactions, search, providerFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const totalAmount = filtered.filter(t => t.status === 'Réussi').reduce((s, t) => s + t.amount, 0)
  const pendingAmount = filtered.filter(t => t.status === 'En attente' || t.status === 'En cours').reduce((s, t) => s + t.amount, 0)

  const handleRefresh = (txn: MobileMoneyTransaction) => {
    // Simulate status check
    const rand = Math.random()
    let newStatus: TransactionStatus
    if (rand < 0.6) newStatus = 'Réussi'
    else if (rand < 0.8) newStatus = 'En cours'
    else newStatus = txn.status

    updateMobileMoneyTransaction(txn.id, { status: newStatus, updatedAt: new Date().toISOString() })
  }

  const exportCSV = () => {
    const headers = 'Référence,Fournisseur,Téléphone,Montant,Devise,Motif,Statut,Date\n'
    const rows = filtered.map(t => 
      `${t.reference},${t.provider},${t.phoneNumber},${t.amount},${t.currency},${t.reason},${t.status},${t.createdAt}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-mobile-money-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total réussi', value: `${(totalAmount / 1000).toFixed(0)}K`, sub: 'GNF', icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
          { label: 'En attente', value: `${(pendingAmount / 1000).toFixed(0)}K`, sub: 'GNF', icon: Clock, color: 'from-amber-500 to-orange-600' },
          { label: 'Orange Money', value: filtered.filter(t => t.provider === 'Orange Money').length, sub: 'transactions', icon: Smartphone, color: 'from-orange-500 to-amber-600' },
          { label: 'MTN MoMo', value: filtered.filter(t => t.provider === 'MTN MoMo').length, sub: 'transactions', icon: Smartphone, color: 'from-yellow-500 to-orange-600' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="size-3.5 text-slate-400" />
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value} <span className="text-[10px] font-normal text-slate-400">{stat.sub}</span></p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="pt-3 pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <Input placeholder="Référence, patient, téléphone..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} className="pl-8 h-8 text-sm" />
              </div>
              <Select value={providerFilter} onValueChange={v => { setProviderFilter(v); setPage(0) }}>
                <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs"><SelectValue placeholder="Fournisseur" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Orange Money">Orange Money</SelectItem>
                  <SelectItem value="MTN MoMo">MTN MoMo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0) }}>
                <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Réussi">Réussi</SelectItem>
                  <SelectItem value="Échoué">Échoué</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={exportCSV}>
                <Download className="size-3.5" /> Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction List */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Transactions ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {paginated.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">Aucune transaction trouvée</div>
              ) : (
                paginated.map((txn) => (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className={`flex items-center justify-center size-9 rounded-lg shrink-0 ${
                      txn.provider === 'Orange Money' ? 'bg-orange-50 dark:bg-orange-950/30' : 'bg-yellow-50 dark:bg-yellow-950/30'
                    }`}>
                      <Smartphone className={`size-4 ${txn.provider === 'Orange Money' ? 'text-orange-500' : 'text-yellow-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{txn.patientName}</span>
                        <PaymentStatusBadge status={txn.status} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{txn.reference}</span>
                        <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{txn.provider}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{txn.amount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{txn.currency}</span></p>
                      <p className="text-[10px] text-slate-400">{new Date(txn.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {(txn.status === 'En attente' || txn.status === 'En cours') && (
                      <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => handleRefresh(txn)}>
                        <RefreshCw className="size-3.5 text-slate-400" />
                      </Button>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="size-7" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <span className="text-xs text-slate-500 px-2">{page + 1} / {totalPages}</span>
                  <Button variant="outline" size="icon" className="size-7" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </motion.div>
  )
}
