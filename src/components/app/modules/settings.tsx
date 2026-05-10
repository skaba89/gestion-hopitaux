'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings2, User, Bell, Palette, Globe, ShieldCheck, Info, Moon, Sun, Monitor, Check, Smartphone, LogOut, Key,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }

export function SettingsPage() {
  const [notifications, setNotifications] = useState({
    appointments: true,
    labResults: true,
    stockAlerts: true,
    emergencyAlerts: true,
    billingAlerts: false,
    emailNotif: true,
    smsNotif: false,
  })
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [language, setLanguage] = useState('fr')
  const [theme, setTheme] = useState('system')

  const sessions = [
    { device: 'Chrome — Windows', ip: '192.168.1.45', time: 'Actif', current: true },
    { device: 'Safari — iPhone', ip: '192.168.1.102', time: 'Il y a 2h', current: false },
    { device: 'Firefox — MacOS', ip: '192.168.1.88', time: 'Hier', current: false },
  ]

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1000px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20"><Settings2 className="size-5 text-white" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Paramètres</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configuration de votre compte et préférences</p>
        </div>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="profile"><User className="size-3.5 mr-1.5" /> Profil</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="size-3.5 mr-1.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="size-3.5 mr-1.5" /> Apparence</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="size-3.5 mr-1.5" /> Sécurité</TabsTrigger>
          <TabsTrigger value="about"><Info className="size-3.5 mr-1.5" /> À propos</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <CardTitle className="text-base">Informations personnelles</CardTitle>
                <CardDescription>Modifiez vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-xl">MB</div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Dr. Mamadou Bah</p>
                    <p className="text-xs text-slate-500">Médecin — Médecine Interne</p>
                    <Button variant="outline" size="sm" className="text-xs mt-1">Changer la photo</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nom complet</Label><Input defaultValue="Dr. Mamadou Bah" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" defaultValue="m.bah@healthflow.gn" /></div>
                  <div className="space-y-2"><Label>Téléphone</Label><Input defaultValue="+224 621 00 00 01" /></div>
                  <div className="space-y-2"><Label>Identifiant professionnel</Label><Input defaultValue="MED-GN-2018-0452" disabled className="bg-slate-50 dark:bg-slate-800" /></div>
                </div>
                <div className="space-y-2"><Label>Département</Label><Input defaultValue="Médecine Interne — Hôpital Donka" disabled className="bg-slate-50 dark:bg-slate-800" /></div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Ancien mot de passe</Label><Input type="password" placeholder="••••••••" /></div>
                  <div className="space-y-2"><Label>Nouveau mot de passe</Label><Input type="password" placeholder="••••••••" /></div>
                </div>
                <div className="flex justify-end"><Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">Sauvegarder</Button></div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <CardTitle className="text-base">Préférences de notification</CardTitle>
                <CardDescription>Choisissez les notifications que vous souhaitez recevoir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'appointments' as const, label: 'Rendez-vous', desc: 'Rappels et confirmations de rendez-vous' },
                  { key: 'labResults' as const, label: 'Résultats de laboratoire', desc: 'Notification quand les résultats sont prêts' },
                  { key: 'stockAlerts' as const, label: 'Alertes stock pharmacie', desc: 'Médicaments en rupture ou stock faible' },
                  { key: 'emergencyAlerts' as const, label: 'Alertes urgentes', desc: 'Cas urgents et triage critique' },
                  { key: 'billingAlerts' as const, label: 'Alertes facturation', desc: 'Factures en retard et paiements' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <Switch checked={notifications[item.key]} onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [item.key]: v }))} />
                  </div>
                ))}
                <Separator />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Canaux de notification</p>
                {[
                  { key: 'emailNotif' as const, label: 'Email', desc: 'Recevoir par email', icon: '📧' },
                  { key: 'smsNotif' as const, label: 'SMS', desc: 'Recevoir par SMS (Orange/MTN)', icon: '📱' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <Switch checked={notifications[item.key]} onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [item.key]: v }))} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <CardTitle className="text-base">Apparence</CardTitle>
                <CardDescription>Personnalisez l&apos;affichage de l&apos;application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Thème</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Clair', icon: Sun },
                      { value: 'dark', label: 'Sombre', icon: Moon },
                      { value: 'system', label: 'Système', icon: Monitor },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => setTheme(opt.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === opt.value ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                      >
                        <opt.icon className={`size-6 ${theme === opt.value ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                        <span className={`text-xs font-medium ${theme === opt.value ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500'}`}>{opt.label}</span>
                        {theme === opt.value && <Check className="size-4 text-teal-500" />}
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Langue</p>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div variants={itemVariants} className="space-y-4">
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <CardTitle className="text-base">Sécurité du compte</CardTitle>
                <CardDescription>Protégez votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Authentification à deux facteurs (MFA)</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ajouter une couche de sécurité supplémentaire via TOTP</p>
                  </div>
                  <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
                </div>
                {mfaEnabled && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">MFA activé</span>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Utilisez votre application d&apos;authentification pour générer des codes.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <CardTitle className="text-base">Sessions actives</CardTitle>
                <CardDescription>Gérez vos appareils connectés</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.map((session, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Smartphone className="size-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{session.device}</p>
                        <p className="text-xs text-slate-500">{session.ip} • {session.time}</p>
                      </div>
                    </div>
                    {session.current ? (
                      <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px]">Session actuelle</Badge>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-xs text-rose-500 hover:text-rose-600"><LogOut className="size-3 mr-1" /> Déconnecter</Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about">
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">HealthFlow Guinea</CardTitle>
                    <CardDescription>Système d&apos;Information Hospitalier</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Version', value: '1.0.0-beta' },
                  { label: 'Build', value: '2026.03.05' },
                  { label: 'Licence', value: 'DataSphere Innovation — Licence commerciale' },
                  { label: 'Base de données', value: 'SQLite (Prisma ORM)' },
                  { label: 'Framework', value: 'Next.js 16 + TypeScript' },
                  { label: 'UI', value: 'Tailwind CSS + shadcn/ui' },
                  { label: 'Support', value: 'support@datasphere-gn.com' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
                <Separator />
                <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                  © 2026 DataSphere Innovation. Tous droits réservés.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
