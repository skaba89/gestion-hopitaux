'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  Bell,
  Zap,
  Webhook,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Settings,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Server,
  Code2,
  Shield,
} from 'lucide-react'
import {
  subscriptionService,
  type FHIRSubscription,
  type SubscriptionEvent,
  type WebhookConfig,
} from '@/lib/fhir-subscriptions'

/* ─────────── Helpers ─────────── */

function formatDate(iso: string | null): string {
  if (!iso) return '--'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'Jamais'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'A l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Il y a ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `Il y a ${days}j`
}

/* ─────────── Badge helpers ─────────── */

function ChannelBadge({ channel }: { channel: FHIRSubscription['channel'] }) {
  const map: Record<string, string> = {
    'rest-hook': 'bg-blue-100 text-blue-700 border-blue-200',
    sms: 'bg-green-100 text-green-700 border-green-200',
    websocket: 'bg-purple-100 text-purple-700 border-purple-200',
    email: 'bg-orange-100 text-orange-700 border-orange-200',
    message: 'bg-teal-100 text-teal-700 border-teal-200',
  }
  return (
    <Badge variant="outline" className={`text-xs ${map[channel] ?? ''}`}>
      {channel}
    </Badge>
  )
}

function EventTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    create: 'bg-green-100 text-green-700 border-green-200',
    update: 'bg-blue-100 text-blue-700 border-blue-200',
    delete: 'bg-red-100 text-red-700 border-red-200',
    transition: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  const labels: Record<string, string> = {
    create: 'Cration',
    update: 'Mise a jour',
    delete: 'Suppression',
    transition: 'Transition',
  }
  return (
    <Badge variant="outline" className={`text-xs ${map[type] ?? ''}`}>
      {labels[type] ?? type}
    </Badge>
  )
}

function SubscriptionStatusBadge({ status }: { status: FHIRSubscription['status'] }) {
  if (status === 'active') {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs flex items-center gap-1.5">
        <motion.span
          className="w-2 h-2 rounded-full bg-green-500 inline-block"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
        Actif
      </Badge>
    )
  }
  if (status === 'error') {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Erreur</Badge>
    )
  }
  return (
    <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Inactif</Badge>
  )
}

