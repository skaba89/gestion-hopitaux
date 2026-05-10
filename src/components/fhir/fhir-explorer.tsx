'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  getCapabilityStatement,
  patientToFHIR,
  buildPatientBundle,
  validateFHIRResource,
  demoFHIRPatients,
  demoFHIROrganizations,
  demoFHIRPractitioners,
  type FHIRResource,
  type FHIRCapabilityStatement,
  type FHIROperationOutcome,
  GUINEA_FHIR_SYSTEMS,
  GUINEA_HEALTH_ZONES,
  GUINEA_ESTABLISHMENTS,
} from '@/lib/fhir'
import { useDataStore } from '@/lib/data-store'
import {
  Search, FileJson, ArrowRightLeft, CheckCircle2, AlertTriangle,
  XCircle, Copy, Check, Code2, Shield, Activity, Database,
  MapPin, Building2, Stethoscope, Download, Globe, User,
  ChevronRight, Hospital,
} from 'lucide-react'

export function FHIRExplorer() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResource, setSelectedResource] = useState<FHIRResource | null>(null)
  const [capability, setCapability] = useState<FHIRCapabilityStatement | null>(null)
  const [jsonView, setJsonView] = useState('')
  const [copied, setCopied] = useState(false)
  const [validationResult, setValidationResult] = useState<FHIROperationOutcome | null>(null)
  const patients = useDataStore((s) => s.patients)

  useEffect(() => {
    setCapability(getCapabilityStatement())
  }, [])

  const fhirPatients = patients.map(patientToFHIR)

  const filteredPatients = searchQuery
    ? fhirPatients.filter((p) => {
        const name = p.name?.[0]
        return (
          name?.family?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          name?.given?.[0]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    : fhirPatients

  const handleCopyJson = (data: object) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleValidate = (resource: FHIRResource) => {
    const result = validateFHIRResource(resource)
    setValidationResult(result)
  }

  const handleExportBundle = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId)
    if (!patient) return
    const consultations = useDataStore.getState().consultations.filter((c) => c.patientId === patientId)
    const labRequests = useDataStore.getState().labRequests.filter((l) => l.patientId === patientId)
    const bundle = buildPatientBundle(patient, consultations[0], labRequests[0])
    setJsonView(JSON.stringify(bundle, null, 2))
    setSelectedResource(bundle)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileJson className="h-6 w-6 text-blue-600" />
            FHIR R4 Explorer
          </h2>
          <p className="text-muted-foreground mt-1">
            Serveur FHIR R4 — Interopérabilité HL7 pour la Guinée
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" /> FHIR R4 Actif
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="h-3 w-3 mr-1" /> SMART-on-FHIR
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="export">Export FHIR</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Ressources FHIR', value: '7', icon: Database, color: 'text-blue-600' },
              { label: 'Patients FHIR', value: String(fhirPatients.length), icon: User, color: 'text-green-600' },
              { label: 'Organisations', value: String(demoFHIROrganizations.length), icon: Building2, color: 'text-purple-600' },
              { label: 'Praticiens', value: String(demoFHIRPractitioners.length), icon: Stethoscope, color: 'text-orange-600' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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

          {capability && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  CapabilityStatement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">FHIR Version</p>
                    <p className="text-lg font-semibold">{capability.fhirVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className="bg-green-100 text-green-700">{capability.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Formats</p>
                    <div className="flex gap-1 mt-1">
                      {capability.format.map((f) => (
                        <Badge key={f} variant="outline" className="text-xs">{f.includes('json') ? 'JSON' : 'XML'}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <p className="text-sm font-medium mb-3">Ressources supportées</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {capability.rest?.[0]?.resource?.map((r) => (
                      <div key={r.type} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">{r.type}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {r.interaction.length} ops
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <p className="text-sm font-medium mb-3">Zones sanitaires de Guinée</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {GUINEA_HEALTH_ZONES.map((zone) => (
                      <div key={zone.code} className="flex items-center gap-2 p-2 rounded-lg border">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        <span className="text-sm">{zone.display}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="h-5 w-5" />
                Établissements enregistrés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {GUINEA_ESTABLISHMENTS.map((est) => (
                  <div key={est.code} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${est.type === 'CHU' ? 'bg-red-500' : est.type === 'Régional' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{est.display}</p>
                        <p className="text-xs text-muted-foreground">Zone: {est.zone} | Code: {est.code}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{est.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4 mt-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un patient FHIR..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Badge variant="outline">{filteredPatients.length} patients FHIR</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                  {filteredPatients.map((patient, i) => {
                    const name = patient.name?.[0]
                    return (
                      <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${selectedResource?.id === patient.id ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => {
                            setSelectedResource(patient)
                            setJsonView(JSON.stringify(patient, null, 2))
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${patient.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                                {name?.given?.[0]?.[0]}{name?.family?.[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {name?.given?.join(' ')} {name?.family}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {patient.id} | {patient.gender === 'female' ? 'F' : 'M'}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>

            <div className="lg:col-span-2">
              {selectedResource ? (
                <Card className="h-[500px] flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code2 className="h-5 w-5" />
                        {selectedResource.resourceType}/{selectedResource.id}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleValidate(selectedResource)}>
                          <Shield className="h-3 w-3 mr-1" /> Valider
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCopyJson(selectedResource)}>
                          {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {copied ? 'Copié' : 'Copier'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <pre className="text-xs bg-slate-950 text-green-400 p-4 rounded-lg font-mono whitespace-pre-wrap">
                        {jsonView}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[500px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <FileJson className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Sélectionnez un patient pour voir sa ressource FHIR</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  Organizations ({demoFHIROrganizations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demoFHIROrganizations.map((org) => (
                    <div key={org.id} className="p-2 rounded border text-sm">
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {org.id} | Type: {org.type?.[0]?.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-orange-600" />
                  Practitioners ({demoFHIRPractitioners.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demoFHIRPractitioners.map((p) => {
                    const name = p.name?.[0]
                    return (
                      <div key={p.id} className="p-2 rounded border text-sm">
                        <p className="font-medium">{name?.prefix?.[0]} {name?.given?.join(' ')} {name?.family}</p>
                        <p className="text-xs text-muted-foreground">{p.qualification?.[0]?.code?.text}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  Systèmes Guinée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(GUINEA_FHIR_SYSTEMS).map(([key, system]) => (
                    <div key={key} className="p-2 rounded border text-xs">
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-muted-foreground truncate">{system}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Validateur de Ressources FHIR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ressources à valider</p>
                  {fhirPatients.slice(0, 5).map((patient) => {
                    const name = patient.name?.[0]
                    return (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-muted/50"
                        onClick={() => handleValidate(patient)}
                      >
                        <span className="text-sm">Patient: {name?.given?.[0]} {name?.family}</span>
                        <Button size="sm" variant="outline">
                          <Shield className="h-3 w-3 mr-1" /> Valider
                        </Button>
                      </div>
                    )
                  })}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Résultat de validation</p>
                  {validationResult ? (
                    <div className="space-y-2">
                      {validationResult.issue.map((issue, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border ${
                            issue.severity === 'fatal'
                              ? 'bg-red-50 border-red-200'
                              : issue.severity === 'error'
                              ? 'bg-orange-50 border-orange-200'
                              : issue.severity === 'warning'
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {issue.severity === 'information' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : issue.severity === 'fatal' || issue.severity === 'error' ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            )}
                            <span className="text-sm font-medium capitalize">{issue.severity}</span>
                            <Badge variant="outline" className="text-xs">{issue.code}</Badge>
                          </div>
                          <p className="text-sm mt-1">{issue.details?.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-lg border-2 border-dashed text-center text-muted-foreground">
                      <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Cliquez sur &quot;Valider&quot; pour vérifier une ressource</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Export FHIR Bundle (CDA Document)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Exportez un dossier patient complet au format FHIR Bundle pour l&apos;échange inter-établissements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Patients disponibles</p>
                  {patients.slice(0, 6).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 rounded border hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-muted-foreground">{patient.id} | {patient.reason}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleExportBundle(patient.id)}>
                        <Download className="h-3 w-3 mr-1" /> Export
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Bundle FHIR généré</p>
                  {jsonView ? (
                    <Card className="h-[400px]">
                      <CardContent className="p-0 h-full relative">
                        <Button size="sm" variant="outline" className="absolute top-2 right-2 z-10" onClick={() => handleCopyJson(JSON.parse(jsonView))}>
                          {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        </Button>
                        <ScrollArea className="h-full">
                          <pre className="text-xs bg-slate-950 text-green-400 p-4 font-mono whitespace-pre-wrap">
                            {jsonView}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="p-8 rounded-lg border-2 border-dashed text-center text-muted-foreground h-[400px] flex flex-col items-center justify-center">
                      <FileJson className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Sélectionnez un patient pour générer un Bundle FHIR</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
