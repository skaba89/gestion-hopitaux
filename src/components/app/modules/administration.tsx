'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Plus, Search, User, Pencil, Trash2, ShieldCheck, Key, Building2, Settings2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDataStore } from '@/lib/data-store'
import { useStore } from '@/lib/store'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

type UserRole = 'Administrateur' | 'Médecin' | 'Infirmier' | 'Pharmacien' | 'Laborantin' | 'Réceptionniste' | 'Comptable' | 'Direction'

interface UserRecord {
  id: number; name: string; email: string; phone: string; role: UserRole; department: string; status: 'Actif' | 'Inactif'; lastLogin: string
}

const demoUsers: UserRecord[] = [
  { id: 1, name: 'Dr. Mamadou Bah', email: 'm.bah@healthflow.gn', phone: '+224 621 00 00 01', role: 'Médecin', department: 'Médecine Interne', status: 'Actif', lastLogin: '05/03/2026 08:30' },
  { id: 2, name: 'Dr. Aissatou Sylla', email: 'a.sylla@healthflow.gn', phone: '+224 621 00 00 02', role: 'Médecin', department: 'Cardiologie', status: 'Actif', lastLogin: '05/03/2026 07:45' },
  { id: 3, name: 'Kadiatou Souaré', email: 'k.souare@healthflow.gn', phone: '+224 621 00 00 03', role: 'Infirmier', department: 'Urgences', status: 'Actif', lastLogin: '04/03/2026 22:00' },
  { id: 4, name: 'Abdoulaye Keita', email: 'a.keita@healthflow.gn', phone: '+224 621 00 00 04', role: 'Pharmacien', department: 'Pharmacie', status: 'Actif', lastLogin: '05/03/2026 08:00' },
  { id: 5, name: 'Mariama Condé', email: 'm.conde@healthflow.gn', phone: '+224 621 00 00 05', role: 'Laborantin', department: 'Laboratoire', status: 'Actif', lastLogin: '05/03/2026 07:30' },
  { id: 6, name: 'Fatoumata Diallo', email: 'f.diallo@healthflow.gn', phone: '+224 621 00 00 06', role: 'Réceptionniste', department: 'Accueil', status: 'Actif', lastLogin: '05/03/2026 08:15' },
  { id: 7, name: 'Ibrahim Touré', email: 'i.toure@healthflow.gn', phone: '+224 621 00 00 07', role: 'Comptable', department: 'Comptabilité', status: 'Inactif', lastLogin: '20/02/2026 16:00' },
  { id: 8, name: 'Moussa Kaba', email: 'm.kaba@healthflow.gn', phone: '+224 621 00 00 08', role: 'Administrateur', department: 'DSI', status: 'Actif', lastLogin: '05/03/2026 09:00' },
]

const roleColors: Record<UserRole, string> = {
  'Administrateur': 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  'Médecin': 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
  'Infirmier': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  'Pharmacien': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Laborantin': 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  'Réceptionniste': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  'Comptable': 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  'Direction': 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const rolePermissions: Record<UserRole, string[]> = {
  'Administrateur': ['Tous les accès', 'Gestion utilisateurs', 'Configuration système', 'Audit logs'],
  'Médecin': ['Patients', 'Consultations', 'Ordonnances', 'Laboratoire', 'Hospitalisation'],
  'Infirmier': ['Patients (lecture)', 'Consultations (lecture)', 'Constantes vitales', 'Soins'],
  'Pharmacien': ['Pharmacie', 'Stock', 'Dispensation', 'Alertes'],
  'Laborantin': ['Laboratoire', 'Résultats', 'Validation', 'Catalogue'],
  'Réceptionniste': ['Patients', 'Rendez-vous', 'Accueil', 'Facturation (lecture)'],
  'Comptable': ['Facturation', 'Paiements', 'Rapports financiers'],
  'Direction': ['Dashboard', 'Rapports', 'Statistiques', 'Configuration (lecture)'],
}

