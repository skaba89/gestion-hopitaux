'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  QrCode,
  Phone,
  Calendar,
  MoreHorizontal,
  Eye,
  Pencil,
  Archive,
  ChevronUp,
  ChevronDown,
  X,
  MapPin,
  User,
  Heart,
  FileText,
  AlertTriangle,
  Download,
  Clock,
  Activity,
  Droplets,
  ShieldCheck,
  Baby,
  Stethoscope,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

/* ─────────── Animation Variants ─────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, type: 'spring', stiffness: 300, damping: 24 },
  }),
}

/* ─────────── Types ─────────── */

type PatientStatus = 'Actif' | 'Inactif' | 'Archivé'
type SortField = 'name' | 'age' | 'phone' | 'lastVisit' | 'status'
type SortDir = 'asc' | 'desc'

interface Allergy {
  name: string
  severity: 'Mineur' | 'Majeur' | 'Critique'
}

interface MedicalDocument {
  name: string
  date: string
  type: string
}

interface Patient {
  id: string
  qrCode: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'M' | 'F'
  phone: string
  address: string
  nationalId: string
  bloodType: string
  emergencyContact: string
  emergencyPhone: string
  lastVisit: string
  status: PatientStatus
  reason: string
  allergies: Allergy[]
  medicalHistory: string[]
  surgicalHistory: string[]
  familyHistory: string[]
  documents: MedicalDocument[]
  registrationDate: string
}

/* ─────────── Demo Data ─────────── */

