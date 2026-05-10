'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Phone, Search, BarChart3, Clock, CheckCircle2, XCircle, Mail, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useDataStore, type MessageChannel, type MessageLog } from '@/lib/data-store'
import { messageTemplates } from '@/lib/message-templates'
import { fillTemplate } from '@/lib/message-templates'
import { useToast } from '@/hooks/use-toast'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

export function MessageCenter() {
  const { toast } = useToast()
  const { messageLogs, addMessageLog, patients } = useDataStore()

  const [channel, setChannel] = useState<MessageChannel>('SMS')
  const [recipient, setRecipient] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({})
  const [isSending, setIsSending] = useState(false)
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter message logs
  const filteredLogs = useMemo(() => {
    let result = [...messageLogs].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    
    if (filterChannel !== 'all') result = result.filter(m => m.channel === filterChannel)
    if (filterStatus !== 'all') result = result.filter(m => m.status === filterStatus)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(m => m.recipientName.toLowerCase().includes(q) || m.message.toLowerCase().includes(q) || m.recipient.includes(q))
    }
    
    return result
  }, [messageLogs, filterChannel, filterStatus, searchQuery])

  // Stats
  const totalSent = messageLogs.length
  const delivered = messageLogs.filter(m => m.status === 'Délivré').length
  const failed = messageLogs.filter(m => m.status === 'Échoué').length
  const deliveryRate = totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = messageTemplates.find(t => t.id === templateId)
    if (template) {
      setMessage(template.template)
      setTemplateParams({})
    }
  }

  // Fill template with params
  const handleFillTemplate = () => {
    if (selectedTemplate) {
      const filled = fillTemplate(selectedTemplate, templateParams)
      setMessage(filled)
    }
  }

  // Send message
  const handleSend = async () => {
    if (!recipient || !message) {
      toast({ title: 'Champs manquants', description: 'Destinataire et message requis.', variant: 'destructive' })
      return
    }

    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 800))

    const success = Math.random() > 0.1

    const msgLog: MessageLog = {
      id: `MSG-${Date.now()}`,
      channel,
      recipient,
      recipientName: recipientName || recipient,
      message,
      templateId: selectedTemplate || null,
      status: success ? (channel === 'WhatsApp' ? 'Délivré' : 'Envoyé') : 'Échoué',
      sentAt: new Date().toISOString(),
      deliveredAt: success ? new Date().toISOString() : null,
      errorMessage: success ? null : 'Numéro injoignable',
    }

    addMessageLog(msgLog)
    setIsSending(false)

    toast({
      title: success ? 'Message envoyé' : 'Échec de l\'envoi',
      description: success ? `${channel} envoyé à ${recipient}` : 'Le message n\'a pas pu être envoyé.',
      variant: success ? 'default' : 'destructive',
    })

    if (success) {
      setRecipient('')
      setRecipientName('')
      setMessage('')
      setSelectedTemplate('')
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'Délivré': return <CheckCircle2 className="size-3.5 text-emerald-500" />
      case 'Envoyé': return <Clock className="size-3.5 text-blue-500" />
      case 'Échoué': return <XCircle className="size-3.5 text-red-500" />
      default: return <Clock className="size-3.5 text-amber-500" />
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-teal-500/20">
          <MessageSquare className="size-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Centre de Messagerie</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">SMS & WhatsApp Business</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Envoyés', value: totalSent, icon: Send, color: 'from-cyan-500 to-teal-600' },
          { label: 'Délivrés', value: delivered, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
          { label: 'Échoués', value: failed, icon: XCircle, color: 'from-red-500 to-rose-600' },
          { label: 'Taux livraison', value: `${deliveryRate}%`, icon: BarChart3, color: 'from-violet-500 to-purple-600' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-4 pb-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Send Message */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Envoyer un message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Channel */}
              <div className="space-y-2">
                <Label className="text-xs">Canal</Label>
                <div className="flex gap-2">
                  <Button
                    variant={channel === 'SMS' ? 'default' : 'outline'}
                    size="sm"
                    className={channel === 'SMS' ? 'bg-cyan-600 text-white' : ''}
                    onClick={() => setChannel('SMS')}
                  >
                    <Phone className="size-3.5 mr-1" /> SMS
                  </Button>
                  <Button
                    variant={channel === 'WhatsApp' ? 'default' : 'outline'}
                    size="sm"
                    className={channel === 'WhatsApp' ? 'bg-emerald-600 text-white' : ''}
                    onClick={() => setChannel('WhatsApp')}
                  >
                    <MessageSquare className="size-3.5 mr-1" /> WhatsApp
                  </Button>
                </div>
              </div>

              {/* Recipient */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Téléphone</Label>
                  <Input placeholder="+224 6XX XX XX XX" value={recipient} onChange={e => setRecipient(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Nom</Label>
                  <Input placeholder="Nom du destinataire" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
                </div>
              </div>

              {/* Quick patient search */}
              <div className="space-y-2">
                <Label className="text-xs">Recherche rapide patient</Label>
                <Select onValueChange={(v) => {
                  const patient = patients.find(p => p.id === v)
                  if (patient) {
                    setRecipient(patient.phone)
                    setRecipientName(`${patient.firstName} ${patient.lastName}`)
                  }
                }}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Sélectionner un patient..." /></SelectTrigger>
                  <SelectContent>
                    {patients.filter(p => p.status === 'Actif').map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.phone})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template */}
              <div className="space-y-2">
                <Label className="text-xs">Modèle de message</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Choisir un modèle..." /></SelectTrigger>
                  <SelectContent>
                    {messageTemplates.filter(t => t.channel === 'Les deux' || t.channel === channel).map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name} ({t.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template params */}
              {selectedTemplate && (() => {
                const template = messageTemplates.find(t => t.id === selectedTemplate)
                if (!template || template.params.length === 0) return null
                return (
                  <div className="space-y-2">
                    <Label className="text-xs">Paramètres du modèle</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {template.params.map(param => (
                        <Input
                          key={param}
                          placeholder={param}
                          className="text-xs h-8"
                          value={templateParams[param] || ''}
                          onChange={e => setTemplateParams(prev => ({ ...prev, [param]: e.target.value }))}
                        />
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="text-xs w-full" onClick={handleFillTemplate}>
                      Appliquer les paramètres
                    </Button>
                  </div>
                )
              })()}

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-xs">Message</Label>
                <Textarea
                  placeholder="Votre message..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className="text-xs"
                />
                <p className="text-[10px] text-slate-400">{message.length} caractères {channel === 'SMS' && `• ${Math.ceil(message.length / 160)} SMS`}</p>
              </div>

              <Button onClick={handleSend} disabled={isSending || !recipient || !message} className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white text-sm">
                {isSending ? (
                  <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block mr-2">⟳</motion.span> Envoi en cours...</>
                ) : (
                  <><Send className="size-4 mr-2" /> Envoyer par {channel}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Message History */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Historique des messages</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                  <Input placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-7 h-7 text-xs" />
                </div>
                <Select value={filterChannel} onValueChange={setFilterChannel}>
                  <SelectTrigger className="w-[90px] h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Messages */}
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredLogs.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">Aucun message</div>
                ) : (
                  filteredLogs.map(msg => (
                    <div key={msg.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        {msg.channel === 'SMS' ? (
                          <Phone className="size-3 text-cyan-500" />
                        ) : (
                          <MessageSquare className="size-3 text-emerald-500" />
                        )}
                        <span className="text-xs font-medium text-slate-900 dark:text-white">{msg.recipientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.recipient}</span>
                        <div className="flex-1" />
                        {statusIcon(msg.status)}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{msg.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">{msg.channel}</Badge>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.sentAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.errorMessage && <span className="text-[10px] text-red-400">{msg.errorMessage}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </motion.div>
  )
}
