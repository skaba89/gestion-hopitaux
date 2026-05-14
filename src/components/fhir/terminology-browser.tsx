'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { motion } from 'framer-motion'
import {
  Search,
  BookOpen,
  Code2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Database,
  Globe,
  Shield,
  Tag,
} from 'lucide-react'
import {
  terminologyService,
  CODE_SYSTEMS,
  GUINEA_DISEASES,
  GUINEA_LOINC_CODES,
  GUINEA_ATC_CODES,
  GUINEA_VALUE_SETS,
  type ConceptDefinition,
} from '@/lib/terminology-service'

/* ─────────── Badge Color Helpers ─────────── */

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'critical':
      return (
        <Badge className="bg-red-600 text-white border-red-600 hover:bg-red-700">
          Critique
        </Badge>
      )
    case 'high':
      return (
        <Badge className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600">
          Elevee
        </Badge>
      )
    case 'medium':
      return (
        <Badge className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600">
          Moyenne
        </Badge>
      )
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

function getPropertyBadge(key: string, value: string) {
  switch (key) {
    case 'priority':
      return getPriorityBadge(value)
    case 'endemic':
      return value === 'true' ? (
        <Badge className="bg-green-600 text-white border-green-600 hover:bg-green-700">
          Endemique
        </Badge>
      ) : null
    case 'notifiable':
      return value === 'true' ? (
        <Badge className="bg-red-600 text-white border-red-600 hover:bg-red-700">
          Notifiable
        </Badge>
      ) : null
    case 'mTrac':
      return value === 'true' ? (
        <Badge className="bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600">
          mTrac
        </Badge>
      ) : null
    case 'vaccinePreventable':
      return value === 'true' ? (
        <Badge className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700">
          Preventable par vaccin
        </Badge>
      ) : null
    case 'ncd':
      return value === 'true' ? (
        <Badge variant="outline" className="border-amber-500 text-amber-600">
          MNT
        </Badge>
      ) : null
    case 'childHealth':
      return value === 'true' ? (
        <Badge variant="outline" className="border-pink-500 text-pink-600">
          Sante infantile
        </Badge>
      ) : null
    case 'maternalHealth':
      return value === 'true' ? (
        <Badge variant="outline" className="border-rose-500 text-rose-600">
          Sante maternelle
        </Badge>
      ) : null
    case 'neonatal':
      return value === 'true' ? (
        <Badge variant="outline" className="border-fuchsia-500 text-fuchsia-600">
          Neonatal
        </Badge>
      ) : null
    case 'emergency':
      return value === 'true' ? (
        <Badge className="bg-red-700 text-white border-red-700 hover:bg-red-800">
          Urgence
        </Badge>
      ) : null
    case 'essential':
      return value === 'true' ? (
        <Badge className="bg-green-600 text-white border-green-600 hover:bg-green-700">
          Essentiel
        </Badge>
      ) : null
    case 'guineaFormulary':
      return value === 'true' ? (
        <Badge className="bg-teal-600 text-white border-teal-600 hover:bg-teal-700">
          Formulaire GN
        </Badge>
      ) : null
    case 'hivProgram':
      return value === 'true' ? (
        <Badge variant="outline" className="border-red-400 text-red-500">
          Programme VIH
        </Badge>
      ) : null
    case 'tbProgram':
      return value === 'true' ? (
        <Badge variant="outline" className="border-blue-400 text-blue-500">
          Programme TB
        </Badge>
      ) : null
    case 'mandatory':
      return value === 'true' ? (
        <Badge className="bg-red-600 text-white border-red-600 hover:bg-red-700">
          Obligatoire
        </Badge>
      ) : null
    case 'category':
      return (
        <Badge variant="secondary" className="text-xs">
          {value}
        </Badge>
      )
    case 'frequency':
      return (
        <Badge variant="outline" className="text-xs">
          {value === 'very-high'
            ? 'Tres frequent'
            : value === 'high'
              ? 'Frequent'
              : value === 'medium'
                ? 'Moyen'
                : value}
        </Badge>
      )
    default:
      return null
  }
}

