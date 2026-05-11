'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import {
  Building2, Search, MapPin, Users, Bed, Stethoscope, Phone, Wifi, WifiOff,
  Zap, Shield, ChevronRight, Activity, TrendingUp, Heart, CreditCard,
  CheckCircle2, AlertTriangle, XCircle, Server, Sun, Gauge,
  PlusCircle, Eye, Edit2, Hospital,
} from 'lucide-react'
import {
  GUINEA_HEALTH_ZONES_FULL, DEMO_FACILITIES, FACILITY_TYPE_LABELS, CONNECTIVITY_LABELS,
  type HealthFacility, type HealthZone,
} from '@/lib/national-deployment'

/* ─────────── Helpers ─────────── */

function getZoneLabel(code: string): string {
  return GUINEA_HEALTH_ZONES_FULL.find((z) => z.code === code)?.name ?? code
}

function getDeployedBadge(deployed: boolean, version: string | null) {
  if (deployed) {
    return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />v{version}</Badge>
  }
  return <Badge className="bg-gray-100 text-gray-600 border-gray-200"><XCircle className="h-3 w-3 mr-1" />Non déployé</Badge>
}

function getConnectivityIcon(conn: HealthZone['connectivity']) {
  const icons: Record<string, typeof Wifi> = { fiber: Wifi, '4g': Wifi, '3g': Wifi, satellite: Wifi, offline: WifiOff }
  const colors: Record<string, string> = { fiber: 'text-green-600', '4g': 'text-blue-600', '3g': 'text-amber-600', satellite: 'text-purple-600', offline: 'text-red-600' }
  const Icon = icons[conn] || WifiOff
  return <Icon className={`h-4 w-4 ${colors[conn] || 'text-gray-500'}`} />
}

function getPowerBadge(power: HealthFacility['powerSupply']) {
  const config = {
    stable: { label: 'Stable', className: 'bg-green-100 text-green-700 border-green-200', Icon: Zap },
    generator: { label: 'Générateur', className: 'bg-amber-100 text-amber-700 border-amber-200', Icon: Zap },
    solar: { label: 'Solaire', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: Sun },
    unstable: { label: 'Instable', className: 'bg-red-100 text-red-700 border-red-200', Icon: AlertTriangle },
  }
  const c = config[power]
  return <Badge variant="outline" className={c.className}><c.Icon className="h-3 w-3 mr-1" />{c.label}</Badge>
}

function getUptimeColor(uptime: number): string {
  if (uptime >= 99) return 'text-green-600'
  if (uptime >= 95) return 'text-amber-600'
  if (uptime > 0) return 'text-red-600'
  return 'text-gray-400'
}