const demoPatients: Patient[] = [
  {
    id: 'P-2024-001',
    qrCode: 'QR-AD-281998',
    firstName: 'Aminata',
    lastName: 'Diallo',
    dateOfBirth: '1998-03-15',
    gender: 'F',
    phone: '+224 622 11 22 33',
    address: 'Conakry, Kaloum',
    nationalId: 'GN-1998-0315-FD',
    bloodType: 'O+',
    emergencyContact: 'Mamadou Diallo',
    emergencyPhone: '+224 622 99 88 77',
    lastVisit: '2026-03-01',
    status: 'Actif',
    reason: 'Paludisme',
    allergies: [
      { name: 'Pénicilline', severity: 'Critique' },
      { name: 'Sulfamides', severity: 'Majeur' },
    ],
    medicalHistory: ['Paludisme sévère (2024)', 'Anémie ferriprive'],
    surgicalHistory: [],
    familyHistory: ['Hypertension (mère)'],
    documents: [
      { name: 'Résultats laboratoire', date: '2026-03-01', type: 'PDF' },
      { name: 'Ordonnance', date: '2026-03-01', type: 'PDF' },
    ],
    registrationDate: '2024-01-15',
  },
  {
    id: 'P-2024-002',
    qrCode: 'QR-MC-121980',
    firstName: 'Mamadou',
    lastName: 'Condé',
    dateOfBirth: '1980-07-22',
    gender: 'M',
    phone: '+224 623 44 55 66',
    address: 'Conakry, Dixinn',
    nationalId: 'GN-1980-0722-MC',
    bloodType: 'A+',
    emergencyContact: 'Fatoumata Condé',
    emergencyPhone: '+224 623 55 66 77',
    lastVisit: '2026-03-03',
    status: 'Actif',
    reason: 'Hypertension',
    allergies: [{ name: 'Aspirine', severity: 'Mineur' }],
    medicalHistory: ['Hypertension artérielle', 'Hypercholestérolémie'],
    surgicalHistory: ['Appendicectomie (2015)'],
    familyHistory: ['Diabète type 2 (père)', 'Hypertension (mère)'],
    documents: [
      { name: 'ECG rapport', date: '2026-03-03', type: 'PDF' },
      { name: 'Bilan lipidique', date: '2026-02-15', type: 'PDF' },
      { name: 'Ordonnance Amlodipine', date: '2026-03-03', type: 'PDF' },
    ],
    registrationDate: '2024-02-20',
  },
  {
    id: 'P-2024-003',
    qrCode: 'QR-FC-091993',
    firstName: 'Fatoumata',
    lastName: 'Camara',
    dateOfBirth: '1993-09-10',
    gender: 'F',
    phone: '+224 624 77 88 99',
    address: 'Conakry, Matam',
    nationalId: 'GN-1993-0910-FC',
    bloodType: 'B+',
    emergencyContact: 'Ibrahima Camara',
    emergencyPhone: '+224 624 88 99 00',
    lastVisit: '2026-03-04',
    status: 'Actif',
    reason: 'Grossesse',
    allergies: [],
    medicalHistory: ['Grossesse suivie (3e trimestre)', 'Césarienne (2023)'],
    surgicalHistory: ['Césarienne (2023)'],
    familyHistory: [],
    documents: [
      { name: 'Échographie obstétricale', date: '2026-03-04', type: 'PDF' },
      { name: 'Carnet de maternité', date: '2026-01-10', type: 'PDF' },
    ],
    registrationDate: '2024-03-05',
  },
  {
    id: 'P-2024-004',
    qrCode: 'QR-IT-051958',
    firstName: 'Ibrahim',
    lastName: 'Touré',
    dateOfBirth: '1958-05-20',
    gender: 'M',
    phone: '+224 625 00 11 22',
    address: 'Kindia, Centre',
    nationalId: 'GN-1958-0520-MT',
    bloodType: 'AB+',
    emergencyContact: 'Aminata Touré',
    emergencyPhone: '+224 625 11 22 33',
    lastVisit: '2026-02-28',
    status: 'Actif',
    reason: 'Diabète',
    allergies: [
      { name: 'Iode', severity: 'Majeur' },
      { name: 'Metformine', severity: 'Mineur' },
    ],
    medicalHistory: ['Diabète type 2', 'Rétinopathie diabétique', 'Neuropathie périphérique'],
    surgicalHistory: ['Cataracte œil gauche (2022)'],
    familyHistory: ['Diabète (père et frère)'],
    documents: [
      { name: 'Hémoglobine glyquée', date: '2026-02-28', type: 'PDF' },
      { name: 'Fond d\'œil', date: '2026-02-10', type: 'PDF' },
    ],
    registrationDate: '2024-04-10',
  },
  {
    id: 'P-2024-005',
    qrCode: 'QR-MB-022021',
    firstName: 'Mariama',
    lastName: 'Bah',
    dateOfBirth: '2021-02-14',
    gender: 'F',
    phone: '+224 626 33 44 55',
    address: 'Conakry, Ratoma',
    nationalId: 'GN-2021-0214-FB',
    bloodType: 'O-',
    emergencyContact: 'Kadiatou Bah',
    emergencyPhone: '+224 626 44 55 66',
    lastVisit: '2026-03-02',
    status: 'Actif',
    reason: 'Vaccination',
    allergies: [],
    medicalHistory: ['Prématurée (32 sem.)'],
    surgicalHistory: [],
    familyHistory: [],
    documents: [
      { name: 'Carnet de vaccination', date: '2026-03-02', type: 'PDF' },
      { name: 'Certificat de naissance', date: '2021-02-14', type: 'PDF' },
    ],
    registrationDate: '2024-05-01',
  },
  {
    id: 'P-2024-006',
    qrCode: 'QR-AS-081970',
    firstName: 'Abdoulaye',
    lastName: 'Souaré',
    dateOfBirth: '1970-08-30',
    gender: 'M',
    phone: '+224 627 66 77 88',
    address: 'N\'Zérékoré, Centre',
    nationalId: 'GN-1970-0830-MS',
    bloodType: 'A-',
    emergencyContact: 'Mariama Souaré',
    emergencyPhone: '+224 627 77 88 99',
    lastVisit: '2026-03-05',
    status: 'Actif',
    reason: 'Chirurgie',
    allergies: [{ name: 'Latex', severity: 'Critique' }],
    medicalHistory: ['Hernie inguinale', 'Hypertrophie bénigne de la prostate'],
    surgicalHistory: ['Herniorraphie (2019)', 'Prostatectomie (2026)'],
    familyHistory: ['Cancer de la prostate (père)'],
    documents: [
      { name: 'Bilan pré-opératoire', date: '2026-03-05', type: 'PDF' },
      { name: 'Consentement chirurgical', date: '2026-03-04', type: 'PDF' },
    ],
    registrationDate: '2024-06-12',
  },
  {
    id: 'P-2024-007',
    qrCode: 'QR-KS-042007',
    firstName: 'Kadiatou',
    lastName: 'Sylla',
    dateOfBirth: '2007-04-18',
    gender: 'F',
    phone: '+224 628 99 00 11',
    address: 'Conakry, Matoto',
    nationalId: 'GN-2007-0418-FS',
    bloodType: 'B-',
    emergencyContact: 'Moussa Sylla',
    emergencyPhone: '+224 628 00 11 22',
    lastVisit: '2026-02-20',
    status: 'Actif',
    reason: 'Consultation',
    allergies: [{ name: 'Arachides', severity: 'Majeur' }],
    medicalHistory: ['Asthme allergique'],
    surgicalHistory: [],
    familyHistory: ['Asthme (mère)'],
    documents: [
      { name: 'Spirométrie', date: '2026-02-20', type: 'PDF' },
    ],
    registrationDate: '2024-07-18',
  },
  {
    id: 'P-2024-008',
    qrCode: 'QR-MK-111985',
    firstName: 'Moussa',
    lastName: 'Keita',
    dateOfBirth: '1985-11-05',
    gender: 'M',
    phone: '+224 629 22 33 44',
    address: 'Kankan, Centre',
    nationalId: 'GN-1985-1105-MK',
    bloodType: 'O+',
    emergencyContact: 'Aïssatou Keita',
    emergencyPhone: '+224 629 33 44 55',
    lastVisit: '2026-03-03',
    status: 'Actif',
    reason: 'IRA',
    allergies: [],
    medicalHistory: ['Infection respiratoire aiguë récurrente', 'Tabagisme actif'],
    surgicalHistory: [],
    familyHistory: [],
    documents: [
      { name: 'Radiographie thoracique', date: '2026-03-03', type: 'PDF' },
      { name: 'CRP résultat', date: '2026-03-03', type: 'PDF' },
    ],
    registrationDate: '2024-08-22',
  },
  {
    id: 'P-2024-009',
    qrCode: 'QR-AD-061953',
    firstName: 'Aïssatou',
    lastName: 'Doupour',
    dateOfBirth: '1953-06-12',
    gender: 'F',
    phone: '+224 620 55 66 77',
    address: 'Labé, Centre',
    nationalId: 'GN-1953-0612-FD',
    bloodType: 'AB-',
    emergencyContact: 'Lamine Doupour',
    emergencyPhone: '+224 620 66 77 88',
    lastVisit: '2026-01-15',
    status: 'Inactif',
    reason: 'Arthrite',
    allergies: [
      { name: 'AINS', severity: 'Majeur' },
      { name: 'Codéine', severity: 'Mineur' },
    ],
    medicalHistory: ['Arthrose genoux', 'Hypertension', 'Ostéoporose'],
    surgicalHistory: ['Prothèse genou droit (2020)'],
    familyHistory: ['Arthrose (mère)'],
    documents: [
      { name: 'Radiographie genoux', date: '2026-01-15', type: 'PDF' },
      { name: 'Densitométrie osseuse', date: '2025-11-20', type: 'PDF' },
    ],
    registrationDate: '2024-09-05',
  },
  {
    id: 'P-2024-010',
    qrCode: 'QR-LK-032023',
    firstName: 'Lamine',
    lastName: 'Kaba',
    dateOfBirth: '2023-03-28',
    gender: 'M',
    phone: '+224 621 88 99 00',
    address: 'Conakry, Kaloum',
    nationalId: 'GN-2023-0328-MK',
    bloodType: 'A+',
    emergencyContact: 'Fatoumata Kaba',
    emergencyPhone: '+224 621 99 00 11',
    lastVisit: '2026-03-04',
    status: 'Actif',
    reason: 'Paludisme',
    allergies: [],
    medicalHistory: ['Paludisme simple'],
    surgicalHistory: [],
    familyHistory: [],
    documents: [
      { name: 'Test de diagnostic rapide', date: '2026-03-04', type: 'PDF' },
      { name: 'Carnet de vaccination', date: '2026-01-15', type: 'PDF' },
    ],
    registrationDate: '2024-10-15',
  },
]

