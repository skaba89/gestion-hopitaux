'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle2, XCircle, Download, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PERMISSIONS_MATRIX, type HFRole, type Resource, type PermissionAction, hasPermission } from '@/lib/rbac'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

const allRoles: HFRole[] = ['Administrateur', 'Médecin', 'Infirmier', 'Laborantin', 'Pharmacien', 'Secrétaire', 'ASC', 'Patient']

const permissionRows: { resource: Resource; action: PermissionAction; label: string }[] = [
  { resource: 'patients', action: 'read', label: 'Patients — Lecture' },
  { resource: 'patients', action: 'write', label: 'Patients — Écriture' },
  { resource: 'patients', action: 'delete', label: 'Patients — Suppression' },
  { resource: 'patients', action: 'export', label: 'Patients — Export' },
  { resource: 'patients', action: 'download', label: 'Patients — Téléchargement' },
  { resource: 'consultations', action: 'read', label: 'Consultations — Lecture' },
  { resource: 'consultations', action: 'write', label: 'Consultations — Écriture' },
  { resource: 'laboratory', action: 'read', label: 'Laboratoire — Lecture' },
  { resource: 'laboratory', action: 'write', label: 'Laboratoire — Écriture' },
  { resource: 'pharmacy', action: 'read', label: 'Pharmacie — Lecture' },
  { resource: 'pharmacy', action: 'write', label: 'Pharmacie — Écriture' },
  { resource: 'hospitalization', action: 'read', label: 'Hospitalisation — Lecture' },
  { resource: 'emergencies', action: 'read', label: 'Urgences — Lecture' },
  { resource: 'emergencies', action: 'write', label: 'Urgences — Écriture' },
  { resource: 'maternity', action: 'read', label: 'Maternité — Lecture' },
  { resource: 'vaccinations', action: 'read', label: 'Vaccination — Lecture' },
  { resource: 'billing', action: 'read', label: 'Facturation — Lecture' },
  { resource: 'billing', action: 'write', label: 'Facturation — Écriture' },
  { resource: 'billing', action: 'payments', label: 'Facturation — Paiements' },
  { resource: 'insurance', action: 'read', label: 'Assurance — Lecture' },
  { resource: 'insurance', action: 'write', label: 'Assurance — Écriture' },
  { resource: 'ai', action: 'diagnostic', label: 'IA — Diagnostic' },
  { resource: 'ai', action: 'interactions', label: 'IA — Interactions' },
  { resource: 'ai', action: 'surveillance', label: 'IA — Surveillance' },
  { resource: 'telemedicine', action: 'read', label: 'Télémédecine — Lecture' },
  { resource: 'telemedicine', action: 'write', label: 'Télémédecine — Écriture' },
  { resource: 'messaging', action: 'send', label: 'Messagerie — Envoi' },
  { resource: 'admin', action: 'read', label: 'Administration — Lecture' },
  { resource: 'admin', action: 'write', label: 'Administration — Écriture' },
  { resource: 'asc', action: 'read', label: 'ASC — Accès' },
]

export function PermissionMatrix() {
  const [selectedRole, setSelectedRole] = useState<HFRole>('Médecin')

  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg">
          <Shield className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Matrice de permissions</h1>
          <p className="text-xs text-slate-500">Gestion des accès par rôle</p>
        </div>
      </motion.div>

      {/* Role selector */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {allRoles.map(role => (
                <Button
                  key={role}
                  size="sm"
                  variant={selectedRole === role ? 'default' : 'outline'}
                  className={`text-xs h-8 ${selectedRole === role ? 'bg-teal-600' : ''}`}
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Permission Matrix */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">Permission</th>
                    {allRoles.map(role => (
                      <th key={role} className={`py-2.5 px-2 font-medium text-center min-w-[80px] ${selectedRole === role ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300' : 'text-slate-500'}`}>
                        <span className="block text-[10px]">{role}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionRows.map((row, i) => (
                    <tr key={`${row.resource}-${row.action}`} className={`border-b border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}>
                      <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">{row.label}</td>
                      {allRoles.map(role => {
                        const allowed = hasPermission(role, row.resource, row.action)
                        const perm = PERMISSIONS_MATRIX[role]?.find(
                          p => p.resource === row.resource && p.action === row.action
                        )
                        const isHighlight = selectedRole === role

                        return (
                          <td key={role} className={`py-2 px-2 text-center ${isHighlight ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''}`}>
                            {allowed ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <CheckCircle2 className="size-4 text-emerald-500" />
                                {perm?.withAuthorization && <span className="text-[8px] text-amber-500">Auth*</span>}
                                {perm?.ownDataOnly && <span className="text-[8px] text-blue-500">Propre</span>}
                                {perm?.withAdminAuth && <span className="text-[8px] text-purple-500">Admin**</span>}
                              </div>
                            ) : (
                              <XCircle className="size-4 text-slate-300 dark:text-slate-600 mx-auto" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> Autorisé
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="size-3.5 text-slate-400" /> Refusé
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-amber-500 font-medium">Auth*</span> Avec autorisation
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-blue-500 font-medium">Propre</span> Données propres uniquement
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-purple-500 font-medium">Admin**</span> Autorisation admin requise
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export/Import */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="size-3.5 mr-1" /> Exporter config
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Upload className="size-3.5 mr-1" /> Importer config
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
