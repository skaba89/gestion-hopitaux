'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Lock, AlertTriangle, Users, Activity, Eye,
  KeyRound, Settings, LogOut, RefreshCw, ShieldAlert
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { calculateSecurityScore, getActiveSessionCount, destroyAllSessions } from '@/lib/security-client'
import { useToast } from '@/hooks/use-toast'

interface AuditEntry {
  id: string
  userName: string
  userRole: string
  description: string
  severity: string
  action: string
  createdAt: string
}

interface AuditStats {
  totalEntries: number
  deniedCount: number
  criticalCount: number
  csrfViolations: number
  rateLimitHits: number
  loginFailures: number
  recentDenials: AuditEntry[]
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

export function SecurityDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<AuditStats>({
    totalEntries: 0, deniedCount: 0, criticalCount: 0,
    csrfViolations: 0, rateLimitHits: 0, loginFailures: 0, recentDenials: [],
  })

  useEffect(() => {
    // Fetch stats from the audit API
    fetch('/api/audit?stats=true')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setStats(data.data || data.stats || data)
      })
      .catch(() => {})
  }, [])

  const securityScore = calculateSecurityScore({
    mfaEnabled: true,
    strongPassword: true,
    recentAuditReview: true,
    noFailedAttempts: stats.deniedCount < 5,
    csrfEnabled: true,
    encryptionEnabled: true,
    rlsEnabled: true,
    rateLimitEnabled: true,
  })

  const handleForceLogout = () => {
    const count = destroyAllSessions()
    toast({ title: 'Sessions terminées', description: `${count} sessions ont été fermées.` })
  }

  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg">
          <Shield className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tableau de bord sécurité</h1>
          <p className="text-xs text-slate-500">Vue d&apos;ensemble de la sécurité du système</p>
        </div>
      </motion.div>

      {/* Security Score */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
          <div className={`h-2 ${
            securityScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
            securityScore >= 60 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
            'bg-gradient-to-r from-red-500 to-rose-500'
          }`} />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Score de sécurité</p>
                <p className={`text-4xl font-bold ${
                  securityScore >= 80 ? 'text-emerald-600' :
                  securityScore >= 60 ? 'text-amber-600' :
                  'text-red-600'
                }`}>{securityScore}%</p>
              </div>
              <div className="size-24 relative">
                <svg className="size-24 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" strokeDasharray={`${securityScore} 100`} className={
                    securityScore >= 80 ? 'text-emerald-500' :
                    securityScore >= 60 ? 'text-amber-500' : 'text-red-500'
                  } stroke="currentColor" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className={`size-8 ${
                    securityScore >= 80 ? 'text-emerald-500' :
                    securityScore >= 60 ? 'text-amber-500' : 'text-red-500'
                  }`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Sessions actives', value: getActiveSessionCount(), icon: Users, color: 'from-teal-500 to-emerald-600' },
          { label: 'Tentatives échouées', value: stats.deniedCount, icon: ShieldAlert, color: 'from-red-500 to-rose-600' },
          { label: 'Événements critiques', value: stats.criticalCount, icon: AlertTriangle, color: 'from-amber-500 to-orange-600' },
          { label: "Entrées d'audit", value: stats.totalEntries, icon: Eye, color: 'from-slate-500 to-slate-700' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <stat.icon className="size-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Security Features Status */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">État des mesures de sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Chiffrement AES-256', enabled: true, icon: Lock },
                { name: 'Protection CSRF', enabled: true, icon: KeyRound },
                { name: 'Sécurité au niveau des lignes (RLS)', enabled: true, icon: Shield },
                { name: "Contrôle d'accès basé sur les rôles (RBAC)", enabled: true, icon: Users },
                { name: "Journal d'audit", enabled: true, icon: Eye },
                { name: 'Limitation du taux de requêtes', enabled: true, icon: Activity },
                { name: 'Authentification multi-facteurs', enabled: true, icon: KeyRound },
                { name: 'En-têtes de sécurité', enabled: true, icon: ShieldAlert },
              ].map(feature => (
                <div key={feature.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <feature.icon className="size-4 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature.name}</span>
                  </div>
                  <Badge className={feature.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                    {feature.enabled ? 'Activé' : 'Désactivé'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Denied Attempts */}
      {stats.recentDenials.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-red-200/60 dark:border-red-800/40 bg-red-50/30 dark:bg-red-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="size-4" /> Tentatives d&apos;accès récentes refusées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recentDenials.slice(0, 5).map((entry: AuditEntry) => (
                  <div key={entry.id} className="flex items-center justify-between text-xs">
                    <span className="text-red-700 dark:text-red-300">{entry.userName} ({entry.userRole})</span>
                    <span className="text-red-600 dark:text-red-400">{entry.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="destructive" size="sm" className="text-xs" onClick={handleForceLogout}>
                <LogOut className="size-3.5 mr-1" /> Fermer toutes les sessions
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <RefreshCw className="size-3.5 mr-1" /> Régénérer les tokens
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Settings className="size-3.5 mr-1" /> Mode maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