/* ─────────── Helper: Calculate Age ─────────── */

function calculateAge(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

/* ─────────── Helper: Format Date ─────────── */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/* ─────────── Status Badge ─────────── */

function StatusBadge({ status }: { status: PatientStatus }) {
  const variants: Record<PatientStatus, string> = {
    Actif: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Inactif: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Archivé: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700',
  }
  const dots: Record<PatientStatus, string> = {
    Actif: 'bg-emerald-500',
    Inactif: 'bg-amber-500',
    Archivé: 'bg-slate-400',
  }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variants[status]}`}>
      <span className={`mr-1.5 size-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  )
}

/* ─────────── Severity Badge ─────────── */

function SeverityBadge({ severity }: { severity: 'Mineur' | 'Majeur' | 'Critique' }) {
  const variants: Record<string, string> = {
    Mineur: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    Majeur: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Critique: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  }
  const icons: Record<string, React.ReactNode> = {
    Mineur: null,
    Majeur: <AlertTriangle className="size-3 mr-1" />,
    Critique: <AlertTriangle className="size-3 mr-1" />,
  }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variants[severity]}`}>
      {icons[severity]}
      {severity}
    </span>
  )
}

/* ─────────── SortIcon Component (outside render) ─────────── */

function SortIcon({ field, currentField, direction }: { field: SortField; currentField: SortField; direction: SortDir }) {
  if (currentField !== field) return <ChevronUp className="size-3 opacity-30" />
  return direction === 'asc' ? (
    <ChevronUp className="size-3 text-teal-600 dark:text-teal-400" />
  ) : (
    <ChevronDown className="size-3 text-teal-600 dark:text-teal-400" />
  )
}

/* ─────────── Main Component ─────────── */

export function PatientsPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [genderFilter, setGenderFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null)
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)

  // New patient form state
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'M' as 'M' | 'F',
    phone: '',
    address: '',
    nationalId: '',
    bloodType: '',
    emergencyContact: '',
    emergencyPhone: '',
    allergies: '',
    antecedents: '',
  })

  // Filtered & sorted patients
  const filteredPatients = useMemo(() => {
    let result = [...demoPatients]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.qrCode.toLowerCase().includes(q) ||
          p.nationalId.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }

    // Gender filter
    if (genderFilter !== 'all') {
      result = result.filter((p) => p.gender === genderFilter)
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter((p) => new Date(p.registrationDate) >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((p) => new Date(p.registrationDate) <= dateTo)
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'name':
          cmp = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          break
        case 'age':
          cmp = calculateAge(a.dateOfBirth) - calculateAge(b.dateOfBirth)
          break
        case 'phone':
          cmp = a.phone.localeCompare(b.phone)
          break
        case 'lastVisit':
          cmp = new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime()
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [searchQuery, statusFilter, genderFilter, dateFrom, dateTo, sortField, sortDir])

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPatients.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPatients.map((p) => p.id)))
    }
  }

  // Sort helper
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setGenderFilter('all')
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || genderFilter !== 'all' || dateFrom || dateTo

  // Active patient count
  const activePatientCount = demoPatients.filter((p) => p.status === 'Actif').length

  // Handle new patient submit
  const handleNewPatient = () => {
    setShowNewPatientDialog(false)
    setNewPatient({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'M',
      phone: '',
      address: '',
      nationalId: '',
      bloodType: '',
      emergencyContact: '',
      emergencyPhone: '',
      allergies: '',
      antecedents: '',
    })
  }

  return (
    <motion.div
      className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ───── Page Header ───── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
            <User className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Gestion des Patients
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Gérez les dossiers patients de l&apos;établissement
            </p>
          </div>
          <Badge className="ml-2 bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800 text-xs px-2.5 py-1">
            {activePatientCount} actifs
          </Badge>
        </div>
        <Button
          onClick={() => setShowNewPatientDialog(true)}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20 gap-2"
        >
          <Plus className="size-4" />
          Nouveau Patient
        </Button>
      </motion.div>

      {/* ───── Search & Filter Bar ───── */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, téléphone, QR code, n° d'identité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-white dark:bg-slate-900"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                  <SelectItem value="Archivé">Archivé</SelectItem>
                </SelectContent>
              </Select>

              {/* Gender Filter */}
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Picker */}
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 gap-2 text-slate-600 dark:text-slate-400 font-normal">
                    <Calendar className="size-4" />
                    {dateFrom || dateTo ? (
                      <span className="text-xs">
                        {dateFrom ? formatDate(dateFrom.toISOString()) : '...'} — {dateTo ? formatDate(dateTo.toISOString()) : '...'}
                      </span>
                    ) : (
                      <span className="text-xs">Date inscription</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">Date début</Label>
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                      />
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">Date fin</Label>
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={(d) => {
                          setDateTo(d)
                          if (d) setDatePopoverOpen(false)
                        }}
                      />
                    </div>
                    {(dateFrom || dateTo) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          setDateFrom(undefined)
                          setDateTo(undefined)
                        }}
                      >
                        Effacer les dates
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1 text-slate-500 dark:text-slate-400"
                  onClick={clearFilters}
                >
                  <X className="size-3.5" />
                  Effacer
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} trouvé{filteredPatients.length !== 1 ? 's' : ''}</span>
              {selectedIds.size > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-teal-600 dark:text-teal-400 font-medium">{selectedIds.size} sélectionné{selectedIds.size !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ───── Patient Table ───── */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.size === filteredPatients.length && filteredPatients.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-10"></TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Nom complet
                      <SortIcon field="name" currentField={sortField} direction={sortDir} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    onClick={() => handleSort('age')}
                  >
                    <div className="flex items-center gap-1">
                      Âge / Genre
                      <SortIcon field="age" currentField={sortField} direction={sortDir} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center gap-1">
                      Téléphone
                      <SortIcon field="phone" currentField={sortField} direction={sortDir} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    onClick={() => handleSort('lastVisit')}
                  >
                    <div className="flex items-center gap-1">
                      Dernière visite
                      <SortIcon field="lastVisit" currentField={sortField} direction={sortDir} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Statut
                      <SortIcon field="status" currentField={sortField} direction={sortDir} />
                    </div>
                  </TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                          <Search className="size-8" />
                          <p className="text-sm font-medium">Aucun patient trouvé</p>
                          <p className="text-xs">Essayez de modifier vos critères de recherche</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient, index) => {
                      const age = calculateAge(patient.dateOfBirth)
                      const isSelected = selectedIds.has(patient.id)
                      const isEvenRow = index % 2 === 0

                      return (
                        <motion.tr
                          key={patient.id}
                          custom={index}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          className={`group cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/60 ${
                            isSelected
                              ? 'bg-teal-50/60 dark:bg-teal-950/20'
                              : isEvenRow
                                ? 'bg-white dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                                : 'bg-slate-50/40 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                          }`}
                          onClick={() => setDetailPatient(patient)}
                        >
                          <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(patient.id)}
                            />
                          </TableCell>
                          <TableCell className="w-10">
                            <div className="flex items-center justify-center size-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/40 transition-colors">
                              <QrCode className="size-4 text-slate-400 dark:text-slate-500 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center size-9 rounded-full shrink-0 font-semibold text-sm ${
                                patient.gender === 'F'
                                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                  : 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
                              }`}>
                                {patient.firstName[0]}{patient.lastName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {patient.lastName} {patient.firstName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <span className="size-1.5 rounded-full bg-teal-400" />
                                  {patient.reason}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{age} ans</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1.5">
                              {patient.gender === 'M' ? '♂' : '♀'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                              <Phone className="size-3 text-slate-400 dark:text-slate-500" />
                              {patient.phone}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(patient.lastVisit)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={patient.status} />
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setDetailPatient(patient)}>
                                  <Eye className="size-4" />
                                  Voir dossier
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Pencil className="size-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive">
                                  <Archive className="size-4" />
                                  Archiver
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      )
                    })
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>

      {/* ───── Patient Detail Sheet ───── */}
      <Sheet open={!!detailPatient} onOpenChange={(open) => !open && setDetailPatient(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl p-0 overflow-y-auto">
          {detailPatient && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-teal-600 to-emerald-700 p-6 pb-12">
                <SheetHeader className="text-white">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center size-16 rounded-2xl bg-white/20 backdrop-blur-sm text-white font-bold text-xl shrink-0">
                      {detailPatient.firstName[0]}{detailPatient.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <SheetTitle className="text-white text-xl">
                        {detailPatient.lastName} {detailPatient.firstName}
                      </SheetTitle>
                      <SheetDescription className="text-teal-100 mt-1">
                        {detailPatient.id} • {calculateAge(detailPatient.dateOfBirth)} ans • {detailPatient.gender === 'M' ? 'Masculin' : 'Féminin'}
                      </SheetDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={detailPatient.status} />
                        <Badge className="bg-white/20 text-white border-white/30 text-xs">
                          <QrCode className="size-3 mr-1" />
                          {detailPatient.qrCode}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              {/* Decorative curve */}
              <div className="relative -mt-6">
                <div className="mx-4 bg-white dark:bg-slate-950 rounded-t-2xl h-6" />
              </div>

              {/* Tabs */}
              <div className="flex-1 px-4 pb-6">
                <Tabs defaultValue="informations" className="w-full">
                  <TabsList className="w-full h-auto flex-wrap bg-slate-100 dark:bg-slate-900 p-1 mb-4">
                    <TabsTrigger value="informations" className="text-xs flex-1 gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                      <User className="size-3.5" />
                      Informations
                    </TabsTrigger>
                    <TabsTrigger value="historique" className="text-xs flex-1 gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                      <Clock className="size-3.5" />
                      Historique
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="text-xs flex-1 gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                      <FileText className="size-3.5" />
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="allergies" className="text-xs flex-1 gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                      <AlertTriangle className="size-3.5" />
                      Allergies
                    </TabsTrigger>
                    <TabsTrigger value="antecedents" className="text-xs flex-1 gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                      <Heart className="size-3.5" />
                      Antécédents
                    </TabsTrigger>
                  </TabsList>

                  {/* Informations Tab */}
                  <TabsContent value="informations">
                    <div className="space-y-4">
                      {/* Personal Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <InfoItem icon={Calendar} label="Date de naissance" value={formatDate(detailPatient.dateOfBirth)} />
                        <InfoItem icon={User} label="Genre" value={detailPatient.gender === 'M' ? 'Masculin' : 'Féminin'} />
                        <InfoItem icon={Phone} label="Téléphone" value={detailPatient.phone} />
                        <InfoItem icon={Droplets} label="Groupe sanguin" value={detailPatient.bloodType} />
                        <InfoItem icon={MapPin} label="Adresse" value={detailPatient.address} className="col-span-2" />
                        <InfoItem icon={ShieldCheck} label="N° identité nationale" value={detailPatient.nationalId} className="col-span-2" />
                      </div>

                      <Separator />

                      {/* Emergency Contact */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                          Contact d&apos;urgence
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <InfoItem icon={User} label="Nom" value={detailPatient.emergencyContact} />
                          <InfoItem icon={Phone} label="Téléphone" value={detailPatient.emergencyPhone} />
                        </div>
                      </div>

                      <Separator />

                      {/* Quick Stats */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                          Résumé
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                            <Activity className="size-4 text-teal-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{detailPatient.medicalHistory.length}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Antécédents</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                            <AlertTriangle className="size-4 text-amber-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{detailPatient.allergies.length}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Allergies</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                            <FileText className="size-4 text-sky-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{detailPatient.documents.length}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Documents</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Historique Tab */}
                  <TabsContent value="historique">
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Derniers événements
                      </h4>
                      {[
                        { date: detailPatient.lastVisit, label: 'Consultation', desc: detailPatient.reason, icon: Stethoscope, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40' },
                        { date: detailPatient.registrationDate, label: 'Inscription', desc: 'Premier enregistrement', icon: User, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40' },
                        ...(detailPatient.surgicalHistory.length > 0
                          ? detailPatient.surgicalHistory.map((s, i) => ({
                              date: `20${20 + i}`,
                              label: 'Chirurgie',
                              desc: s,
                              icon: Activity,
                              color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
                            }))
                          : []),
                      ].map((event, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50"
                        >
                          <div className={`flex items-center justify-center size-8 rounded-lg ${event.color} shrink-0`}>
                            <event.icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{event.label}</p>
                              <span className="text-xs text-slate-400 dark:text-slate-500">{event.date}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents">
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Documents médicaux ({detailPatient.documents.length})
                      </h4>
                      {detailPatient.documents.map((doc, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                          <div className="flex items-center justify-center size-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 shrink-0">
                            <FileText className="size-5 text-rose-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(doc.date)} • {doc.type}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 dark:text-teal-400"
                          >
                            <Download className="size-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Allergies Tab */}
                  <TabsContent value="allergies">
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Allergies connues ({detailPatient.allergies.length})
                      </h4>
                      {detailPatient.allergies.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-slate-400 dark:text-slate-500">
                          <ShieldCheck className="size-10 mb-2" />
                          <p className="text-sm font-medium">Aucune allergie connue</p>
                          <p className="text-xs">Ce patient n&apos;a pas d&apos;allergies enregistrées</p>
                        </div>
                      ) : (
                        detailPatient.allergies.map((allergy, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50"
                          >
                            <div className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${
                              allergy.severity === 'Critique'
                                ? 'bg-rose-50 dark:bg-rose-950/40'
                                : allergy.severity === 'Majeur'
                                  ? 'bg-amber-50 dark:bg-amber-950/40'
                                  : 'bg-sky-50 dark:bg-sky-950/40'
                            }`}>
                              <AlertTriangle className={`size-5 ${
                                allergy.severity === 'Critique'
                                  ? 'text-rose-500'
                                  : allergy.severity === 'Majeur'
                                    ? 'text-amber-500'
                                    : 'text-sky-500'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{allergy.name}</p>
                            </div>
                            <SeverityBadge severity={allergy.severity} />
                          </motion.div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Antécédents Tab */}
                  <TabsContent value="antecedents">
                    <div className="space-y-5">
                      {/* Medical */}
                      <AntecedentSection
                        title="Antécédents médicaux"
                        icon={Stethoscope}
                        color="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40"
                        items={detailPatient.medicalHistory}
                      />
                      {/* Surgical */}
                      <AntecedentSection
                        title="Antécédents chirurgicaux"
                        icon={Activity}
                        color="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
                        items={detailPatient.surgicalHistory}
                      />
                      {/* Family */}
                      <AntecedentSection
                        title="Antécédents familiaux"
                        icon={Baby}
                        color="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40"
                        items={detailPatient.familyHistory}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ───── New Patient Dialog ───── */}
      <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
                <Plus className="size-4 text-white" />
              </div>
              Nouveau Patient
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du patient. Les champs marqués * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Required Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium">
                  Nom <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Diallo"
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium">
                  Prénom <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Aminata"
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-xs font-medium">
                  Date de naissance <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={newPatient.dateOfBirth}
                  onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-xs font-medium">
                  Genre <span className="text-rose-500">*</span>
                </Label>
                <Select value={newPatient.gender} onValueChange={(v) => setNewPatient({ ...newPatient, gender: v as 'M' | 'F' })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium">
                Téléphone <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="+224 6XX XX XX XX"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              />
            </div>

            <Separator />

            {/* Optional Fields */}
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Informations complémentaires
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-medium">Adresse</Label>
              <Input
                id="address"
                placeholder="Conakry, Kaloum"
                value={newPatient.address}
                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nationalId" className="text-xs font-medium">N° identité nationale</Label>
                <Input
                  id="nationalId"
                  placeholder="GN-XXXX-XXXX-XX"
                  value={newPatient.nationalId}
                  onChange={(e) => setNewPatient({ ...newPatient, nationalId: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bloodType" className="text-xs font-medium">Groupe sanguin</Label>
                <Select value={newPatient.bloodType || '_none'} onValueChange={(v) => setNewPatient({ ...newPatient, bloodType: v === '_none' ? '' : v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Non renseigné</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="emergencyName" className="text-xs font-medium">Contact d&apos;urgence</Label>
                <Input
                  id="emergencyName"
                  placeholder="Nom du contact"
                  value={newPatient.emergencyContact}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergencyPhone" className="text-xs font-medium">Tél. d&apos;urgence</Label>
                <Input
                  id="emergencyPhone"
                  placeholder="+224 6XX XX XX XX"
                  value={newPatient.emergencyPhone}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="allergies" className="text-xs font-medium">Allergies connues</Label>
              <Input
                id="allergies"
                placeholder="Pénicilline, Sulfamides, Latex..."
                value={newPatient.allergies}
                onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Séparez les allergies par des virgules</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="antecedents" className="text-xs font-medium">Antécédents médicaux</Label>
              <Textarea
                id="antecedents"
                placeholder="Décrivez les antécédents médicaux, chirurgicaux et familiaux..."
                rows={3}
                value={newPatient.antecedents}
                onChange={(e) => setNewPatient({ ...newPatient, antecedents: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowNewPatientDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleNewPatient}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white gap-2"
            >
              <QrCode className="size-4" />
              Enregistrer & Générer QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </motion.div>
  )
}

/* ─────────── Sub-Components ─────────── */

function InfoItem({
  icon: Icon,
  label,
  value,
  className = '',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={`flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 ${className}`}>
      <Icon className="size-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  )
}

function AntecedentSection({
  title,
  icon: Icon,
  color,
  items,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  items: string[]
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
        <div className={`flex items-center justify-center size-6 rounded-md ${color}`}>
          <Icon className="size-3.5" />
        </div>
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 ml-8">Aucun antécédent enregistré</p>
      ) : (
        <div className="space-y-1.5 ml-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <span className="size-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
              {item}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
