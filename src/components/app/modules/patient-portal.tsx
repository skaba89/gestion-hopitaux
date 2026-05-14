'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  User,
  FileText,
  Settings,
  LogOut,
  Phone,
  Shield,
  Heart,
  Clock,
  Plus,
  X,
  Check,
  AlertCircle,
  QrCode,
  Droplets,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { usePatientAuthStore } from '@/lib/patient-auth-store'
import { patientAPI } from '@/lib/patient-api'
import { useToast } from '@/hooks/use-toast'

/* ─────────── Types ─────────── */

interface Establishment {
  id: string
  name: string
  type: string
  city: string
}

interface Allergy {
  id: string
  allergen: string
  type: string
  severity: string
  reaction: string | null
  diagnosedAt: string | null
}

interface Antecedent {
  id: string
  type: string
  category: string
  description: string
  diagnosedDate: string | null
  isChronic: boolean
  isHereditary: boolean
}

interface MedicalDocument {
  id: string
  title: string
  type: string
  category: string | null
  documentDate: string | null
  createdAt: string
}

interface AppointmentData {
  id: string
  doctorId: string
  appointmentDate: string
  startTime: string
  endTime: string | null
  duration: number | null
  type: string
  status: string
  reason: string | null
  notes: string | null
  doctor?: {
    id: string
    firstName: string
    lastName: string
    specialization: string | null
  }
}

interface PatientProfile {
  id: string
  phone: string
  email: string | null
  preferredLanguage: string
  notificationPrefs: Record<string, boolean> | null
  patient: {
    id: string
    firstName: string
    lastName: string
    qrCode: string
    dateOfBirth: string
    gender: string
    bloodType: string | null
    phone: string | null
    address: string | null
    city: string | null
    region: string | null
    emergencyContactName: string | null
    emergencyContactPhone: string | null
    allergies: Allergy[]
    antecedents: Antecedent[]
    appointments: AppointmentData[]
    medicalDocuments: MedicalDocument[]
  } | null
}

/* ─────────── Animation Variants ─────────── */

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const tabVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
}

/* ─────────── Auth: Login Screen ─────────── */

type AuthStep = 'phone' | 'otp' | 'register'

