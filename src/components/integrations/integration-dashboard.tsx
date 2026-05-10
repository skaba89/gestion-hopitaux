'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  INTEGRATION_STATUSES,
  demoSNISReports,
  demoMTracAlerts,
  demoSANTEPCards,
  demoNationalRegistry,
  demoSyncOperations,
  SNIS_INDICATORS,
  type IntegrationStatus,
  type MTracAlert,
  type SNISReport,
  type SANTEPCard,
  type SyncOperation,
} from '@/lib/national-integrations'
import {
  hieService,
  type HIEConnection,
  type HIEExchange,
  type InterFacilityReferral,
  type PatientConsent,
  type CrossFacilityPatient,
} from '@/lib/hie'
import {
  Globe, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  ArrowRightLeft, Clock, ArrowUpRight, ArrowDownLeft, Send,
  Activity, Database, Wifi, WifiOff, Shield, FileText,
  Building2, MapPin, CreditCard, Bell, TrendingUp, TrendingDown,
  Minus, Play, Pause, Search, Eye, Heart, Zap,
} from 'lucide-react'

export function IntegrationDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const metrics = hieService.getHIEMetrics()
  const connections = hieService.getConnections()
  const exchanges = hieService.getExchanges()
  const referrals = hieService.getReferrals()
  const consents = hieService.getConsents()

  const statusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'disconnected': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <WifiOff className="h-4 w-4 text-gray-400" />
    }
  }

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      connected: 'bg-green-100 text-green-700 border-green-200',
      syncing: 'bg-blue-100 text-blue-700 border-blue-200',
      degraded: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      disconnected: 'bg-red-100 text-red-700 border-red-200',
      error: 'bg-red-100 text-red-700 border-red-200',
      maintenance: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    const labels: Record<string, string> = {
      connected: 'Connecté',
      syncing: 'Synchronisation',
      degraded: 'Dégradé',
      disconnected: 'Déconnecté',
      error: 'Erreur',
      maintenance: 'Maintenance',
    }
    return (
      <Badge variant="outline" className={variants[status] || ''}>
        {labels[status] || status}
      </Badge>
    )
  }

  const trendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />
      default: return <Minus className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" />
            Intégrations &amp; Interopérabilité
          </h2>
          <p className="text-muted-foreground mt-1">
            Centre de commande des échanges de données de santé — Guinée
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Wifi className="h-3 w-3 mr-1" /> {metrics.activeConnections}/{metrics.totalConnections} connectés
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <ArrowRightLeft className="h-3 w-3 mr-1" /> {metrics.totalExchanges} échanges
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="connections">Connexions</TabsTrigger>
          <TabsTrigger value="hie">HIE</TabsTrigger>
          <TabsTrigger value="national">Systèmes Nationaux</TabsTrigger>
          <TabsTrigger value="referrals">Référencements</TabsTrigger>
          <TabsTrigger value="sync">Synchronisation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Échanges réussis', value: metrics.successfulExchanges, icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
              { label: 'Taux de succès', value: `${metrics.successRate}%`, icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50' },
              { label: 'Connexions actives', value: `${metrics.activeConnections}/${metrics.totalConnections}`, icon: Wifi, color: 'text-green-600', bgColor: 'bg-green-50' },
              { label: 'Uptime moyen', value: `${metrics.connectionUptime}%`, icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-50' },
              { label: 'Consentements actifs', value: metrics.activeConsents, icon: Shield, color: 'text-orange-600', bgColor: 'bg-orange-50' },
              { label: 'Latence moyenne', value: `${metrics.averageLatency}ms`, icon: Zap, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center mb-2`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Integration Status Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Statut des intégrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INTEGRATION_STATUSES.map((integ, i) => (
                  <motion.div
                    key={integ.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{integ.icon}</span>
                            <div>
                              <p className="text-sm font-semibold">{integ.name}</p>
                              <p className="text-xs text-muted-foreground">v{integ.version}</p>
                            </div>
                          </div>
                          {statusIcon(integ.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Enregistrements</p>
                            <p className="font-semibold">{integ.recordsSynced.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">En attente</p>
                            <p className="font-semibold">{integ.recordsPending}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Dernière sync</p>
                            <p className="font-medium">
                              {integ.lastSync ? new Date(integ.lastSync).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Intervalle</p>
                            <p className="font-medium">{integ.syncInterval}</p>
                          </div>
                        </div>

                        {integ.lastError && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                            {integ.lastError}
                          </div>
                        )}

                        <div className="mt-3">
                          {statusBadge(integ.status)}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Exchanges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Derniers échanges HIE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exchanges.slice(0, 5).map((exch) => (
                  <div key={exch.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${exch.direction === 'sent' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {exch.direction === 'sent' ? <ArrowUpRight className="h-4 w-4 text-blue-600" /> : <ArrowDownLeft className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{exch.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {exch.resourceType} | {exch.senderOrganization} → {exch.receiverOrganization}
                      </p>
                    </div>
                    <div className="text-right">
                      {statusBadge(exch.status === 'acknowledged' ? 'connected' : exch.status === 'delivered' ? 'connected' : exch.status === 'failed' ? 'error' : 'syncing')}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(exch.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {connections.map((conn) => (
              <Card key={conn.organizationId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {conn.organizationName}
                    </CardTitle>
                    {statusIcon(conn.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Endpoint</p>
                      <p className="text-xs font-mono truncate">{conn.endpoint}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Auth</p>
                      <Badge variant="outline" className="text-xs">{conn.authMethod}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Latence</p>
                      <p className={`font-medium ${conn.latencyMs > 200 ? 'text-yellow-600' : conn.latencyMs > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {conn.latencyMs > 0 ? `${conn.latencyMs}ms` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Uptime</p>
                      <p className={`font-medium ${conn.uptime > 95 ? 'text-green-600' : conn.uptime > 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {conn.uptime}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Échanges</p>
                      <p className="font-medium">{conn.totalExchanges}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Échoués</p>
                      <p className={`font-medium ${conn.failedExchanges > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {conn.failedExchanges}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ressources supportées</p>
                    <div className="flex flex-wrap gap-1">
                      {conn.supportedResources.map((r) => (
                        <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">
                      Dernier ping: {new Date(conn.lastPing).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* HIE Tab */}
        <TabsContent value="hie" className="space-y-4 mt-4">
          {/* Exchanges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Journal des échanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {exchanges.map((exch) => (
                    <div key={exch.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {exch.direction === 'sent' ? (
                            <ArrowUpRight className="h-4 w-4 text-blue-500" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm font-medium">{exch.id}</span>
                          <Badge variant="outline" className="text-xs">{exch.resourceType}</Badge>
                        </div>
                        {statusBadge(exch.status === 'acknowledged' ? 'connected' : exch.status === 'delivered' ? 'connected' : exch.status === 'failed' ? 'error' : exch.status === 'pending' ? 'syncing' : 'degraded')}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Patient: {exch.patientName} ({exch.patientId})</p>
                        <p>De: {exch.senderOrganization} → Vers: {exch.receiverOrganization}</p>
                        <p>Envoyé: {new Date(exch.sentAt).toLocaleString('fr-FR')}</p>
                        {exch.consentId && <p className="text-green-600">Consentement: {exch.consentId}</p>}
                        {exch.errorMessage && <p className="text-red-600">Erreur: {exch.errorMessage}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Consents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Consentements patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consents.map((consent) => (
                  <div key={consent.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">{consent.patientName}</p>
                        <p className="text-xs text-muted-foreground">{consent.patientId}</p>
                      </div>
                      <Badge className={consent.consentStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {consent.consentStatus === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {consent.dataTypes.map((dt) => (
                        <Badge key={dt} variant="outline" className="text-xs">{dt}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Organisations autorisées: {consent.authorizedOrganizations.length}
                      {consent.expiresAt && ` | Expire: ${new Date(consent.expiresAt).toLocaleDateString('fr-FR')}`}
                    </p>
                    {consent.conditions.length > 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        Condition: {consent.conditions.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* National Systems Tab */}
        <TabsContent value="national" className="space-y-4 mt-4">
          {/* SNIS Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Rapport SNIS — {demoSNISReports[0]?.facilityName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoSNISReports[0]?.indicators.map((ind) => (
                  <div key={ind.code} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{ind.name}</p>
                      {trendIcon(ind.trend)}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{ind.value}</span>
                      <span className="text-xs text-muted-foreground">{ind.unit}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        Cible: {ind.target}{ind.unit}
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (ind.value / ind.target) >= 0.9
                            ? 'bg-green-500'
                            : (ind.value / ind.target) >= 0.7
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((ind.value / ind.target) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Précédent: {ind.previousValue} {ind.unit}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* mTrac Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertes mTrac
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demoMTracAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.alertLevel === 'critical'
                        ? 'border-red-200 bg-red-50'
                        : alert.alertLevel === 'warning'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          alert.alertLevel === 'critical' ? 'bg-red-600 text-white' :
                          alert.alertLevel === 'warning' ? 'bg-yellow-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {alert.alertLevel === 'critical' ? 'CRITIQUE' : alert.alertLevel === 'warning' ? 'ALERTE' : 'INFO'}
                        </Badge>
                        <span className="text-sm font-bold">{alert.disease}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {alert.responseStatus === 'resolved' ? 'Résolu' :
                         alert.responseStatus === 'responding' ? 'En cours' :
                         alert.responseStatus === 'investigating' ? 'Investigation' : 'En attente'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />{alert.location} |
                      Cas: {alert.caseCount} | Décès: {alert.deathCount} |
                      Signalé par: {alert.reportedBy}
                    </p>
                    {alert.responseActions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {alert.responseActions.map((action, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{action}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SANTEP Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cartes SANTEP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoSANTEPCards.map((card) => (
                  <div key={card.id} className="p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-blue-600 font-semibold">SANTEP</p>
                        <p className="text-xs text-muted-foreground">{card.cardNumber}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        SN
                      </div>
                    </div>
                    <p className="text-sm font-bold">{card.patientName}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <p>Né(e): {card.dateOfBirth}</p>
                      <p>Groupe: {card.bloodType}</p>
                      <p className="col-span-2">Allergies: {card.allergies.join(', ') || 'Aucune'}</p>
                      <p>Urgence: {card.emergencyContact}</p>
                      <p>Tel: {card.emergencyPhone}</p>
                    </div>
                    {card.insuranceProvider && (
                      <div className="mt-2 text-xs">
                        <Badge variant="outline" className="bg-white">{card.insuranceProvider}</Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        NFC: {card.nfcEnabled ? '✓' : '✗'}
                      </span>
                      <Badge className={card.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {card.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* National Patient Registry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Registre National des Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {demoNationalRegistry.map((record) => (
                    <div key={record.nationalId} className="p-3 rounded-lg border hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{record.firstName} {record.lastName}</p>
                          <p className="text-xs text-muted-foreground">
                            ID National: {record.nationalId} | Zone: {record.healthZone}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={record.insuranceStatus === 'insured' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {record.insuranceStatus === 'insured' ? 'Assuré' : 'Non assuré'}
                          </Badge>
                          <Badge className={record.vaccinationStatus === 'complete' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}>
                            {record.vaccinationStatus === 'complete' ? 'Vacciné' : 'Partiel'}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>Visites: {record.totalVisits} | Dernier: {record.lastFacility} | Problèmes actifs: {record.activeProblems.length}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">{metrics.pendingReferrals}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{metrics.activeReferrals}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{metrics.totalReferrals}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {referrals.map((ref) => (
              <Card key={ref.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-base font-bold">{ref.patientName}</p>
                      <p className="text-sm text-muted-foreground">{ref.specialty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        ref.urgency === 'emergency' ? 'bg-red-600 text-white' :
                        ref.urgency === 'urgent' ? 'bg-orange-600 text-white' :
                        'bg-blue-100 text-blue-700'
                      }>
                        {ref.urgency === 'emergency' ? 'URGENCE' : ref.urgency === 'urgent' ? 'Urgent' : 'Routine'}
                      </Badge>
                      <Badge className={
                        ref.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        ref.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        ref.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {ref.status === 'accepted' ? 'Accepté' : ref.status === 'pending' ? 'En attente' : ref.status === 'in-progress' ? 'En cours' : ref.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">De</p>
                      <p className="font-medium">{ref.referringOrganizationName}</p>
                      <p className="text-xs">{ref.referringDoctor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vers</p>
                      <p className="font-medium">{ref.receivingOrganizationName}</p>
                      <p className="text-xs">{ref.receivingDoctor || 'En attente d\'affectation'}</p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Motif</p>
                    <p className="text-sm">{ref.reason}</p>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Résumé clinique</p>
                    <p className="text-sm text-muted-foreground">{ref.clinicalSummary}</p>
                  </div>

                  {ref.attachedDocuments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ref.attachedDocuments.map((doc, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />{doc}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Créé: {new Date(ref.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span>Consentement: {ref.consentId}</span>
                    {ref.transportNeeded && <Badge variant="outline" className="text-xs">Transport nécessaire</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sync Tab */}
        <TabsContent value="sync" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Opérations de synchronisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demoSyncOperations.map((sync) => (
                  <div key={sync.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      sync.status === 'completed' ? 'bg-green-100' :
                      sync.status === 'in-progress' ? 'bg-blue-100' :
                      sync.status === 'failed' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {sync.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                       sync.status === 'in-progress' ? <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" /> :
                       sync.status === 'failed' ? <XCircle className="h-4 w-4 text-red-600" /> :
                       <Clock className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{sync.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {sync.type === 'push' ? '↑ Envoi' : '↓ Réception'} | {sync.recordCount} enregistrements |
                        {sync.startedAt && ` Début: ${new Date(sync.startedAt).toLocaleTimeString('fr-FR')}`}
                      </p>
                      {sync.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">{sync.errorMessage}</p>
                      )}
                    </div>
                    <Badge className={
                      sync.status === 'completed' ? 'bg-green-100 text-green-700' :
                      sync.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      sync.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {sync.status === 'completed' ? 'Terminé' :
                       sync.status === 'in-progress' ? 'En cours' :
                       sync.status === 'failed' ? 'Échoué' : 'En attente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sync Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Planification des synchronisations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {INTEGRATION_STATUSES.map((integ) => (
                  <div key={integ.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{integ.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{integ.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Prochaine sync: {integ.nextSync ? new Date(integ.nextSync).toLocaleTimeString('fr-FR') : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">{integ.syncInterval}</Badge>
                      {statusIcon(integ.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
