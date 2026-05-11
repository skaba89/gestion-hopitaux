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
  Lock,
  Unlock,
  Shield,
  Upload,
  Trash2,
  CheckCircle,
  XCircle,
  FileUp,
  EyeOff,
  ChevronRight,
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
import { useDataStore, type Patient, type MedicalDocument, type UserRole, ROLE_PERMISSIONS } from '@/lib/data-store'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

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
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, type: 'spring' as const, stiffness: 300, damping: 24 },
  }),
}

/* ─────────── Types ─────────── */

type PatientStatus = Patient['status']
type SortField = 'name' | 'age' | 'phone' | 'lastVisit' | 'status'
type SortDir = 'asc' | 'desc'

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

/* ─────────── Default form state helper ─────────── */

const defaultFormState = {
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
}

/* ─────────── Main Component ─────────── */

export function PatientsPage() {
  // Store
  const {
    patients, addPatient, updatePatient, archivePatient,
    documentAuthorizations, requestDocumentAccess, approveDocumentAccess, refuseDocumentAccess,
    addPatientDocument, removePatientDocument, addNotification,
  } = useDataStore()
  const { user } = useStore()
  const { toast } = useToast()

  // Role-based permissions
  const userRole = (user.role as UserRole) || 'Médecin'
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Médecin']
  const isAdmin = userRole === 'Administrateur'

  // Document authorization state
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authDocName, setAuthDocName] = useState('')
  const [authReason, setAuthReason] = useState('')
  const [showDocViewer, setShowDocViewer] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<MedicalDocument | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [newDocCategory, setNewDocCategory] = useState<MedicalDocument['category']>('Autre')
  const [showAuthManage, setShowAuthManage] = useState(false)

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

  // Edit state
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  // Form state (used for both new and edit)
  const [formData, setFormData] = useState({ ...defaultFormState })

  // Whether the dialog is open (new or edit)
  const isDialogOpen = showNewPatientDialog || !!editingPatient

  // Filtered & sorted patients
  const filteredPatients = useMemo(() => {
    let result = [...patients]

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
  }, [patients, searchQuery, statusFilter, genderFilter, dateFrom, dateTo, sortField, sortDir])

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
  const activePatientCount = patients.filter((p) => p.status === 'Actif').length

  // Open new patient dialog
  const openNewPatientDialog = () => {
    setEditingPatient(null)
    setFormData({ ...defaultFormState })
    setShowNewPatientDialog(true)
  }

  // Open edit patient dialog
  const openEditPatientDialog = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      nationalId: patient.nationalId,
      bloodType: patient.bloodType,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      allergies: patient.allergies.map((a) => a.name).join(', '),
      antecedents: patient.medicalHistory.join('\n'),
    })
    setShowNewPatientDialog(false)
  }

  // Close dialog
  const closeDialog = () => {
    setShowNewPatientDialog(false)
    setEditingPatient(null)
    setFormData({ ...defaultFormState })
  }

  // Handle form submit (new or edit)
  const handleFormSubmit = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.dateOfBirth || !formData.phone.trim()) {
      toast({
        title: 'Champs obligatoires manquants',
        description: 'Veuillez remplir le nom, le prénom, la date de naissance et le téléphone.',
        variant: 'destructive',
      })
      return
    }

    const parsedAllergies = formData.allergies
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)
      .map((name) => ({ name, severity: 'Majeur' as const }))

    const parsedMedicalHistory = formData.antecedents
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean)

    const today = new Date().toISOString().split('T')[0]

    if (editingPatient) {
      // Update existing patient
      updatePatient(editingPatient.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        nationalId: formData.nationalId.trim(),
        bloodType: formData.bloodType,
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        allergies: parsedAllergies,
        medicalHistory: parsedMedicalHistory,
      })

      // Update detail view if open
      if (detailPatient?.id === editingPatient.id) {
        setDetailPatient({
          ...editingPatient,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          nationalId: formData.nationalId.trim(),
          bloodType: formData.bloodType,
          emergencyContact: formData.emergencyContact.trim(),
          emergencyPhone: formData.emergencyPhone.trim(),
          allergies: parsedAllergies,
          medicalHistory: parsedMedicalHistory,
        })
      }

      toast({
        title: 'Patient modifié',
        description: `${formData.lastName} ${formData.firstName} a été mis à jour avec succès.`,
      })
    } else {
      // Add new patient
      const newId = `P-${Date.now()}`
      const initials = `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
      const qrCode = `QR-${initials}-${Date.now().toString().slice(-6)}`

      const newPatientData: Patient = {
        id: newId,
        qrCode,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        nationalId: formData.nationalId.trim(),
        bloodType: formData.bloodType,
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        lastVisit: today,
        status: 'Actif',
        reason: 'Nouveau patient',
        allergies: parsedAllergies,
        medicalHistory: parsedMedicalHistory,
        surgicalHistory: [],
        familyHistory: [],
        documents: [],
        registrationDate: today,
      }

      addPatient(newPatientData)

      toast({
        title: 'Patient ajouté',
        description: `${formData.lastName} ${formData.firstName} a été enregistré avec succès. QR code: ${qrCode}`,
      })
    }

    closeDialog()
  }

  // Handle archive patient
  const handleArchivePatient = (id: string, patientName: string) => {
    archivePatient(id)

    // Close detail panel if viewing this patient
    if (detailPatient?.id === id) {
      setDetailPatient(null)
    }

    // Remove from selection
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

    toast({
      title: 'Patient archivé',
      description: `${patientName} a été archivé.`,
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
          onClick={openNewPatientDialog}
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
                                <DropdownMenuItem onClick={() => openEditPatientDialog(patient)}>
                                  <Pencil className="size-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleArchivePatient(patient.id, `${patient.lastName} ${patient.firstName}`)}
                                >
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
                      {/* Header with role badge and actions */}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Documents médicaux ({detailPatient.documents.length})
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] ${isAdmin ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'}`}>
                            {isAdmin ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                            {isAdmin ? 'Accès complet' : 'Accès restreint'}
                          </Badge>
                          {permissions.canUpload && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => setShowUploadDialog(true)}
                            >
                              <Upload className="w-3 h-3" />
                              Ajouter
                            </Button>
                          )}
                          {isAdmin && documentAuthorizations.filter(a => a.patientId === detailPatient.id && a.status === 'En attente').length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                              onClick={() => setShowAuthManage(true)}
                            >
                              <Shield className="w-3 h-3" />
                              Autorisations ({documentAuthorizations.filter(a => a.patientId === detailPatient.id && a.status === 'En attente').length})
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Role permission notice for non-admin */}
                      {!isAdmin && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-3">
                          <div className="flex items-start gap-2">
                            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                                Accès restreint — Rôle : {userRole}
                              </p>
                              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 leading-relaxed">
                                {permissions.canView
                                  ? 'Vous pouvez visualiser les documents. Le téléchargement nécessite une autorisation administrateur.'
                                  : 'L\'accès aux documents nécessite une autorisation administrateur.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Documents list */}
                      {detailPatient.documents.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-slate-400 dark:text-slate-500">
                          <FileText className="size-10 mb-2" />
                          <p className="text-sm font-medium">Aucun document</p>
                          <p className="text-xs">Ce patient n&apos;a pas de documents enregistrés</p>
                        </div>
                      ) : (
                        detailPatient.documents.map((doc, i) => {
                          // Check if this user has an approved authorization for this doc
                          const hasApprovedAuth = documentAuthorizations.some(
                            a => a.patientId === detailPatient.id && a.documentName === doc.name && a.status === 'Approuvée' && a.requestedByRole === userRole
                          )
                          const canViewThisDoc = permissions.canView || hasApprovedAuth || isAdmin
                          const canDownloadThisDoc = permissions.canDownload || hasApprovedAuth || isAdmin
                          const pendingAuth = documentAuthorizations.find(
                            a => a.patientId === detailPatient.id && a.documentName === doc.name && a.status === 'En attente' && a.requestedByRole === userRole
                          )
                          const isConfidential = doc.confidential && !isAdmin

                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-colors group ${
                                isConfidential && !canViewThisDoc
                                  ? 'bg-slate-100 dark:bg-slate-900/80 opacity-70'
                                  : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <div className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${
                                isConfidential && !canViewThisDoc
                                  ? 'bg-slate-200 dark:bg-slate-800'
                                  : doc.category === 'Résultat'
                                    ? 'bg-blue-50 dark:bg-blue-950/40'
                                    : doc.category === 'Ordonnance'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40'
                                      : doc.category === 'Imagerie'
                                        ? 'bg-violet-50 dark:bg-violet-950/40'
                                        : 'bg-rose-50 dark:bg-rose-950/40'
                              }`}>
                                {isConfidential && !canViewThisDoc ? (
                                  <Lock className="size-5 text-slate-400" />
                                ) : doc.category === 'Résultat' ? (
                                  <Activity className="size-5 text-blue-500" />
                                ) : doc.category === 'Ordonnance' ? (
                                  <Stethoscope className="size-5 text-emerald-500" />
                                ) : doc.category === 'Imagerie' ? (
                                  <Eye className="size-5 text-violet-500" />
                                ) : (
                                  <FileText className="size-5 text-rose-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.name}</p>
                                  {doc.confidential && (
                                    <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(doc.date)} • {doc.type}</p>
                                  {doc.size && <span className="text-[10px] text-slate-300 dark:text-slate-600">• {doc.size}</span>}
                                  {doc.category && (
                                    <Badge className="text-[9px] h-4 px-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                                      {doc.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {/* View button */}
                                {canViewThisDoc ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-teal-600"
                                    onClick={() => { setViewingDoc(doc); setShowDocViewer(true) }}
                                    title="Visualiser"
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                ) : !pendingAuth ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-600"
                                    onClick={() => { setAuthDocName(doc.name); setShowAuthDialog(true) }}
                                    title="Demander l'autorisation"
                                  >
                                    <EyeOff className="size-4" />
                                  </Button>
                                ) : (
                                  <Badge className="text-[9px] h-5 px-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                                    En attente
                                  </Badge>
                                )}

                                {/* Download button - admin or authorized only */}
                                {canDownloadThisDoc && canViewThisDoc && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 dark:text-teal-400"
                                    onClick={() => {
                                      // Generate a demo file download
                                      const content = `Document: ${doc.name}\nPatient: ${detailPatient.firstName} ${detailPatient.lastName}\nID: ${detailPatient.id}\nDate: ${doc.date}\nType: ${doc.type}\nCatégorie: ${doc.category || 'Non classé'}\n\nCe document est une démonstration HealthFlow Guinea.\nLe contenu réel serait disponible en production.`
                                      const blob = new Blob([content], { type: 'text/plain' })
                                      const url = URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.href = url
                                      a.download = `${doc.name.replace(/\s+/g, '_')}_${detailPatient.id}.txt`
                                      a.click()
                                      URL.revokeObjectURL(url)
                                      toast({ title: 'Téléchargement', description: `${doc.name} téléchargé avec succès` })
                                    }}
                                    title="Télécharger"
                                  >
                                    <Download className="size-4" />
                                  </Button>
                                )}

                                {/* Request download auth for non-admin */}
                                {!canDownloadThisDoc && canViewThisDoc && !pendingAuth && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500"
                                    onClick={() => { setAuthDocName(doc.name); setShowAuthDialog(true) }}
                                    title="Demander l'autorisation de télécharger"
                                  >
                                    <Download className="size-4" />
                                  </Button>
                                )}

                                {/* Delete button - admin only */}
                                {permissions.canDelete && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                                    onClick={() => {
                                      removePatientDocument(detailPatient.id, doc.name)
                                      setDetailPatient({ ...detailPatient, documents: detailPatient.documents.filter(d => d.name !== doc.name) })
                                      toast({ title: 'Document supprimé', description: `${doc.name} a été supprimé` })
                                    }}
                                    title="Supprimer"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          )
                        })
                      )}
                    </div>
                  </TabsContent>

                  {/* Authorization request dialog */}
                  <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-amber-500" />
                          Demande d&apos;autorisation
                        </DialogTitle>
                        <DialogDescription>
                          Vous n&apos;avez pas les droits nécessaires pour accéder à ce document.
                          Demandez une autorisation à un administrateur.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">Document : {authDocName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Patient : {detailPatient?.firstName} {detailPatient?.lastName} ({detailPatient?.id})</p>
                          <p className="text-xs text-slate-500">Votre rôle : {userRole}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="auth-reason" className="text-sm font-medium">Motif de la demande *</Label>
                          <Textarea
                            id="auth-reason"
                            placeholder="Expliquez pourquoi vous avez besoin d'accéder à ce document..."
                            value={authReason}
                            onChange={(e) => setAuthReason(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAuthDialog(false)}>Annuler</Button>
                        <Button
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                          disabled={!authReason.trim()}
                          onClick={() => {
                            if (!detailPatient) return
                            requestDocumentAccess({
                              documentName: authDocName,
                              patientId: detailPatient.id,
                              patientName: `${detailPatient.firstName} ${detailPatient.lastName}`,
                              requestedBy: user.name,
                              requestedByRole: userRole,
                              reason: authReason,
                            })
                            addNotification({
                              id: `NOTIF-${Date.now()}`,
                              title: 'Demande d\'autorisation',
                              message: `${user.name} (${userRole}) demande l'accès à "${authDocName}" du patient ${detailPatient.firstName} ${detailPatient.lastName}`,
                              type: 'warning',
                              time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                              read: false,
                            })
                            toast({ title: 'Demande envoyée', description: 'Votre demande d\'autorisation a été envoyée à l\'administrateur.' })
                            setShowAuthDialog(false)
                            setAuthReason('')
                            setAuthDocName('')
                          }}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Envoyer la demande
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Document viewer dialog */}
                  <Dialog open={showDocViewer} onOpenChange={setShowDocViewer}>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-teal-500" />
                          {viewingDoc?.name}
                        </DialogTitle>
                        <DialogDescription>
                          Visualisation du document — {detailPatient?.firstName} {detailPatient?.lastName}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-2">
                        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[200px]">
                          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-teal-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{viewingDoc?.name}</p>
                              <p className="text-xs text-slate-500">{viewingDoc?.date && formatDate(viewingDoc.date)} • {viewingDoc?.type} {viewingDoc?.size && `• ${viewingDoc.size}`}</p>
                            </div>
                          </div>
                          {viewingDoc?.category === 'Imagerie' ? (
                            <div className="flex items-center justify-center h-40 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <div className="text-center">
                                <Eye className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs text-slate-400">Aperçu image/radiologie</p>
                                <p className="text-[10px] text-slate-300">Disponible en production</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Patient</span>
                                <span className="text-slate-900 dark:text-white font-medium">{detailPatient?.firstName} {detailPatient?.lastName}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">ID Patient</span>
                                <span className="text-slate-900 dark:text-white">{detailPatient?.id}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Date</span>
                                <span className="text-slate-900 dark:text-white">{viewingDoc?.date && formatDate(viewingDoc.date)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Catégorie</span>
                                <span className="text-slate-900 dark:text-white">{viewingDoc?.category || 'Non classé'}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                  Ce document est consultable en mode visualisation uniquement.
                                  {permissions.canDownload || isAdmin ? ' Vous pouvez le télécharger via le bouton dédié.' : ' Le téléchargement nécessite une autorisation administrateur.'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        {!permissions.canDownload && !isAdmin && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">Mode visualisation uniquement — Téléchargement restreint</p>
                          </div>
                        )}
                      </div>
                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDocViewer(false)}>Fermer</Button>
                        {(permissions.canDownload || isAdmin) && viewingDoc && (
                          <Button
                            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                            onClick={() => {
                              const content = `Document: ${viewingDoc.name}\nPatient: ${detailPatient?.firstName} ${detailPatient?.lastName}\nID: ${detailPatient?.id}\nDate: ${viewingDoc.date}\nType: ${viewingDoc.type}\nCatégorie: ${viewingDoc.category || 'Non classé'}\n\nCe document est une démonstration HealthFlow Guinea.\nLe contenu réel serait disponible en production.`
                              const blob = new Blob([content], { type: 'text/plain' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `${viewingDoc.name.replace(/\s+/g, '_')}_${detailPatient?.id}.txt`
                              a.click()
                              URL.revokeObjectURL(url)
                              toast({ title: 'Téléchargement', description: `${viewingDoc.name} téléchargé avec succès` })
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Télécharger
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Upload document dialog */}
                  <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileUp className="w-5 h-5 text-teal-500" />
                          Ajouter un document
                        </DialogTitle>
                        <DialogDescription>
                          Ajouter un document au dossier de {detailPatient?.firstName} {detailPatient?.lastName}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label htmlFor="doc-name" className="text-sm font-medium">Nom du document *</Label>
                          <Input
                            id="doc-name"
                            placeholder="Ex: Résultats échographie"
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doc-category" className="text-sm font-medium">Catégorie</Label>
                          <Select value={newDocCategory} onValueChange={(v) => setNewDocCategory(v as MedicalDocument['category'])}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Résultat">Résultat d&apos;analyse</SelectItem>
                              <SelectItem value="Ordonnance">Ordonnance</SelectItem>
                              <SelectItem value="Imagerie">Imagerie / Radiologie</SelectItem>
                              <SelectItem value="Certificat">Certificat médical</SelectItem>
                              <SelectItem value="Autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
                          <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">Glisser-déposer ou cliquer pour sélectionner</p>
                          <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (max 10 Mo)</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowUploadDialog(false); setNewDocName(''); setNewDocCategory('Autre') }}>Annuler</Button>
                        <Button
                          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                          disabled={!newDocName.trim()}
                          onClick={() => {
                            if (!detailPatient || !newDocName.trim()) return
                            const newDoc: MedicalDocument = {
                              name: newDocName.trim(),
                              date: new Date().toISOString().split('T')[0],
                              type: 'PDF',
                              size: '256 Ko',
                              category: newDocCategory,
                              confidential: false,
                              uploadedBy: user.name,
                            }
                            addPatientDocument(detailPatient.id, newDoc)
                            setDetailPatient({ ...detailPatient, documents: [...detailPatient.documents, newDoc] })
                            toast({ title: 'Document ajouté', description: `${newDocName} a été ajouté au dossier` })
                            setShowUploadDialog(false)
                            setNewDocName('')
                            setNewDocCategory('Autre')
                          }}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Enregistrer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Admin: Authorization management dialog */}
                  <Dialog open={showAuthManage} onOpenChange={setShowAuthManage}>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-amber-500" />
                          Gestion des autorisations
                        </DialogTitle>
                        <DialogDescription>
                          Demandes d&apos;accès en attente pour {detailPatient?.firstName} {detailPatient?.lastName}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-2 max-h-80 overflow-y-auto">
                        {documentAuthorizations.filter(a => a.patientId === detailPatient?.id).length === 0 ? (
                          <div className="text-center py-6 text-slate-400">
                            <ShieldCheck className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Aucune demande d&apos;autorisation</p>
                          </div>
                        ) : (
                          documentAuthorizations
                            .filter(a => a.patientId === detailPatient?.id)
                            .map((auth) => (
                              <div key={auth.id} className={`p-3 rounded-xl border ${
                                auth.status === 'En attente' ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20' :
                                auth.status === 'Approuvée' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20' :
                                'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
                              }`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{auth.documentName}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      Demandé par <span className="font-medium">{auth.requestedBy}</span> ({auth.requestedByRole})
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">Motif : {auth.reason}</p>
                                  </div>
                                  <Badge className={`text-[10px] flex-shrink-0 ${
                                    auth.status === 'En attente' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                                    auth.status === 'Approuvée' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                                    'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                                  }`}>
                                    {auth.status === 'En attente' && <Clock className="w-2.5 h-2.5 mr-0.5" />}
                                    {auth.status === 'Approuvée' && <CheckCircle className="w-2.5 h-2.5 mr-0.5" />}
                                    {auth.status === 'Refusée' && <XCircle className="w-2.5 h-2.5 mr-0.5" />}
                                    {auth.status}
                                  </Badge>
                                </div>
                                {auth.status === 'En attente' && isAdmin && (
                                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-800/50">
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                      onClick={() => {
                                        approveDocumentAccess(auth.id, user.name)
                                        addNotification({
                                          id: `NOTIF-${Date.now()}`,
                                          title: 'Autorisation accordée',
                                          message: `Votre accès à "${auth.documentName}" a été approuvé par ${user.name}`,
                                          type: 'success',
                                          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                                          read: false,
                                        })
                                        toast({ title: 'Autorisation accordée', description: `Accès à "${auth.documentName}" accordé à ${auth.requestedBy}` })
                                      }}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Approuver
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                                      onClick={() => {
                                        refuseDocumentAccess(auth.id, user.name)
                                        toast({ title: 'Autorisation refusée', description: `Accès à "${auth.documentName}" refusé pour ${auth.requestedBy}`, variant: 'destructive' })
                                      }}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Refuser
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAuthManage(false)}>Fermer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

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

      {/* ───── New / Edit Patient Dialog ───── */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
                {editingPatient ? <Pencil className="size-4 text-white" /> : <Plus className="size-4 text-white" />}
              </div>
              {editingPatient ? 'Modifier le Patient' : 'Nouveau Patient'}
            </DialogTitle>
            <DialogDescription>
              {editingPatient
                ? `Modifiez les informations de ${editingPatient.lastName} ${editingPatient.firstName}.`
                : 'Remplissez les informations du patient. Les champs marqués * sont obligatoires.'}
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
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium">
                  Prénom <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Aminata"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-xs font-medium">
                  Genre <span className="text-rose-500">*</span>
                </Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v as 'M' | 'F' })}>
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
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nationalId" className="text-xs font-medium">N° identité nationale</Label>
                <Input
                  id="nationalId"
                  placeholder="GN-XXXX-XXXX-XX"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bloodType" className="text-xs font-medium">Groupe sanguin</Label>
                <Select value={formData.bloodType || '_none'} onValueChange={(v) => setFormData({ ...formData, bloodType: v === '_none' ? '' : v })}>
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
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergencyPhone" className="text-xs font-medium">Tél. d&apos;urgence</Label>
                <Input
                  id="emergencyPhone"
                  placeholder="+224 6XX XX XX XX"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="allergies" className="text-xs font-medium">Allergies connues</Label>
              <Input
                id="allergies"
                placeholder="Pénicilline, Sulfamides, Latex..."
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Séparez les allergies par des virgules</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="antecedents" className="text-xs font-medium">Antécédents médicaux</Label>
              <Textarea
                id="antecedents"
                placeholder="Décrivez les antécédents médicaux, chirurgicaux et familiaux..."
                rows={3}
                value={formData.antecedents}
                onChange={(e) => setFormData({ ...formData, antecedents: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closeDialog}
            >
              Annuler
            </Button>
            <Button
              onClick={handleFormSubmit}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white gap-2"
            >
              {editingPatient ? (
                <>
                  <Pencil className="size-4" />
                  Mettre à jour
                </>
              ) : (
                <>
                  <QrCode className="size-4" />
                  Enregistrer & Générer QR
                </>
              )}
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
