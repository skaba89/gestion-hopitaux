'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Phone,
  Lock,
  LogOut,
  User,
  Calendar,
  FileText,
  Clock,
  Plus,
  ChevronRight,
  AlertTriangle,
  Droplets,
  Activity,
  Search,
  Users,
  X,
  ArrowLeft,
  Eye,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/lib/store'
import { useDataStore, type FamilyAccount, type FamilyMember } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'

/* ─────────── Login Screen ─────────── */

function PortalLogin() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setPortalUser } = useStore()
  const { familyAccounts } = useDataStore()
  const { toast } = useToast()

  const handleSendCode = () => {
    if (!phone.trim()) return
    const account = familyAccounts.find((a) => a.primaryPhone === phone.trim())
    if (account) {
      setCodeSent(true)
      toast({
        title: 'Code de vérification',
        description: `Votre code de démonstration : ${account.verificationCode}`,
        duration: 10000,
      })
    } else {
      toast({
        title: 'Numéro non trouvé',
        description: 'Aucun compte famille trouvé avec ce numéro. Essayez +224 622 11 22 33',
        variant: 'destructive',
      })
    }
  }

  const handleLogin = () => {
    if (!codeSent || !code.trim()) return
    setLoading(true)
    const account = familyAccounts.find((a) => a.primaryPhone === phone.trim())
    if (account && account.verificationCode === code.trim()) {
      setPortalUser({ accountId: account.id, phone: account.primaryPhone, isLoggedIn: true })
      toast({ title: 'Bienvenue !', description: `Connecté en tant que ${account.primaryName}` })
    } else {
      toast({ title: 'Code invalide', description: 'Le code de vérification est incorrect.', variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' as const, bounce: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-teal-200 dark:border-teal-800 shadow-2xl shadow-teal-500/10">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/25">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Portail Patient
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Accédez à votre espace santé personnel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="+224 6XX XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-11"
                  disabled={codeSent}
                />
              </div>
            </div>

            {!codeSent ? (
              <Button
                onClick={handleSendCode}
                className="w-full h-11 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                disabled={!phone.trim()}
              >
                Envoyer le code
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Code de vérification
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="XXXX"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-10 h-11 tracking-widest text-center font-mono"
                      maxLength={4}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Code de démonstration affiché dans la notification
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setCodeSent(false); setCode('') }}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retour
                  </Button>
                  <Button
                    onClick={handleLogin}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                    disabled={code.length < 4 || loading}
                  >
                    Se connecter
                  </Button>
                </div>
              </>
            )}

            <div className="pt-4 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Démo : utilisez +224 622 11 22 33 avec le code 2233
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

/* ─────────── Family Member Card ─────────── */

function FamilyMemberCard({
  member,
  patient,
  isSelected,
  onClick,
}: {
  member: FamilyMember
  patient: { firstName: string; lastName: string; gender: string; dateOfBirth: string } | undefined
  isSelected: boolean
  onClick: () => void
}) {
  if (!patient) return null
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700 shadow-md shadow-teal-500/10'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar className={`size-10 ${isSelected ? 'ring-2 ring-teal-500' : ''}`}>
          <AvatarFallback
            className={
              member.isPrimary
                ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold'
            }
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-slate-900 dark:text-white'}`}>
            {patient.firstName} {patient.lastName}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{patient.gender === 'M' ? 'Homme' : 'Femme'} • {age} ans</span>
            {member.isPrimary && (
              <Badge className="bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-[9px] px-1.5 py-0 h-4">
                Principal
              </Badge>
            )}
          </div>
          <span className="text-[10px] text-slate-400">{member.relationship}</span>
        </div>
      </div>
    </motion.button>
  )
}

/* ─────────── Add Family Member Dialog ─────────── */

function AddFamilyMemberDialog({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>('Enfant')
  const { patients, familyAccounts, addFamilyMember } = useDataStore()
  const { toast } = useToast()

  const currentAccount = familyAccounts.find((a) => a.id === accountId)
  const existingPatientIds = currentAccount?.members.map((m) => m.patientId) ?? []
  const availablePatients = patients.filter(
    (p) => !existingPatientIds.includes(p.id) && p.status === 'Actif'
  )

  const handleAdd = () => {
    if (!selectedPatientId) {
      toast({ title: 'Sélection requise', description: 'Veuillez sélectionner un patient.', variant: 'destructive' })
      return
    }
    addFamilyMember(accountId, {
      patientId: selectedPatientId,
      relationship,
      isPrimary: false,
    })
    toast({ title: 'Membre ajouté', description: 'Le membre a été ajouté à votre compte famille.' })
    setSelectedPatientId('')
    setRelationship('Enfant')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed border-teal-300 dark:border-teal-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter un membre
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un membre de la famille</DialogTitle>
          <DialogDescription>
            Sélectionnez un patient existant et définissez sa relation avec vous.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Patient</label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un patient" />
              </SelectTrigger>
              <SelectContent>
                {availablePatients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Relation</label>
            <Select value={relationship} onValueChange={(v) => setRelationship(v as FamilyMember['relationship'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['Conjoint', 'Enfant', 'Parent', 'Frère/Sœur', 'Autre'] as const).map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleAdd} className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─────────── Book Appointment Dialog ─────────── */

function BookAppointmentDialog({ patientId, patientName }: { patientId: string; patientName: string }) {
  const [open, setOpen] = useState(false)
  const [doctor, setDoctor] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const { addAppointment } = useDataStore()
  const { toast } = useToast()

  const doctors = ['Dr. Diallo', 'Dr. Touré', 'Dr. Bah', 'Dr. Keita']

  const handleBook = () => {
    if (!doctor || !date || !time || !reason) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs.', variant: 'destructive' })
      return
    }
    addAppointment({
      id: `RDV-PAT-${Date.now()}`,
      patientName,
      patientId,
      doctor,
      date,
      time,
      duration: 30,
      type: 'Consultation',
      status: 'Planifié',
      reason,
      notes: '',
    })
    toast({ title: 'Rendez-vous réservé', description: `Avec ${doctor} le ${date} à ${time}` })
    setDoctor('')
    setDate('')
    setTime('')
    setReason('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
          <Calendar className="w-4 h-4 mr-1" />
          Prendre RDV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prendre un rendez-vous</DialogTitle>
          <DialogDescription>
            Réservez une consultation pour {patientName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Médecin</label>
            <Select value={doctor} onValueChange={setDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un médecin" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Heure</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motif</label>
            <Input placeholder="Ex: Consultation de suivi" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleBook} className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
            Réserver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─────────── Patient Detail Tabs ─────────── */

function PatientDetail({ patientId }: { patientId: string }) {
  const { patients, appointments } = useDataStore()
  const patient = patients.find((p) => p.id === patientId)

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Patient non trouvé
      </div>
    )
  }

  const patientAppointments = appointments.filter((a) => a.patientId === patientId)
  const upcoming = patientAppointments.filter((a) => a.status === 'Planifié' || a.status === 'Confirmé')
  const past = patientAppointments.filter((a) => a.status === 'Terminé' || a.status === 'Annulé' || a.status === 'Non honoré')

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()

  return (
    <div className="space-y-4">
      {/* Patient Header */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-xl border border-teal-100 dark:border-teal-900/50">
        <Avatar className="size-14">
          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-lg font-bold">
            {patient.firstName[0]}{patient.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {patient.firstName} {patient.lastName}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {patient.id} • {patient.gender === 'M' ? 'Homme' : 'Femme'} • {age} ans
          </p>
          <div className="flex items-center gap-2 mt-1">
            {patient.bloodType && (
              <Badge className="bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-[10px]">
                <Droplets className="w-3 h-3 mr-0.5" />
                {patient.bloodType}
              </Badge>
            )}
            <Badge className={`text-[10px] ${patient.status === 'Actif' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {patient.status}
            </Badge>
          </div>
        </div>
        <BookAppointmentDialog patientId={patient.id} patientName={`${patient.firstName} ${patient.lastName}`} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="text-xs sm:text-sm">
            <User className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Informations</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="text-xs sm:text-sm">
            <Calendar className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">RDV</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm">
            <FileText className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">
            <Activity className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Historique</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 space-y-4">
          {/* Personal Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Téléphone</span>
                  <p className="font-medium text-slate-900 dark:text-white">{patient.phone}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Adresse</span>
                  <p className="font-medium text-slate-900 dark:text-white">{patient.address}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Contact d&apos;urgence</span>
                  <p className="font-medium text-slate-900 dark:text-white">{patient.emergencyContact}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Tél. urgence</span>
                  <p className="font-medium text-slate-900 dark:text-white">{patient.emergencyPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          {patient.allergies.length > 0 && (
            <Card className="border-rose-200 dark:border-rose-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((a, i) => (
                    <Badge
                      key={i}
                      className={`${
                        a.severity === 'Critique'
                          ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : a.severity === 'Majeur'
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {a.name} ({a.severity})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blood Type */}
          {patient.bloodType && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Groupe sanguin</p>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{patient.bloodType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Rendez-vous à venir</h4>
            <BookAppointmentDialog patientId={patient.id} patientName={`${patient.firstName} ${patient.lastName}`} />
          </div>
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun rendez-vous à venir</p>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{apt.doctor}</p>
                        <p className="text-xs text-slate-500">{apt.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{apt.date}</p>
                      <p className="text-xs text-slate-500">{apt.time}</p>
                      <Badge className={`mt-1 text-[9px] ${
                        apt.status === 'Confirmé' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                      }`}>
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {past.length > 0 && (
            <>
              <Separator className="my-4" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Rendez-vous passés</h4>
              {past.map((apt) => (
                <Card key={apt.id} className="opacity-70">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{apt.doctor}</p>
                        <p className="text-xs text-slate-400">{apt.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{apt.date}</p>
                        <Badge className={`text-[9px] ${
                          apt.status === 'Annulé' ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Consultation seule — le téléchargement est réservé au personnel médical</span>
          </div>
          {patient.documents.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun document disponible</p>
              </CardContent>
            </Card>
          ) : (
            patient.documents.map((doc, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{doc.name}</p>
                        <p className="text-xs text-slate-400">{doc.date} • {doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-teal-500" />
                      <span className="text-xs text-teal-600 dark:text-teal-400">Voir</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          {/* Medical History */}
          {patient.medicalHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-500" />
                  Antécédents médicaux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patient.medicalHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{h}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Surgical History */}
          {patient.surgicalHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Antécédents chirurgicaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patient.surgicalHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{h}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Family History */}
          {patient.familyHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  Antécédents familiaux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patient.familyHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{h}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {patient.medicalHistory.length === 0 && patient.surgicalHistory.length === 0 && patient.familyHistory.length === 0 && (
            <Card>
              <CardContent className="pt-6 pb-6 text-center text-slate-400">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun antécédent enregistré</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ─────────── Portal Dashboard ─────────── */

function PortalDashboard() {
  const { portalUser, setPortalUser, setCurrentView } = useStore()
  const { familyAccounts, patients } = useDataStore()
  const [selectedMemberIdx, setSelectedMemberIdx] = useState(0)

  const account = familyAccounts.find((a) => a.id === portalUser.accountId)

  if (!account) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Compte non trouvé</p>
      </div>
    )
  }

  const members = account.members
  const selectedMember = members[selectedMemberIdx] ?? members[0]
  const selectedPatient = patients.find((p) => p.id === selectedMember?.patientId)

  const handleLogout = () => {
    setPortalUser({ accountId: null, phone: '', isLoggedIn: false })
    setCurrentView('landing')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Portail Patient
              </h1>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                {account.primaryName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Family Members Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-500" />
                  Membres de la famille
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ScrollArea className="max-h-[60vh]">
                  {members.map((member, idx) => {
                    const p = patients.find((pt) => pt.id === member.patientId)
                    return (
                      <FamilyMemberCard
                        key={member.patientId}
                        member={member}
                        patient={p}
                        isSelected={selectedMemberIdx === idx}
                        onClick={() => setSelectedMemberIdx(idx)}
                      />
                    )
                  })}
                </ScrollArea>
                <Separator className="my-2" />
                <AddFamilyMemberDialog accountId={account.id} />
              </CardContent>
            </Card>
          </div>

          {/* Selected Member Detail */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMember?.patientId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, type: 'spring' as const, bounce: 0.1 }}
              >
                <PatientDetail patientId={selectedMember?.patientId ?? ''} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────── Main Export ─────────── */

export function PatientPortalPage() {
  const { portalUser } = useStore()

  if (!portalUser.isLoggedIn) {
    return <PortalLogin />
  }

  return <PortalDashboard />
}