/* ─────────── Code System Icon ─────────── */

function getCodeSystemIcon(id: string) {
  switch (id) {
    case 'icd10':
      return <BookOpen className="size-5 text-red-500" />
    case 'loinc':
      return <Database className="size-5 text-blue-500" />
    case 'snomed':
      return <Globe className="size-5 text-emerald-500" />
    case 'atc':
      return <Shield className="size-5 text-amber-500" />
    default:
      return <Tag className="size-5 text-purple-500" />
  }
}

/* ─────────── Animation Variants ─────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' as const },
  }),
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.2, ease: 'easeOut' as const },
  }),
}

/* ─────────── Code Systems Tab ─────────── */

function CodeSystemsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CODE_SYSTEMS.map((cs, i) => (
        <motion.div
          key={cs.id}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {getCodeSystemIcon(cs.id)}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">{cs.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    v{cs.version}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {cs.language === 'fr' ? 'Francais' : 'Anglais'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {cs.description}
              </p>
              <Separator className="mb-3" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Code2 className="size-3.5" />
                  <span>
                    {cs.totalCodes.toLocaleString('fr-FR')} codes
                  </span>
                </div>
                <span>Mis a jour: {cs.lastUpdated}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

/* ─────────── Search Tab ─────────── */

function SearchTab() {
  const [query, setQuery] = useState('')
  const [systemFilter, setSystemFilter] = useState('all')

  const results = useMemo(() => {
    if (!query.trim()) return []
    return terminologyService.search(
      systemFilter === 'all' ? 'default' : systemFilter,
      query,
      50
    )
  }, [query, systemFilter])

  const allConcepts = useMemo(() => {
    if (systemFilter === 'all') {
      return [...GUINEA_DISEASES, ...GUINEA_LOINC_CODES, ...GUINEA_ATC_CODES]
    }
    switch (systemFilter) {
      case 'icd10':
      case 'guinea-diseases':
        return GUINEA_DISEASES
      case 'loinc':
        return GUINEA_LOINC_CODES
      case 'atc':
        return GUINEA_ATC_CODES
      default:
        return [...GUINEA_DISEASES, ...GUINEA_LOINC_CODES, ...GUINEA_ATC_CODES]
    }
  }, [systemFilter])

  const filteredResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allConcepts
      .filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.display.toLowerCase().includes(q) ||
          c.displayFr.toLowerCase().includes(q) ||
          c.definition.toLowerCase().includes(q)
      )
      .slice(0, 50)
  }, [query, allConcepts])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un code, un terme, une definition..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={systemFilter} onValueChange={setSystemFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Systeme de codes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les systemes</SelectItem>
            <SelectItem value="icd10">ICD-10</SelectItem>
            <SelectItem value="loinc">LOINC</SelectItem>
            <SelectItem value="atc">ATC</SelectItem>
            <SelectItem value="guinea-diseases">Maladies Guinee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {query.trim() && (
        <div className="text-sm text-muted-foreground">
          {filteredResults.length} resultat{filteredResults.length !== 1 ? 's' : ''} trouve{filteredResults.length !== 1 ? 's' : ''}
        </div>
      )}

      <ScrollArea className="h-[520px]">
        <div className="space-y-3">
          {filteredResults.map((concept, i) => (
            <motion.div
              key={concept.code}
              custom={i}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="font-mono text-xs shrink-0 mt-0.5">
                        {concept.code}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {concept.displayFr}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {concept.display}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-0">
                      {concept.definition}
                    </p>
                    {concept.parent && (
                      <p className="text-xs text-muted-foreground">
                        Parent: <span className="font-mono">{concept.parent}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.entries(concept.properties).map(([key, value]) => {
                        const badge = getPropertyBadge(key, value)
                        return badge ? <span key={key}>{badge}</span> : null
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {query.trim() && filteredResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <XCircle className="size-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">
                Aucun resultat trouve
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Essayez un autre terme de recherche ou modifiez le filtre de systeme
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

/* ─────────── Guinea Diseases Tab ─────────── */

function GuineaDiseasesTab() {
  return (
    <ScrollArea className="h-[580px]">
      <div className="space-y-2">
        {GUINEA_DISEASES.map((disease, i) => (
          <motion.div
            key={disease.code}
            custom={i}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="font-mono text-xs shrink-0 mt-0.5">
                      {disease.code}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {disease.displayFr}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {disease.definition}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.entries(disease.properties).map(([key, value]) => {
                      const badge = getPropertyBadge(key, value)
                      return badge ? <span key={key}>{badge}</span> : null
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  )
}

/* ─────────── Value Sets Tab ─────────── */

function ValueSetsTab() {
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedSets((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-600 text-white border-green-600 hover:bg-green-700">
            Actif
          </Badge>
        )
      case 'draft':
        return (
          <Badge className="bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600">
            Brouillon
          </Badge>
        )
      case 'retired':
        return (
          <Badge variant="secondary">Retire</Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <ScrollArea className="h-[580px]">
      <div className="space-y-3">
        {GUINEA_VALUE_SETS.map((vs, i) => {
          const isExpanded = expandedSets.has(vs.id)
          return (
            <motion.div
              key={vs.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleExpanded(vs.id)}
              >
                <Card className="hover:shadow-sm transition-shadow">
                  <CollapsibleTrigger asChild>
                    <button className="w-full text-left">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="size-4 text-muted-foreground" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm truncate">
                              {vs.name}
                            </CardTitle>
                          </div>
                          {getStatusBadge(vs.status)}
                          <Badge variant="outline" className="text-xs shrink-0">
                            {vs.concepts.length} concepts
                          </Badge>
                        </div>
                      </CardHeader>
                    </button>
                  </CollapsibleTrigger>
                  <CardContent className="pt-0 pb-4 px-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {vs.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70 font-mono mb-2">
                      {vs.url}
                    </p>
                    <CollapsibleContent>
                      <Separator className="my-3" />
                      <div className="space-y-2">
                        {vs.concepts.map((concept) => (
                          <div
                            key={concept.code}
                            className="flex items-center gap-3 py-1.5 px-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Badge variant="outline" className="font-mono text-xs shrink-0">
                              {concept.code}
                            </Badge>
                            <span className="text-sm font-medium">
                              {concept.displayFr}
                            </span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              ({concept.display})
                            </span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            </motion.div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

/* ─────────── Main Component ─────────── */

export function TerminologyBrowser() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
            <BookOpen className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">
              Navigateur de Terminologie
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Systemes de codes, concepts et jeux de valeurs pour la Guinee
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="code-systems" className="w-full">
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="code-systems" className="gap-1.5">
              <Database className="size-3.5" />
              <span className="hidden sm:inline">Systemes de codes</span>
              <span className="sm:hidden">Codes</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-1.5">
              <Search className="size-3.5" />
              Recherche
            </TabsTrigger>
            <TabsTrigger value="guinea-diseases" className="gap-1.5">
              <Shield className="size-3.5" />
              <span className="hidden sm:inline">Maladies Guinee</span>
              <span className="sm:hidden">Maladies</span>
            </TabsTrigger>
            <TabsTrigger value="value-sets" className="gap-1.5">
              <Tag className="size-3.5" />
              <span className="hidden sm:inline">Jeux de valeurs</span>
              <span className="sm:hidden">Values</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code-systems">
            <CodeSystemsTab />
          </TabsContent>

          <TabsContent value="search">
            <SearchTab />
          </TabsContent>

          <TabsContent value="guinea-diseases">
            <GuineaDiseasesTab />
          </TabsContent>

          <TabsContent value="value-sets">
            <ValueSetsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