function PortalLogin() {
  const [step, setStep] = useState<AuthStep>('phone')
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const { toast } = useToast()

  // Registration fields
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE' as string,
    preferredLanguage: 'fr',
    establishmentId: '',
  })
  const [establishments, setEstablishments] = useState<Establishment[]>([])

  const { setAuth } = usePatientAuthStore()

  useEffect(() => {
    patientAPI.getEstablishments().then((res) => {
      const data = res.data || res
      if (Array.isArray(data)) setEstablishments(data)
    }).catch(() => {})
  }, [])

  const formatPhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('224')) return `+${digits}`
    if (digits.startsWith('0')) return `+224${digits.slice(1)}`
    return `+224${digits}`
  }

  const handleRequestOTP = async () => {
    if (!phone.trim()) return
    setLoading(true)
    try {
      const formatted = formatPhone(phone)
      const res = await patientAPI.requestOTP(formatted)
      setDevOtp(res.otpCode || null)
      setStep('otp')
      toast({
        title: 'Code envoye',
        description: res.otpCode
          ? `Code de demonstration : ${res.otpCode}`
          : 'Un code OTP a ete envoye par SMS',
        duration: 10000,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur'
      if (message.includes('non trouve') || message.includes('Aucun compte')) {
        setStep('register')
        toast({
          title: 'Nouveau compte',
          description: 'Aucun compte trouve. Creez votre compte pour continuer.',
        })
      } else {
        toast({ title: 'Erreur', description: message, variant: 'destructive' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) return
    setLoading(true)
    try {
      const formatted = formatPhone(phone)
      const res = await patientAPI.verifyOTP(formatted, otpCode)
      if (res.token && res.account) {
        setAuth(res.token, res.account)
        toast({ title: 'Bienvenue !', description: 'Connexion reussie' })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Code invalide'
      toast({ title: 'Erreur', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!regForm.firstName || !regForm.lastName || !regForm.dateOfBirth || !regForm.establishmentId) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const formatted = formatPhone(phone)
      const res = await patientAPI.register({
        phone: formatted,
        firstName: regForm.firstName,
        lastName: regForm.lastName,
        dateOfBirth: regForm.dateOfBirth,
        gender: regForm.gender,
        preferredLanguage: regForm.preferredLanguage,
        establishmentId: regForm.establishmentId,
      })
      setDevOtp(res.otpCode || null)
      setStep('otp')
      toast({
        title: 'Compte cree',
        description: res.otpCode
          ? `Votre code OTP : ${res.otpCode}`
          : 'Verifiez votre telephone pour le code OTP',
        duration: 10000,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast({ title: 'Erreur', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const renderPhoneStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Numero de telephone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="phone"
            placeholder="+224 6XX XX XX XX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <p className="text-xs text-slate-400">Format : +224 suivi de 8 chiffres</p>
      </div>
      <Button
        onClick={handleRequestOTP}
        className="w-full h-11 text-white"
        style={{ backgroundColor: '#228f74' }}
        disabled={!phone.trim() || loading}
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Envoyer le code
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )

  const renderOTPStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">Code de verification</Label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="otp"
            placeholder="000000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="pl-10 h-11 tracking-widest text-center font-mono text-lg"
            maxLength={6}
          />
        </div>
        {devOtp && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Code de demonstration : {devOtp}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => { setStep('phone'); setOtpCode(''); setDevOtp(null) }}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>
        <Button
          onClick={handleVerifyOTP}
          className="flex-1 text-white"
          style={{ backgroundColor: '#228f74' }}
          disabled={otpCode.length !== 6 || loading}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Verifier
        </Button>
      </div>
    </div>
  )

  const renderRegisterStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prenom</Label>
          <Input
            id="firstName"
            placeholder="Prenom"
            value={regForm.firstName}
            onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            placeholder="Nom"
            value={regForm.lastName}
            onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date de naissance</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={regForm.dateOfBirth}
          onChange={(e) => setRegForm({ ...regForm, dateOfBirth: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Sexe</Label>
        <Select value={regForm.gender} onValueChange={(v) => setRegForm({ ...regForm, gender: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MALE">Homme</SelectItem>
            <SelectItem value="FEMALE">Femme</SelectItem>
            <SelectItem value="OTHER">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Langue preferee</Label>
        <Select value={regForm.preferredLanguage} onValueChange={(v) => setRegForm({ ...regForm, preferredLanguage: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Francais</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="msk">Maninka</SelectItem>
            <SelectItem value="sus">Susu</SelectItem>
            <SelectItem value="ff">Poular</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Etablissement</Label>
        <Select value={regForm.establishmentId} onValueChange={(v) => setRegForm({ ...regForm, establishmentId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selectionner un etablissement" />
          </SelectTrigger>
          <SelectContent>
            {establishments.map((est) => (
              <SelectItem key={est.id} value={est.id}>
                {est.name} - {est.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep('phone')}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>
        <Button
          onClick={handleRegister}
          className="flex-1 text-white"
          style={{ backgroundColor: '#228f74' }}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Creer le compte
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-emerald-200 dark:border-emerald-800 shadow-2xl shadow-emerald-500/10">
          <CardHeader className="text-center pb-2">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #228f74, #1a7a60)' }}
            >
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              HealthFlow Patient
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {step === 'phone' && 'Accedez a votre espace sante personnel'}
              {step === 'otp' && 'Entrez le code de verification'}
              {step === 'register' && 'Creez votre compte patient'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: step === 'phone' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: step === 'phone' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 'phone' && renderPhoneStep()}
                {step === 'otp' && renderOTPStep()}
                {step === 'register' && renderRegisterStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

/* ─────────── Dashboard Stats ─────────── */

function DashboardStats({ profile }: { profile: PatientProfile }) {
  const patient = profile.patient
  const appointments = patient?.appointments || []
  const upcoming = appointments.filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
  )
  const documents = patient?.medicalDocuments || []
  const antecedents = patient?.antecedents || []
  const chronicCount = antecedents.filter((a) => a.isChronic).length

  const stats = [
    {
      label: 'Rendez-vous a venir',
      value: upcoming.length,
      icon: Calendar,
      color: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
      accent: '#228f74',
    },
    {
      label: 'Resultats en attente',
      value: documents.filter((d) => d.type === 'LAB_RESULT').length,
      icon: FileText,
      color: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
      accent: '#d97706',
    },
    {
      label: 'Plans de soins actifs',
      value: chronicCount,
      icon: Heart,
      color: 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300',
      accent: '#e11d48',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

/* ─────────── QR Code Display ─────────── */

function QRCodeDisplay({ qrCode, patientName }: { qrCode: string; patientName: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#228f74' }}
          >
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{patientName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Code QR Patient</p>
            <Badge
              className="mt-1 text-xs font-mono"
              style={{ backgroundColor: '#e8f5f0', color: '#228f74' }}
            >
              {qrCode}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─────────── Book Appointment Dialog ─────────── */

function BookAppointmentDialog({ patientId, establishmentId }: { patientId: string; establishmentId?: string | null }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [reason, setReason] = useState('')
  const [appointmentType, setAppointmentType] = useState('CONSULTATION')
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean; reason?: string }[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const { toast } = useToast()

  // Simple doctor list for demo
  const demoDoctors = [
    { id: 'doc-1', name: 'Dr. Diallo', specialization: 'Medecine generale' },
    { id: 'doc-2', name: 'Dr. Toure', specialization: 'Pediatric' },
    { id: 'doc-3', name: 'Dr. Bah', specialization: 'Gynecologie' },
    { id: 'doc-4', name: 'Dr. Keita', specialization: 'Cardiologie' },
  ]

  const fetchSlots = useCallback(async (docId: string, selectedDate: string) => {
    if (!docId || !selectedDate) return
    setSlotsLoading(true)
    try {
      const res = await patientAPI.getAvailableSlots(docId, selectedDate)
      setAvailableSlots(res.slots || [])
    } catch {
      setAvailableSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (doctorId && date) {
      fetchSlots(doctorId, date)
    } else {
      setAvailableSlots([])
    }
  }, [doctorId, date, fetchSlots])

  const handleBook = async () => {
    if (!doctorId || !date || !startTime || !reason) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const [hours, minutes] = startTime.split(':').map(Number)
      const endTime = `${String(hours + Math.floor((minutes + 30) / 60)).padStart(2, '0')}:${String((minutes + 30) % 60).padStart(2, '0')}`

      await patientAPI.createAppointment({
        patientId,
        doctorId,
        establishmentId: establishmentId || '',
        appointmentDate: date,
        startTime,
        endTime,
        duration: 30,
        type: appointmentType,
        status: 'SCHEDULED',
        reason,
      })
      toast({ title: 'Rendez-vous reserve', description: `Le ${date} a ${startTime}` })
      setOpen(false)
      setDoctorId('')
      setDate('')
      setStartTime('')
      setReason('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la reservation'
      toast({ title: 'Erreur', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const availableOnly = availableSlots.filter((s) => s.available)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-white" style={{ backgroundColor: '#228f74' }}>
          <Plus className="w-4 h-4 mr-1" />
          Nouveau rendez-vous
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prendre un rendez-vous</DialogTitle>
          <DialogDescription>Reservez une consultation avec un medecin</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Medecin</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selectionner un medecin" />
              </SelectTrigger>
              <SelectContent>
                {demoDoctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} - {d.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          {doctorId && date && (
            <div className="space-y-2">
              <Label>Creneau horaire</Label>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : availableOnly.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {availableOnly.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setStartTime(slot.time)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        startTime === slot.time
                          ? 'border-emerald-500 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                      }`}
                      style={startTime === slot.time ? { backgroundColor: '#228f74' } : {}}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 py-2">Aucun creneau disponible pour cette date</p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="FOLLOW_UP">Suivi</SelectItem>
                <SelectItem value="EMERGENCY">Urgence</SelectItem>
                <SelectItem value="TELECONSULTATION">Teleconsultation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Motif</Label>
            <Input placeholder="Ex: Consultation de suivi" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleBook} className="text-white" style={{ backgroundColor: '#228f74' }} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Reserver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─────────── Cancel Appointment Dialog ─────────── */

function CancelAppointmentDialog({ appointmentId, onCanceled }: { appointmentId: string; onCanceled: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleCancel = async () => {
    setLoading(true)
    try {
      await patientAPI.cancelAppointment(appointmentId)
      toast({ title: 'Annule', description: 'Le rendez-vous a ete annule' })
      setOpen(false)
      onCanceled()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast({ title: 'Erreur', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
          <X className="w-4 h-4 mr-1" />
          Annuler
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Confirmer l&apos;annulation
          </DialogTitle>
          <DialogDescription>
            Etes-vous sur de vouloir annuler ce rendez-vous ? Cette action est irreversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Non, garder</Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Oui, annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─────────── Appointments Tab ─────────── */

function AppointmentsTab({ profile, onRefresh }: { profile: PatientProfile; onRefresh: () => void }) {
  const patient = profile.patient
  const appointments = patient?.appointments || []
  const upcoming = appointments.filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
  )
  const past = appointments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW'
  )

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      SCHEDULED: { label: 'Planifie', className: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300' },
      CONFIRMED: { label: 'Confirme', className: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' },
      COMPLETED: { label: 'Termine', className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
      CANCELLED: { label: 'Annule', className: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300' },
      IN_PROGRESS: { label: 'En cours', className: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300' },
      NO_SHOW: { label: 'Non honore', className: 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300' },
    }
    const info = map[status] || { label: status, className: 'bg-slate-100 dark:bg-slate-800 text-slate-600' }
    return <Badge className={`text-[10px] ${info.className}`}>{info.label}</Badge>
  }

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      CONSULTATION: 'Consultation',
      FOLLOW_UP: 'Suivi',
      EMERGENCY: 'Urgence',
      TELECONSULTATION: 'Teleconsultation',
    }
    return map[type] || type
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <motion.div
      initial={tabVariants.initial}
      animate={tabVariants.animate}
      exit={tabVariants.exit}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Rendez-vous a venir
        </h3>
        <BookAppointmentDialog patientId={patient?.id || ''} establishmentId={patient?.id} />
      </div>

      {upcoming.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Aucun rendez-vous a venir</p>
            <p className="text-xs mt-1">Prenez un rendez-vous pour commencer</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {upcoming.map((apt) => (
            <Card key={apt.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#e8f5f0' }}
                    >
                      <Calendar className="w-5 h-5" style={{ color: '#228f74' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {apt.doctor
                          ? `Dr. ${apt.doctor.lastName}`
                          : 'Medecin'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{apt.reason || getTypeLabel(apt.type)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{getTypeLabel(apt.type)}</Badge>
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(apt.appointmentDate)}
                    </p>
                    <p className="text-xs text-slate-500">{apt.startTime}</p>
                    {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                      <CancelAppointmentDialog appointmentId={apt.id} onCanceled={onRefresh} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <Separator />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Rendez-vous passes
          </h3>
          <div className="space-y-2">
            {past.map((apt) => (
              <Card key={apt.id} className="opacity-70">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {apt.doctor
                          ? `Dr. ${apt.doctor.lastName}`
                          : 'Medecin'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{apt.reason || getTypeLabel(apt.type)}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs text-slate-500">{formatDate(apt.appointmentDate)}</p>
                      {getStatusBadge(apt.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

/* ─────────── Medical Records Tab ─────────── */

function MedicalRecordsTab({ profile }: { profile: PatientProfile }) {
  const patient = profile.patient
  const allergies = patient?.allergies || []
  const antecedents = patient?.antecedents || []
  const documents = patient?.medicalDocuments || []

  const getSeverityBadge = (severity: string) => {
    const map: Record<string, string> = {
      MILD: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      MODERATE: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
      SEVERE: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300',
      CRITICAL: 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200',
    }
    const labels: Record<string, string> = {
      MILD: 'Legere',
      MODERATE: 'Moderee',
      SEVERE: 'Severe',
      CRITICAL: 'Critique',
    }
    return (
      <Badge className={`text-[10px] ${map[severity] || map.MILD}`}>
        {labels[severity] || severity}
      </Badge>
    )
  }

  return (
    <motion.div
      initial={tabVariants.initial}
      animate={tabVariants.animate}
      exit={tabVariants.exit}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Blood Type & Emergency Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {patient?.bloodType && (
          <Card className="border-rose-200 dark:border-rose-800/50">
            <CardContent className="p-4">
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#e8f5f0' }}
              >
                <Phone className="w-6 h-6" style={{ color: '#228f74' }} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Contact d&apos;urgence</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {patient?.emergencyContactName || 'Non renseigne'}
                </p>
                <p className="text-xs text-slate-500">{patient?.emergencyContactPhone || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allergies */}
      <Card className="border-rose-200 dark:border-rose-800/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4" />
            Allergies ({allergies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allergies.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune allergie enregistree</p>
          ) : (
            <div className="space-y-2">
              {allergies.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{a.allergen}</p>
                    {a.reaction && <p className="text-xs text-slate-500">{a.reaction}</p>}
                  </div>
                  {getSeverityBadge(a.severity)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Antecedents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: '#228f74' }} />
            Antecedents medicaux ({antecedents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {antecedents.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun antecedent enregistre</p>
          ) : (
            <div className="space-y-2">
              {antecedents.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{a.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                      {a.isChronic && (
                        <Badge className="text-[10px] bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                          Chronique
                        </Badge>
                      )}
                      {a.isHereditary && (
                        <Badge className="text-[10px] bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                          Hereditaire
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Documents medicaux ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun document disponible</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{doc.title}</p>
                      <p className="text-xs text-slate-400">{doc.type} {doc.documentDate ? `- ${new Date(doc.documentDate).toLocaleDateString('fr-FR')}` : ''}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{doc.category || doc.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─────────── Profile Tab ─────────── */

function ProfileTab({ profile, onRefresh }: { profile: PatientProfile; onRefresh: () => void }) {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: profile.patient?.firstName || '',
    lastName: profile.patient?.lastName || '',
    address: profile.patient?.address || '',
    city: profile.patient?.city || '',
    region: profile.patient?.region || '',
    emergencyContactName: profile.patient?.emergencyContactName || '',
    emergencyContactPhone: profile.patient?.emergencyContactPhone || '',
    preferredLanguage: profile.preferredLanguage || 'fr',
  })
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    profile.notificationPrefs || {
      sms: true,
      whatsapp: false,
      email: false,
      appointmentReminder: true,
      labResults: true,
      vaccination: true,
    }
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      await patientAPI.updateProfile({
        ...form,
        notificationPrefs: prefs,
      })
      toast({ title: 'Profil mis a jour', description: 'Vos informations ont ete enregistrees' })
      setEditing(false)
      onRefresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur'
      toast({ title: 'Erreur', description: message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const patient = profile.patient

  return (
    <motion.div
      initial={tabVariants.initial}
      animate={tabVariants.animate}
      exit={tabVariants.exit}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Personal Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: '#228f74' }} />
              Informations personnelles
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(!editing)}
              style={editing ? { color: '#228f74' } : {}}
            >
              {editing ? 'Annuler' : 'Modifier'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Prenom</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nom</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Adresse</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Adresse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Ville</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ville" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Region</Label>
                  <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Region" />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Contact d&apos;urgence</Label>
                  <Input value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} placeholder="Nom" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Telephone</Label>
                  <Input value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} placeholder="+224..." />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full text-white" style={{ backgroundColor: '#228f74' }} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Enregistrer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Prenom</span>
                <p className="font-medium text-slate-900 dark:text-white">{patient?.firstName || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Nom</span>
                <p className="font-medium text-slate-900 dark:text-white">{patient?.lastName || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Telephone</span>
                <p className="font-medium text-slate-900 dark:text-white">{profile.phone || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Email</span>
                <p className="font-medium text-slate-900 dark:text-white">{profile.email || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Adresse</span>
                <p className="font-medium text-slate-900 dark:text-white">{patient?.address || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Ville</span>
                <p className="font-medium text-slate-900 dark:text-white">{patient?.city || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Contact d&apos;urgence</span>
                <p className="font-medium text-slate-900 dark:text-white">{patient?.emergencyContactName || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Tel. urgence</span>
                <p className="font-medium text-slate-900 dark:text-white">{patient?.emergencyContactPhone || '-'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Langue preferee</Label>
            <Select value={form.preferredLanguage} onValueChange={(v) => setForm({ ...form, preferredLanguage: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Francais</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="msk">Maninka</SelectItem>
                <SelectItem value="sus">Susu</SelectItem>
                <SelectItem value="ff">Poular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'sms', label: 'Notifications SMS' },
            { key: 'whatsapp', label: 'Notifications WhatsApp' },
            { key: 'email', label: 'Notifications par email' },
            { key: 'appointmentReminder', label: 'Rappels de rendez-vous' },
            { key: 'labResults', label: 'Resultats de laboratoire' },
            { key: 'vaccination', label: 'Rappels de vaccination' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
              <Switch
                checked={prefs[item.key] ?? false}
                onCheckedChange={(checked) => setPrefs({ ...prefs, [item.key]: checked })}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─────────── Portal Dashboard ─────────── */

function PortalDashboard() {
  const { user, logout } = usePatientAuthStore()
  const { toast } = useToast()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  const fetchProfile = useCallback(async () => {
    try {
      const data = await patientAPI.getProfile()
      setProfile(data)
    } catch {
      toast({ title: 'Session expiree', description: 'Veuillez vous reconnecter', variant: 'destructive' })
      logout()
    } finally {
      setProfileLoading(false)
    }
  }, [toast, logout])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleLogout = () => {
    logout()
    toast({ title: 'Deconnecte', description: 'A bientot !' })
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#228f74' }} />
          <p className="text-sm text-slate-500">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-400">Erreur de chargement du profil</p>
      </div>
    )
  }

  const patient = profile.patient
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'
  const initials = patient ? `${patient.firstName[0]}${patient.lastName[0]}` : 'P'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #228f74, #1a7a60)' }}
            >
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">HealthFlow Patient</h1>
              <p className="text-xs font-medium" style={{ color: '#228f74' }}>
                {patientName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-1" />
            Deconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
              <Heart className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Accueil</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs sm:text-sm">
              <Calendar className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">RDV</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="text-xs sm:text-sm">
              <FileText className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Dossier</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              <User className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="dashboard" className="mt-0">
              <motion.div
                key="dashboard"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Welcome Section */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Avatar className="size-12">
                    <AvatarFallback
                      className="text-white text-base font-bold"
                      style={{ background: 'linear-gradient(135deg, #228f74, #1a7a60)' }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Bonjour, {patient?.firstName || 'Patient'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Bienvenue dans votre espace sante
                    </p>
                  </div>
                  {patient?.bloodType && (
                    <Badge className="ml-auto bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
                      <Droplets className="w-3 h-3 mr-1" />
                      {patient.bloodType}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <DashboardStats profile={profile} />

                {/* QR Code */}
                {patient?.qrCode && (
                  <QRCodeDisplay qrCode={patient.qrCode} patientName={patientName} />
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex-col gap-1"
                        onClick={() => setActiveTab('appointments')}
                      >
                        <Calendar className="w-5 h-5" style={{ color: '#228f74' }} />
                        <span className="text-xs">Prendre RDV</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex-col gap-1"
                        onClick={() => setActiveTab('records')}
                      >
                        <FileText className="w-5 h-5 text-amber-500" />
                        <span className="text-xs">Mon dossier</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex-col gap-1"
                        onClick={() => setActiveTab('profile')}
                      >
                        <Settings className="w-5 h-5 text-slate-500" />
                        <span className="text-xs">Parametres</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex-col gap-1"
                        onClick={() => setActiveTab('profile')}
                      >
                        <Shield className="w-5 h-5 text-blue-500" />
                        <span className="text-xs">Securite</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="appointments" className="mt-0">
              <motion.div
                key="appointments"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <AppointmentsTab profile={profile} onRefresh={fetchProfile} />
              </motion.div>
            </TabsContent>

            <TabsContent value="records" className="mt-0">
              <motion.div
                key="records"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <MedicalRecordsTab profile={profile} />
              </motion.div>
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <motion.div
                key="profile"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <ProfileTab profile={profile} onRefresh={fetchProfile} />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}

/* ─────────── Main Export ─────────── */

export function PatientPortalPage() {
  const { isAuthenticated } = usePatientAuthStore()

  if (!isAuthenticated) {
    return <PortalLogin />
  }

  return <PortalDashboard />
}
