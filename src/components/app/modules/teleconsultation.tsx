'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Video, Plus, Phone, MessageSquare, Mic, MicOff, Camera, CameraOff, PhoneOff, Monitor, Send, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }

type SessionStatus = 'En cours' | 'Planifiée' | 'Terminée'
type SessionType = 'Vidéo' | 'Audio' | 'Chat'

interface TeleSession {
  id: number; patient: string; doctor: string; type: SessionType; status: SessionStatus
  date: string; time: string; duration?: string; meetingId: string; notes: string
}

const demoSessions: TeleSession[] = [
  { id: 1, patient: 'Aminata Diallo', doctor: 'Dr. Mamadou Bah', type: 'Vidéo', status: 'En cours', date: '05/03/2026', time: '10:00', duration: '15 min', meetingId: 'MTG-8201', notes: 'Suivi traitement paludisme' },
  { id: 2, patient: 'Ibrahim Touré', doctor: 'Dr. Aissatou Sylla', type: 'Vidéo', status: 'Planifiée', date: '05/03/2026', time: '11:30', meetingId: 'MTG-8202', notes: 'Consultation cardiologie à distance' },
  { id: 3, patient: 'Kadiatou Sylla', doctor: 'Dr. Mamadou Bah', type: 'Chat', status: 'En cours', date: '05/03/2026', time: '09:00', duration: '45 min', meetingId: 'MTG-8203', notes: 'Suivi céphalées chroniques' },
  { id: 4, patient: 'Mariama Bah', doctor: 'Dr. Aissatou Sylla', type: 'Audio', status: 'Planifiée', date: '05/03/2026', time: '14:00', meetingId: 'MTG-8204', notes: 'Consultation prénatale à distance' },
]

const demoMessages = [
  { sender: 'patient', text: 'Bonjour Docteur, je vais mieux mais j\'ai encore des maux de tête.', time: '09:02' },
  { sender: 'doctor', text: 'Bonjour Kadiatou. Avez-vous pris le traitement prescrit ?', time: '09:03' },
  { sender: 'patient', text: 'Oui, je prends l\'ibuprofène mais seulement quand j\'ai mal.', time: '09:05' },
  { sender: 'doctor', text: 'Il faut le prendre régulièrement pendant 5 jours. Comment est la tension ?', time: '09:06' },
  { sender: 'patient', text: 'Je n\'ai pas de tensiomètre à domicile.', time: '09:08' },
  { sender: 'doctor', text: 'Je vais vous orienter vers le centre de santé le plus proche pour un contrôle. En attendant, continuez le traitement.', time: '09:10' },
]

const statusColors: Record<SessionStatus, string> = {
  'En cours': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'Planifiée': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  'Terminée': 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
}

const typeColors: Record<SessionType, string> = {
  'Vidéo': 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
  'Audio': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  'Chat': 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
}

export function TeleconsultationPage() {
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('sessions')
  const [messageInput, setMessageInput] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20"><Video className="size-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Téléconsultation</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Consultations à distance</p>
          </div>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
          <Plus className="size-4 mr-2" /> Planifier téléconsult
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'En cours', value: demoSessions.filter(s => s.status === 'En cours').length, color: 'from-emerald-500 to-green-600' },
          { label: 'Planifiées', value: demoSessions.filter(s => s.status === 'Planifiée').length, color: 'from-amber-500 to-orange-600' },
          { label: 'Aujourd\'hui', value: demoSessions.length, color: 'from-teal-500 to-emerald-600' },
          { label: 'Ce mois', value: 47, color: 'from-cyan-500 to-teal-600' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="video">Appel vidéo</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="mt-4">
          <div className="space-y-2">
            {demoSessions.map((session, index) => (
              <motion.div key={session.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-full bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-sm">
                      {session.patient.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{session.patient}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{session.doctor} • {session.date} {session.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${typeColors[session.type]}`}>{session.type}</span>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusColors[session.status]}`}>{session.status}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{session.notes}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">ID: {session.meetingId}</span>
                  {session.status === 'En cours' && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7">
                      <Video className="size-3 mr-1" /> Rejoindre
                    </Button>
                  )}
                  {session.status === 'Planifiée' && (
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      <Clock className="size-3 mr-1" /> En attente
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Video Call Tab */}
        <TabsContent value="video" className="mt-4">
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardContent className="p-0">
              <div className="relative bg-slate-900 rounded-t-lg aspect-video max-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="text-center text-white">
                  <div className="flex items-center justify-center size-20 rounded-full bg-teal-600/30 mb-4 mx-auto">
                    <Video className="size-10 text-teal-400" />
                  </div>
                  <p className="text-lg font-medium">Dr. Mamadou Bah</p>
                  <p className="text-sm text-slate-400">En attente de connexion...</p>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 justify-center"><span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> 15:23</p>
                </div>
                {/* Self video preview */}
                <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                  <Camera className="size-6 text-slate-500" />
                </div>
              </div>
              {/* Controls */}
              <div className="flex items-center justify-center gap-4 py-4 bg-slate-100 dark:bg-slate-900 rounded-b-lg">
                <Button variant={isMuted ? 'destructive' : 'outline'} size="icon" className="rounded-full size-12" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                </Button>
                <Button variant={isCameraOff ? 'destructive' : 'outline'} size="icon" className="rounded-full size-12" onClick={() => setIsCameraOff(!isCameraOff)}>
                  {isCameraOff ? <CameraOff className="size-5" /> : <Camera className="size-5" />}
                </Button>
                <Button size="icon" className="rounded-full size-12 bg-teal-600 hover:bg-teal-700 text-white"><Monitor className="size-5" /></Button>
                <Button size="icon" className="rounded-full size-12 bg-rose-600 hover:bg-rose-700 text-white"><PhoneOff className="size-5" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-4">
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs">KS</div>
                <div>
                  <CardTitle className="text-sm font-semibold">Kadiatou Sylla</CardTitle>
                  <CardDescription className="text-[10px] flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> En ligne</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar mb-4">
                {demoMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === 'doctor'
                        ? 'bg-teal-600 text-white rounded-br-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'doctor' ? 'text-teal-200' : 'text-slate-400'}`}>{msg.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Écrire un message..." value={messageInput} onChange={e => setMessageInput(e.target.value)} className="flex-1" />
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" size="icon"><Send className="size-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Session Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="size-5 text-teal-600" /> Planifier téléconsultation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Patient *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent><SelectItem value="1">Aminata Diallo</SelectItem><SelectItem value="2">Ibrahim Touré</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Médecin *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent><SelectItem value="1">Dr. Mamadou Bah</SelectItem><SelectItem value="2">Dr. Aissatou Sylla</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date *</Label><Input type="date" /></div>
              <div className="space-y-2"><Label>Heure *</Label><Input type="time" /></div>
            </div>
            <div className="space-y-2"><Label>Type</Label><Select defaultValue="Vidéo"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Vidéo">Vidéo</SelectItem><SelectItem value="Audio">Audio</SelectItem><SelectItem value="Chat">Chat</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Motif</Label><Textarea placeholder="Motif de la téléconsultation..." rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={() => setShowNewDialog(false)}>Planifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </motion.div>
  )
}