function getAccreditationBadge(accred: HealthFacility['accreditation']) {
  const config = {
    A: { label: 'A — Excellent', className: 'bg-green-100 text-green-700 border-green-200' },
    B: { label: 'B — Bon', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    C: { label: 'C — Acceptable', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    pending: { label: 'En attente', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  }
  const c = config[accred]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

/* ─────────── Facility Detail Dialog ─────────── */

function FacilityDetailDialog({ facility }: { facility: HealthFacility }) {
  const occupancyRate = Math.round((facility.currentOccupancy / facility.capacity) * 100)
  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Hospital className="h-5 w-5 text-teal-600" />
          {facility.name}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">{FACILITY_TYPE_LABELS[facility.type]}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Zone</p>
            <p className="font-medium">{getZoneLabel(facility.zoneCode)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Directeur</p>
            <p className="font-medium">{facility.director}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Téléphone</p>
            <p className="font-medium">{facility.phone}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
            <p className="text-lg font-bold text-blue-600">{facility.capacity}</p>
            <p className="text-xs text-muted-foreground">Capacité lits</p>
          </div>
          <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950">
            <p className="text-lg font-bold text-teal-600">{facility.totalPatients.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-muted-foreground">Patients total</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950">
            <p className="text-lg font-bold text-emerald-600">{facility.totalConsultations.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-muted-foreground">Consultations</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950">
            <p className="text-lg font-bold text-amber-600">{(facility.monthlyRevenue / 1000000).toFixed(1)}M GNF</p>
            <p className="text-xs text-muted-foreground">Revenus/mois</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Taux d&apos;occupation</p>
          <div className="flex items-center gap-3">
            <Progress value={occupancyRate} className="flex-1" />
            <span className="text-sm font-semibold">{occupancyRate}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Connectivité</p>
            <div className="flex items-center gap-2 mt-1">
              {getConnectivityIcon(facility.connectivity)}
              <span className="font-medium">{CONNECTIVITY_LABELS[facility.connectivity]}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Alimentation</p>
            <div className="mt-1">{getPowerBadge(facility.powerSupply)}</div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">HealthFlow</p>
            <div className="mt-1">{getDeployedBadge(facility.healthflowDeployed, facility.healthflowVersion)}</div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Accréditation</p>
            <div className="mt-1">{getAccreditationBadge(facility.accreditation)}</div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Départements ({facility.departments.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {facility.departments.map((d) => (
              <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Équipements ({facility.equipment.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {facility.equipment.map((e) => (
              <Badge key={e} variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">{e}</Badge>
            ))}
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

/* ─────────── Main Component ─────────── */

export function FacilitiesManagement() {
  const [activeTab, setActiveTab] = useState('zones')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null)

  const filteredFacilities = useMemo(() => {
    let result = DEMO_FACILITIES
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((f) => f.name.toLowerCase().includes(q) || f.director.toLowerCase().includes(q) || f.id.toLowerCase().includes(q))
    }
    if (selectedZone !== 'all') result = result.filter((f) => f.zoneCode === selectedZone)
    if (selectedType !== 'all') result = result.filter((f) => f.type === selectedType)
    return result
  }, [searchQuery, selectedZone, selectedType])

  const totalBeds = DEMO_FACILITIES.reduce((s, f) => s + f.capacity, 0)
  const totalOccupancy = DEMO_FACILITIES.reduce((s, f) => s + f.currentOccupancy, 0)
  const deployedCount = DEMO_FACILITIES.filter((f) => f.healthflowDeployed).length
  const avgUptime = DEMO_FACILITIES.filter((f) => f.healthflowDeployed).reduce((s, f) => s + f.uptime24h, 0) / deployedCount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-teal-600" />
            Établissements de Santé
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestion des établissements de santé — 8 zones sanitaires de Guinée
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
            <Building2 className="h-3 w-3 mr-1" />{DEMO_FACILITIES.length} établissements
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />{deployedCount} déployés
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="zones">Zones Sanitaires</TabsTrigger>
          <TabsTrigger value="facilities">Établissements</TabsTrigger>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
        </TabsList>

        {/* ── Zones Sanitaires ── */}
        <TabsContent value="zones" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Zones sanitaires', value: '8', icon: MapPin, color: 'text-teal-600' },
              { label: 'Districts', value: String(GUINEA_HEALTH_ZONES_FULL.reduce((s, z) => s + z.districts.length, 0)), icon: Building2, color: 'text-blue-600' },
              { label: 'Population totale', value: (GUINEA_HEALTH_ZONES_FULL.reduce((s, z) => s + z.population, 0) / 1000000).toFixed(1) + 'M', icon: Users, color: 'text-emerald-600' },
              { label: 'Médecins total', value: String(GUINEA_HEALTH_ZONES_FULL.reduce((s, z) => s + z.doctors, 0)), icon: Stethoscope, color: 'text-orange-600' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: 'easeOut' }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            {GUINEA_HEALTH_ZONES_FULL.map((zone, i) => (
              <motion.div key={zone.code} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: 'easeOut' }}>
                <Card className="border-l-4 border-l-teal-400">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-teal-600" />
                          <h3 className="font-semibold text-base">{zone.name}</h3>
                          <Badge variant="outline" className="text-xs">{zone.districts.length} districts</Badge>
                          <Badge variant="outline" className={`text-xs ${zone.healthflowStatus === 'deployed' ? 'bg-green-50 text-green-700 border-green-200' : zone.healthflowStatus === 'partial' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {zone.healthflowStatus === 'deployed' ? 'Déployé' : zone.healthflowStatus === 'partial' ? 'Partiel' : zone.healthflowStatus === 'pending' ? 'En attente' : 'Planifié'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Population</span>
                            <p className="font-medium">{(zone.population / 1000000).toFixed(2)}M</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Établissements</span>
                            <p className="font-medium">{zone.healthFacilities}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Médecins</span>
                            <p className="font-medium">{zone.doctors}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Lits</span>
                            <p className="font-medium">{zone.hospitalBeds}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Connectivité</span>
                            <div className="flex items-center gap-1">
                              {getConnectivityIcon(zone.connectivity)}
                              <span className="font-medium text-xs">{CONNECTIVITY_LABELS[zone.connectivity]}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Coordinateur</span>
                            <p className="font-medium text-xs">{zone.coordinatorName}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {zone.districts.map((d) => (
                            <Badge key={d.code} variant="outline" className={`text-xs ${d.healthflowStatus === 'deployed' ? 'bg-green-50 text-green-700' : d.healthflowStatus === 'partial' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'}`}>
                              {d.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ── Établissements ── */}
        <TabsContent value="facilities" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un établissement..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Zone sanitaire" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les zones</SelectItem>
                {GUINEA_HEALTH_ZONES_FULL.map((z) => (<SelectItem key={z.code} value={z.code}>{z.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(FACILITY_TYPE_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Badge variant="outline">{filteredFacilities.length} résultat(s)</Badge>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {filteredFacilities.map((facility, i) => {
                const occupancyRate = Math.round((facility.currentOccupancy / facility.capacity) * 100)
                return (
                  <motion.div key={facility.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, ease: 'easeOut' }}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{facility.name}</h3>
                              <Badge variant="outline" className="text-xs">{facility.type}</Badge>
                              {getDeployedBadge(facility.healthflowDeployed, facility.healthflowVersion)}
                              {getAccreditationBadge(facility.accreditation)}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{getZoneLabel(facility.zoneCode)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Bed className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{facility.currentOccupancy}/{facility.capacity} lits ({occupancyRate}%)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {getConnectivityIcon(facility.connectivity)}
                                <span>{CONNECTIVITY_LABELS[facility.connectivity]}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className={getUptimeColor(facility.uptime24h)}>{facility.uptime24h > 0 ? `${facility.uptime24h}%` : 'N/A'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>Directeur: {facility.director}</span>
                              <Separator orientation="vertical" className="h-3" />
                              <Phone className="h-3 w-3" />
                              <span>{facility.phone}</span>
                            </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedFacility(facility)}>
                                <Eye className="h-3 w-3 mr-1" />Détails
                              </Button>
                            </DialogTrigger>
                            {selectedFacility?.id === facility.id && <FacilityDetailDialog facility={facility} />}
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── Vue d'ensemble ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Établissements', value: DEMO_FACILITIES.length, icon: Building2, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950' },
              { label: 'Lits disponibles', value: `${totalOccupancy}/${totalBeds}`, icon: Bed, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
              { label: 'HealthFlow déployé', value: `${deployedCount}/${DEMO_FACILITIES.length}`, icon: Server, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
              { label: 'Uptime moyen', value: `${Math.round(avgUptime * 10) / 10}%`, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: 'easeOut' }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                      <div>
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-teal-600" />
                Répartition par type d&apos;établissement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(FACILITY_TYPE_LABELS).map(([type, label]) => {
                  const count = DEMO_FACILITIES.filter((f) => f.type === type).length
                  if (count === 0) return null
                  const pct = Math.round((count / DEMO_FACILITIES.length) * 100)
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-48 truncate">{label}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
                      </div>
                      <span className="text-sm font-medium w-20 text-right">{count} ({pct}%)</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-blue-600" />
                Statut de déploiement par zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {GUINEA_HEALTH_ZONES_FULL.map((zone) => {
                  const zoneFacilities = DEMO_FACILITIES.filter((f) => f.zoneCode === zone.code)
                  const deployed = zoneFacilities.filter((f) => f.healthflowDeployed).length
                  const total = zoneFacilities.length
                  const pct = total > 0 ? Math.round((deployed / total) * 100) : 0
                  return (
                    <div key={zone.code} className="flex items-center gap-3 p-2 rounded-lg border">
                      <MapPin className="h-4 w-4 text-teal-600 flex-shrink-0" />
                      <span className="text-sm font-medium w-28">{zone.name}</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-teal-500' : 'bg-gray-300'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm w-24 text-right">{deployed}/{total} déployés</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