export function AdministrationPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)

  const { patients, appointments, medications, beds, emergencies, invoices } = useDataStore()
  const { user } = useStore()

  // Real stats from data store
  const activePatients = patients.filter(p => p.status === 'Actif').length
  const occupiedBeds = beds.filter(b => b.status === 'Occupé').length
  const paidInvoices = invoices.filter(i => i.status === 'Payée').length
  const pendingEmergencies = emergencies.filter(e => e.status === 'En attente').length

  const filtered = demoUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20"><Shield className="size-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Administration</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gestion des utilisateurs et configuration</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
          <Plus className="size-4 mr-2" /> Nouvel utilisateur
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Patients actifs', value: activePatients, color: 'from-teal-500 to-emerald-600' },
          { label: 'Lits occupés', value: occupiedBeds, color: 'from-emerald-500 to-green-600' },
          { label: 'Factures payées', value: paidInvoices, color: 'from-cyan-500 to-teal-600' },
          { label: 'Urgences en attente', value: pendingEmergencies, color: 'from-rose-500 to-red-600' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
          <TabsTrigger value="establishment">Établissement</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4">
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="pt-4 pb-3">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input placeholder="Rechercher nom, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Rôle" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      {Object.keys(roleColors).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="mt-4 space-y-2">
            {filtered.map((user, index) => (
              <motion.div key={user.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center justify-center size-10 rounded-full bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-sm shrink-0">
                  {user.name.split(' ').slice(-1)[0][0]}{user.name.split(' ')[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${roleColors[user.role]}`}>{user.role}</span>
                    <Badge variant={user.status === 'Actif' ? 'default' : 'secondary'} className={`text-[10px] ${user.status === 'Actif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{user.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email} • {user.department} • Dernière connexion: {user.lastLogin}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="size-8 text-slate-400 hover:text-teal-600" onClick={() => { setSelectedUser(user); setShowEditDialog(true) }}><Pencil className="size-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="size-8 text-slate-400 hover:text-rose-600"><Trash2 className="size-3.5" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.entries(rolePermissions) as [UserRole, string[]][]).map(([role, perms], index) => (
              <motion.div key={role} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                <Card className="border-slate-200/60 dark:border-slate-800/60 h-full">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${roleColors[role]}`}>{role}</span>
                      <span className="text-xs text-slate-400">{demoUsers.filter(u => u.role === role).length} utilisateur(s)</span>
                    </div>
                    <div className="space-y-1.5">
                      {perms.map(perm => (
                        <div key={perm} className="flex items-center gap-2 text-xs">
                          <ShieldCheck className="size-3 text-teal-500" />
                          <span className="text-slate-600 dark:text-slate-400">{perm}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Establishment Tab */}
        <TabsContent value="establishment" className="mt-4">
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-teal-600" />
                <CardTitle className="text-base">{user.establishment}</CardTitle>
              </div>
              <CardDescription>Configuration de l&apos;établissement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs text-slate-500">Nom</Label><Input defaultValue={user.establishment} /></div>
                <div className="space-y-2"><Label className="text-xs text-slate-500">Type</Label><Select defaultValue="hospital"><SelectTrigger /><SelectContent><SelectItem value="hospital">Hôpital</SelectItem><SelectItem value="clinic">Clinique</SelectItem><SelectItem value="center">Centre de santé</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label className="text-xs text-slate-500">Adresse</Label><Input defaultValue="Avenue de la République, Conakry" /></div>
                <div className="space-y-2"><Label className="text-xs text-slate-500">Région</Label><Select defaultValue="conakry"><SelectTrigger /><SelectContent><SelectItem value="conakry">Conakry</SelectItem><SelectItem value="kankan">Kankan</SelectItem><SelectItem value="nzer">Nzérékoré</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label className="text-xs text-slate-500">Téléphone</Label><Input defaultValue={user.phone} /></div>
                <div className="space-y-2"><Label className="text-xs text-slate-500">Email</Label><Input defaultValue={user.email} /></div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">Sauvegarder</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New User Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="size-5 text-teal-600" /> Nouvel utilisateur</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom complet *</Label><Input placeholder="Nom..." /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="email@healthflow.gn" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Téléphone</Label><Input placeholder="+224 6XX XX XX XX" /></div>
              <div className="space-y-2"><Label>Rôle *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent>{Object.keys(roleColors).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Département</Label><Input placeholder="Département..." /></div>
              <div className="space-y-2"><Label>Mot de passe *</Label><Input type="password" placeholder="••••••••" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={() => setShowNewDialog(false)}>Créer utilisateur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[480px]">
          {selectedUser && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="size-5 text-teal-600" /> Modifier utilisateur</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nom</Label><Input defaultValue={selectedUser.name} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input defaultValue={selectedUser.email} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Téléphone</Label><Input defaultValue={selectedUser.phone} /></div>
                  <div className="space-y-2"><Label>Rôle</Label><Select defaultValue={selectedUser.role}><SelectTrigger /><SelectContent>{Object.keys(roleColors).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Statut</Label><Select defaultValue={selectedUser.status}><SelectTrigger /><SelectContent><SelectItem value="Actif">Actif</SelectItem><SelectItem value="Inactif">Inactif</SelectItem></SelectContent></Select></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
                <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={() => setShowEditDialog(false)}>Sauvegarder</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