function DeliveryStatusBadge({ status }: { status: SubscriptionEvent['status'] }) {
  const map: Record<string, { cls: string; label: string }> = {
    delivered: { cls: 'bg-green-100 text-green-700 border-green-200', label: 'Delivre' },
    failed: { cls: 'bg-red-100 text-red-700 border-red-200', label: 'Echoue' },
    retrying: { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Nouvel essai' },
    pending: { cls: 'bg-gray-100 text-gray-600 border-gray-200', label: 'En attente' },
  }
  const entry = map[status] ?? { cls: '', label: status }
  return (
    <Badge variant="outline" className={`text-xs ${entry.cls}`}>
      {entry.label}
    </Badge>
  )
}

function PingStatusBadge({ status }: { status: WebhookConfig['pingStatus'] }) {
  const map: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
    success: {
      cls: 'bg-green-100 text-green-700 border-green-200',
      label: 'Succes',
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
    },
    failure: {
      cls: 'bg-red-100 text-red-700 border-red-200',
      label: 'Echec',
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
    never: {
      cls: 'bg-gray-100 text-gray-600 border-gray-200',
      label: 'Jamais',
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
  }
  const entry = map[status] ?? { cls: '', label: status, icon: null }
  return (
    <Badge variant="outline" className={`text-xs flex items-center ${entry.cls}`}>
      {entry.icon}
      {entry.label}
    </Badge>
  )
}

/* ─────────── Main Component ─────────── */

export function FHIRSubscriptions() {
  const [activeTab, setActiveTab] = useState('abonnements')

  const subscriptions = useMemo(() => subscriptionService.getSubscriptions(), [])
  const events = useMemo(() => subscriptionService.getEvents(), [])
  const webhooks = useMemo(() => subscriptionService.getWebhooks(), [])
  const metrics = useMemo(() => subscriptionService.getMetrics(), [])

  /* ─── Abonnements Tab ─── */
  const renderSubscriptions = () => (
    <div className="space-y-4">
      {subscriptions.map((sub, i) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{sub.name}</h3>
                      <SubscriptionStatusBadge status={sub.status} />
                      <ChannelBadge channel={sub.channel} />
                      <Badge variant="outline" className="text-xs bg-muted">
                        {sub.resourceType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted/60 px-2 py-1 rounded truncate">
                      {sub.criteria}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Event types */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground mr-1">Evenements:</span>
                  {sub.eventType.map((et) => (
                    <EventTypeBadge key={et} type={et} />
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-500" />
                    {sub.triggerCount} declenchements
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-400" />
                    {sub.failureCount} echecs
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Dernier: {timeAgo(sub.lastTriggeredAt)}
                  </span>
                </div>

                {/* Error */}
                {sub.lastError && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{sub.lastError}</span>
                  </div>
                )}

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {sub.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )

  /* ─── Evenements Tab ─── */
  const renderEvents = () => (
    <ScrollArea className="max-h-[600px]">
      <div className="space-y-2 pr-3">
        {events.map((evt, i) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex flex-col gap-2">
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{evt.subscriptionName}</span>
                      <EventTypeBadge type={evt.eventType} />
                      <Badge variant="outline" className="text-xs bg-muted">
                        {evt.resourceType}
                      </Badge>
                    </div>
                    <DeliveryStatusBadge status={evt.status} />
                  </div>

                  {/* Resource & Patient */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1 font-mono">
                      <Code2 className="h-3 w-3" />
                      {evt.resourceId}
                    </span>
                    {evt.patientName && (
                      <span className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        {evt.patientName} ({evt.patientId})
                      </span>
                    )}
                  </div>

                  {/* Delivery details */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      {evt.deliveryAttempts} tentative{evt.deliveryAttempts > 1 ? 's' : ''}
                    </span>
                    {evt.responseCode !== null && (
                      <span
                        className={`font-mono ${
                          evt.responseCode >= 200 && evt.responseCode < 300
                            ? 'text-green-600'
                            : evt.responseCode >= 400
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}
                      >
                        HTTP {evt.responseCode}
                      </span>
                    )}
                    {evt.responseTimeMs !== null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {evt.responseTimeMs} ms
                      </span>
                    )}
                    <span>{formatDate(evt.timestamp)}</span>
                  </div>

                  {/* Error message */}
                  {evt.error && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">
                      <XCircle className="h-3 w-3 shrink-0" />
                      <span className="truncate">{evt.error}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  )

  /* ─── Webhooks Tab ─── */
  const renderWebhooks = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {webhooks.map((wh, i) => (
        <motion.div
          key={wh.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
        >
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 flex flex-col gap-3 h-full">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Webhook className="h-4 w-4 text-purple-500 shrink-0" />
                  <h3 className="font-semibold text-sm truncate">{wh.name}</h3>
                </div>
                {wh.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs shrink-0">
                    Actif
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs shrink-0">
                    Inactif
                  </Badge>
                )}
              </div>

              {/* URL */}
              <p className="text-xs font-mono bg-muted/60 px-2 py-1.5 rounded truncate text-muted-foreground">
                {wh.url}
              </p>

              {/* Events */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {wh.events.map((et) => (
                  <EventTypeBadge key={et} type={et} />
                ))}
              </div>

              <Separator />

              {/* Footer stats */}
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-muted-foreground">
                  Dernier ping: {timeAgo(wh.lastPingAt)}
                </span>
                <PingStatusBadge status={wh.pingStatus} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )

  /* ─── Metriques Tab ─── */
  const renderMetrics = () => {
    const maxTriggerCount = Math.max(
      ...metrics.topTriggeredSubscriptions.map((s) => s.count),
      1
    )

    return (
      <div className="space-y-6">
        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Abonnements', value: metrics.totalSubscriptions, icon: Bell, color: 'text-blue-600' },
            { label: 'Actifs', value: metrics.activeSubscriptions, icon: CheckCircle2, color: 'text-green-600' },
            { label: 'Total Evenements', value: metrics.totalEvents, icon: Activity, color: 'text-purple-600' },
            { label: 'Livr. Reussies', value: metrics.successfulDeliveries, icon: Send, color: 'text-emerald-600' },
            { label: 'Livr. Echouees', value: metrics.failedDeliveries, icon: XCircle, color: 'text-red-600' },
            { label: 'Temps Moyen', value: metrics.averageDeliveryTime, icon: Clock, color: 'text-amber-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Events by type */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Evenements par type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(
                  [
                    { type: 'create', label: 'Creation', color: 'bg-green-500' },
                    { type: 'update', label: 'Mise a jour', color: 'bg-blue-500' },
                    { type: 'delete', label: 'Suppression', color: 'bg-red-500' },
                    { type: 'transition', label: 'Transition', color: 'bg-amber-500' },
                  ] as const
                ).map((entry) => {
                  const count = metrics.eventsByType[entry.type] ?? 0
                  const total = Object.values(metrics.eventsByType).reduce((a, b) => a + b, 0) || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={entry.type} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{entry.label}</span>
                        <span className="text-muted-foreground">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${entry.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Events by resource type */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-500" />
                  Evenements par type de ressource
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(metrics.eventsByResource).map(([resource, count]) => {
                  const total = Object.values(metrics.eventsByResource).reduce((a, b) => a + b, 0) || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={resource} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{resource}</span>
                        <span className="text-muted-foreground">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: 0.35 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top triggered subscriptions - bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Top 5 Abonnements les plus declenches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.topTriggeredSubscriptions.map((sub, i) => {
                  const pct = Math.round((sub.count / maxTriggerCount) * 100)
                  return (
                    <div key={sub.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium truncate mr-4">{sub.name}</span>
                        <span className="text-muted-foreground shrink-0">
                          {sub.count} declenchements
                        </span>
                      </div>
                      <div className="h-6 rounded bg-muted overflow-hidden relative">
                        <motion.div
                          className="h-full rounded"
                          style={{
                            background: `linear-gradient(90deg, hsl(${160 - i * 25}, 70%, 45%), hsl(${160 - i * 25}, 70%, 55%))`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.4 + i * 0.08 }}
                        />
                        {pct > 15 && (
                          <motion.span
                            className="absolute inset-y-0 left-3 flex items-center text-xs font-medium text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 + i * 0.08 }}
                          >
                            {pct}%
                          </motion.span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  /* ─── Render ─── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-amber-600" />
            Abonnements FHIR &amp; Webhooks
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestion des abonnements FHIR R4 et webhooks pour HealthFlow Guinee
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            {subscriptions.filter((s) => s.status === 'active').length} actifs
          </Badge>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="abonnements" className="flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Abonnements
          </TabsTrigger>
          <TabsTrigger value="evenements" className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Evenements
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-1.5">
            <Webhook className="h-3.5 w-3.5" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="metriques" className="flex items-center gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Metriques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="abonnements" className="mt-4">
          {renderSubscriptions()}
        </TabsContent>

        <TabsContent value="evenements" className="mt-4">
          {renderEvents()}
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          {renderWebhooks()}
        </TabsContent>

        <TabsContent value="metriques" className="mt-4">
          {renderMetrics()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
