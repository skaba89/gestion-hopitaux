'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, AlertTriangle, Eye, Clock, Users, Lock, Unlock,
  Activity, Search, Download, RefreshCw, Ban, Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAuditLogs, getAuditStats, type AuditAction, type AuditSeverity } from '@/lib/audit-logger'
import { calculateSecurityScore, getActiveSessionCount, destroyAllSessions } from '@/lib/security'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

const actionLabels: Record<string, string> = {
  CREATE: 'Création',
  READ: 'Lecture',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  LOGIN: 'Connexion',
  LOGOUT: 'Déconnexion',
  EXPORT: 'Export',
  PRINT: 'Impression',
  ACCESS_DENIED: 'Accès refusé',
  MFA_CHALLENGE: 'MFA',
  MFA_SUCCESS: 'MFA OK',
  MFA_FAILURE: 'MFA Échoué',
  SESSION_EXPIRED: 'Session expirée',
  PASSWORD_CHANGE: 'Changement mot de passe',
  ROLE_CHANGE: 'Changement rôle',
  PERMISSION_CHANGE: 'Changement permission',
}

const severityStyles: Record<AuditSeverity, string> = {
  INFO: 'bg-blue-100 text-blue-700',
  WARNING: 'bg-amber-100 text-amber-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

export function AuditLogViewer() {
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterModule, setFilterModule] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const logs = getAuditLogs({
    action: filterAction !== 'all' ? filterAction as AuditAction : undefined,
    module: filterModule !== 'all' ? filterModule : undefined,
    severity: filterSeverity !== 'all' ? filterSeverity as AuditSeverity : undefined,
    limit: 50,
  })

  const stats = getAuditStats()

  const filteredLogs = searchQuery
    ? logs.filter(l =>
        l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.entityId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs

  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg">
          <Eye className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Journal d&apos;audit</h1>
          <p className="text-xs text-slate-500">Suivi de toutes les activités système</p>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total entrées', value: stats.totalEntries, icon: Activity, color: 'from-slate-500 to-slate-700' },
          { label: 'Événements critiques', value: stats.criticalCount, icon: AlertTriangle, color: 'from-red-500 to-red-700' },
          { label: 'Accès refusés', value: stats.deniedCount, icon: Ban, color: 'from-amber-500 to-orange-600' },
          { label: 'Sessions actives', value: getActiveSessionCount(), icon: Users, color: 'from-teal-500 to-emerald-600' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-4 pb-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="max-w-xs h-9 text-sm"
              />
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes actions</SelectItem>
                  <SelectItem value="CREATE">Création</SelectItem>
                  <SelectItem value="READ">Lecture</SelectItem>
                  <SelectItem value="UPDATE">Modification</SelectItem>
                  <SelectItem value="DELETE">Suppression</SelectItem>
                  <SelectItem value="LOGIN">Connexion</SelectItem>
                  <SelectItem value="ACCESS_DENIED">Accès refusé</SelectItem>
                  <SelectItem value="EXPORT">Export</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Sévérité" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Attention</SelectItem>
                  <SelectItem value="CRITICAL">Critique</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9 text-xs" title="Exporter CSV">
                <Download className="size-3.5 mr-1" /> Exporter
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Log entries */}
      <motion.div variants={itemVariants} className="space-y-2">
        {filteredLogs.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={`size-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  log.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950/40' :
                  log.severity === 'WARNING' ? 'bg-amber-100 dark:bg-amber-950/40' :
                  'bg-blue-100 dark:bg-blue-950/40'
                }`}>
                  {log.severity === 'CRITICAL' ? <AlertTriangle className="size-3.5 text-red-600" /> :
                   log.action === 'ACCESS_DENIED' ? <Ban className="size-3.5 text-amber-600" /> :
                   <Activity className="size-3.5 text-blue-600" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white">{log.description}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] text-slate-400">{log.userName} ({log.userRole})</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString('fr-FR')}</span>
                    {log.ipAddress && <span className="text-[10px] text-slate-400">• IP: {log.ipAddress}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge className={`${severityStyles[log.severity]} text-[10px]`}>{log.severity}</Badge>
                <Badge variant="outline" className="text-[10px]">{actionLabels[log.action] || log.action}</Badge>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
