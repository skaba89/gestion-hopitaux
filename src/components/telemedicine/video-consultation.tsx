'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video, Mic, MicOff, Camera, CameraOff, PhoneOff, Monitor, MessageSquare,
  FileUp, Clock, Wifi, WifiOff, Maximize, Minimize, PictureInPicture2,
  Radio, ChevronDown, Shield, AlertTriangle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  TelemedicinePeerConnection, assessConnectionQuality, getRecommendedQuality,
  type VideoConsultationSession, type ConnectionQuality, type VideoQuality,
  type ChatMessage, type SessionType, demoVideoSessions
} from '@/lib/telemedicine'
import { ConsultationChat } from './consultation-chat'
import { VirtualWaitingRoom } from './virtual-waiting-room'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

const qualityColors: Record<ConnectionQuality, string> = {
  excellente: 'bg-emerald-500',
  bonne: 'bg-teal-500',
  faible: 'bg-amber-500',
  très_faible: 'bg-red-500',
}

const qualityLabels: Record<ConnectionQuality, string> = {
  excellente: 'Excellente',
  bonne: 'Bonne',
  faible: 'Faible',
  très_faible: 'Très faible',
}

interface VideoConsultationProps {
  session?: VideoConsultationSession
  onEnd?: () => void
}

export function VideoConsultation({ session: propSession, onEnd }: VideoConsultationProps) {
  const [session] = useState<VideoConsultationSession>(propSession || demoVideoSessions[0])
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPIP, setIsPIP] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('bonne')
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('HD')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showFileShare, setShowFileShare] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(session.chatMessages)
  const [activeTab, setActiveTab] = useState<string>(session.status === 'en_attente' ? 'waiting' : 'call')
  const videoRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const peerRef = useRef<TelemedicinePeerConnection | null>(null)
  const { toast } = useToast()

  // Timer
  useEffect(() => {
    if (activeTab === 'call' && session.status === 'en_cours') {
      timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [activeTab, session.status])

  // Connection quality monitoring (simulated)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate connection quality changes
      const qualities: ConnectionQuality[] = ['excellente', 'bonne', 'bonne', 'bonne', 'faible']
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)]
      setConnectionQuality(randomQuality)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleStartCall = useCallback(() => {
    setActiveTab('call')
    toast({ title: 'Consultation démarrée', description: 'Connexion en cours...' })
  }, [toast])

  const handleEndCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    peerRef.current?.close()
    toast({ title: 'Consultation terminée', description: `Durée: ${formatTime(elapsedTime)}` })
    onEnd?.()
  }, [elapsedTime, onEnd, toast])

  const handleToggleMic = () => {
    setIsMuted(!isMuted)
    peerRef.current?.toggleMicrophone(isMuted) // toggle to opposite
  }

  const handleToggleCamera = () => {
    setIsCameraOff(!isCameraOff)
    peerRef.current?.toggleCamera(isCameraOff)
  }

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      peerRef.current?.stopScreenShare()
      setIsScreenSharing(false)
    } else {
      try {
        peerRef.current?.startScreenShare()
        setIsScreenSharing(true)
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de partager l\'écran', variant: 'destructive' })
      }
    }
  }

  const handleFallback = (quality: VideoQuality) => {
    setVideoQuality(quality)
    peerRef.current?.adaptQuality(quality)
    const labels: Record<VideoQuality, string> = { HD: 'Vidéo HD', SD: 'Vidéo SD', audio_only: 'Audio uniquement' }
    toast({ title: 'Qualité adaptée', description: `Basculé en mode ${labels[quality]}` })
  }

  const handleSendMessage = (text: string) => {
    const msg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      senderId: 'USR-001',
      senderName: 'Dr. Diallo',
      senderRole: 'doctor',
      text,
      timestamp: new Date().toISOString(),
      type: 'text',
    }
    setChatMessages(prev => [...prev, msg])
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="call" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <Video className="size-4 mr-1" /> Consultation
          </TabsTrigger>
          <TabsTrigger value="waiting" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <Clock className="size-4 mr-1" /> Salle d&apos;attente
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <Radio className="size-4 mr-1" /> Historique
          </TabsTrigger>
        </TabsList>

        {/* ─── Video Call ─── */}
        <TabsContent value="call" className="mt-4">
          <div ref={videoRef} className="relative">
            <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
              <CardContent className="p-0">
                {/* Main video area */}
                <div className="relative bg-slate-900 aspect-video max-h-[500px] flex items-center justify-center overflow-hidden">
                  {/* Demo mode: placeholder */}
                  <div className="text-center text-white">
                    <div className="flex items-center justify-center size-24 rounded-full bg-teal-600/20 mb-4 mx-auto">
                      {isCameraOff ? (
                        <CameraOff className="size-10 text-slate-400" />
                      ) : (
                        <Video className="size-10 text-teal-400" />
                      )}
                    </div>
                    <p className="text-lg font-medium">{session.patientName}</p>
                    <p className="text-sm text-slate-400">
                      {session.status === 'en_attente' ? 'En attente de connexion...' : 'En consultation'}
                    </p>

                    {/* Timer */}
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 justify-center">
                      <span className={`size-2 rounded-full ${session.status === 'en_cours' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                      {formatTime(elapsedTime)}
                    </p>
                  </div>

                  {/* Self video preview (PIP) */}
                  <div className="absolute bottom-4 right-4 w-36 h-28 rounded-lg bg-slate-800/90 border-2 border-slate-600 flex items-center justify-center backdrop-blur-sm">
                    {isCameraOff ? (
                      <CameraOff className="size-6 text-slate-500" />
                    ) : (
                      <div className="text-center">
                        <div className="size-10 rounded-full bg-teal-600/30 flex items-center justify-center mx-auto mb-1">
                          <Camera className="size-5 text-teal-400" />
                        </div>
                        <p className="text-[10px] text-slate-400">Vous</p>
                      </div>
                    )}
                  </div>

                  {/* Connection quality indicator */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                    <span className={`size-2.5 rounded-full ${qualityColors[connectionQuality]}`} />
                    <span className="text-xs text-white font-medium">{qualityLabels[connectionQuality]}</span>
                    {videoQuality === 'audio_only' && <span className="text-[10px] text-amber-400 ml-1">Audio</span>}
                  </div>

                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-600/80 rounded-lg px-3 py-1.5">
                      <span className="size-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs text-white font-medium">REC</span>
                    </div>
                  )}

                  {/* Encryption badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/40 rounded-lg px-2 py-1">
                    <Shield className="size-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">Chiffré E2E</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 py-4 bg-slate-100 dark:bg-slate-900">
                  <Button variant={isMuted ? 'destructive' : 'outline'} size="icon" className="rounded-full size-12" onClick={handleToggleMic}>
                    {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                  </Button>
                  <Button variant={isCameraOff ? 'destructive' : 'outline'} size="icon" className="rounded-full size-12" onClick={handleToggleCamera}>
                    {isCameraOff ? <CameraOff className="size-5" /> : <Camera className="size-5" />}
                  </Button>
                  <Button variant={isScreenSharing ? 'default' : 'outline'} size="icon" className="rounded-full size-12" onClick={handleScreenShare}>
                    <Monitor className="size-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full size-12" onClick={() => setShowChat(!showChat)}>
                    <MessageSquare className="size-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full size-12" onClick={() => setShowFileShare(!showFileShare)}>
                    <FileUp className="size-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full size-12" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
                  </Button>

                  {/* Fallback buttons */}
                  {videoQuality !== 'audio_only' && (
                    <Button variant="outline" size="sm" className="rounded-full text-amber-600 border-amber-300 hover:bg-amber-50" onClick={() => handleFallback('audio_only')}>
                      <Radio className="size-4 mr-1" /> Basculer audio
                    </Button>
                  )}

                  {/* End call */}
                  <Button variant="destructive" size="icon" className="rounded-full size-14 bg-rose-600 hover:bg-rose-700" onClick={handleEndCall}>
                    <PhoneOff className="size-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chat sidebar */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mt-4"
                >
                  <ConsultationChat
                    messages={chatMessages}
                    onSend={handleSendMessage}
                    patientName={session.patientName}
                    doctorName={session.doctorName}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* ─── Waiting Room ─── */}
        <TabsContent value="waiting" className="mt-4">
          <VirtualWaitingRoom session={session} onStartCall={handleStartCall} />
        </TabsContent>

        {/* ─── Session History ─── */}
        <TabsContent value="history" className="mt-4">
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-4 text-slate-900 dark:text-white">Historique des consultations</h3>
              <div className="space-y-3">
                {demoVideoSessions.map(s => (
                  <div key={s.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-teal-100 dark:bg-teal-950/40 flex items-center justify-center text-teal-700 dark:text-teal-300 text-xs font-bold">
                        {s.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{s.patientName}</p>
                        <p className="text-xs text-slate-500">{s.doctorName} • {s.type}</p>
                      </div>
                    </div>
                    <Badge variant={s.status === 'terminee' ? 'secondary' : s.status === 'en_cours' ? 'default' : 'outline'}>
                      {s.status === 'terminee' ? 'Terminée' : s.status === 'en_cours' ? 'En cours' : 'En attente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection test banner */}
      {connectionQuality === 'faible' || connectionQuality === 'très_faible' ? (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="size-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Connexion instable</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">La qualité de connexion est faible. Envisagez de basculer en mode audio uniquement.</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100" onClick={() => handleFallback('audio_only')}>
            Passer en audio
          </Button>
        </motion.div>
      ) : null}
    </motion.div>
  )
}
