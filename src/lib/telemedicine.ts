// HealthFlow Africa - Telemedicine Service
// WebRTC peer connection management, signaling, video quality adaptation

export type SessionType = 'Vidéo' | 'Audio' | 'Chat'
export type ConnectionQuality = 'excellente' | 'bonne' | 'faible' | 'très_faible'
export type VideoQuality = 'HD' | 'SD' | 'audio_only'

export interface VideoConsultationSession {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  type: SessionType
  status: 'en_attente' | 'en_cours' | 'terminee' | 'annulee'
  startTime?: string
  endTime?: string
  duration?: number
  connectionQuality: ConnectionQuality
  videoQuality: VideoQuality
  recordingConsent: boolean
  isRecording: boolean
  notes: string
  summary?: string
  chatMessages: ChatMessage[]
  sharedFiles: SharedFile[]
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: 'doctor' | 'patient'
  text: string
  timestamp: string
  type: 'text' | 'image' | 'file' | 'note' | 'system'
}

export interface SharedFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedBy: string
  uploadedAt: string
}

export interface SignalingMessage {
  id: string
  sessionId: string
  fromUserId: string
  toUserId: string
  type: 'offer' | 'answer' | 'ice-candidate' | 'screen-share' | 'screen-stop'
  payload: string
  timestamp: string
}

export interface ConnectionStats {
  packetLoss: number
  latency: number // ms
  jitter: number // ms
  bitrate: number // kbps
  quality: ConnectionQuality
}

// ─────────── WebRTC Configuration ───────────

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

const VIDEO_CONSTRAINTS: Record<VideoQuality, MediaStreamConstraints> = {
  HD: {
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
    audio: true,
  },
  SD: {
    video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } },
    audio: true,
  },
  audio_only: {
    video: false,
    audio: true,
  },
}

// ─────────── Connection Quality Monitoring ───────────

/**
 * Determine connection quality from stats
 */
export function assessConnectionQuality(stats: Partial<ConnectionStats>): ConnectionQuality {
  const { packetLoss = 0, latency = 0, jitter = 0 } = stats

  if (packetLoss > 10 || latency > 500 || jitter > 100) return 'très_faible'
  if (packetLoss > 5 || latency > 300 || jitter > 50) return 'faible'
  if (packetLoss > 2 || latency > 150 || jitter > 30) return 'bonne'
  return 'excellente'
}

/**
 * Get recommended video quality based on connection
 */
export function getRecommendedQuality(quality: ConnectionQuality): VideoQuality {
  switch (quality) {
    case 'excellente': return 'HD'
    case 'bonne': return 'SD'
    case 'faible': return 'SD'
    case 'très_faible': return 'audio_only'
  }
}

/**
 * Get video constraints for quality level
 */
export function getVideoConstraints(quality: VideoQuality): MediaStreamConstraints {
  return VIDEO_CONSTRAINTS[quality]
}

// ─────────── WebRTC Peer Connection Manager ───────────

export class TelemedicinePeerConnection {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private sessionId: string
  private userId: string
  private onRemoteStream?: (stream: MediaStream) => void
  private onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  private onIceCandidate?: (candidate: RTCIceCandidate) => void
  private statsInterval: ReturnType<typeof setInterval> | null = null

  constructor(
    sessionId: string,
    userId: string,
    callbacks?: {
      onRemoteStream?: (stream: MediaStream) => void
      onConnectionStateChange?: (state: RTCPeerConnectionState) => void
      onIceCandidate?: (candidate: RTCIceCandidate) => void
    }
  ) {
    this.sessionId = sessionId
    this.userId = userId
    this.onRemoteStream = callbacks?.onRemoteStream
    this.onConnectionStateChange = callbacks?.onConnectionStateChange
    this.onIceCandidate = callbacks?.onIceCandidate
  }

  /**
   * Initialize local media stream
   */
  async initLocalStream(quality: VideoQuality = 'HD'): Promise<MediaStream> {
    const constraints = getVideoConstraints(quality)
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
    return this.localStream
  }

  /**
   * Create peer connection
   */
  createPeerConnection(): RTCPeerConnection {
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        this.peerConnection.addTrack(track, this.localStream)
      }
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      this.onRemoteStream?.(event.streams[0])
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate?.(event.candidate)
      }
    }

    // Handle connection state
    this.peerConnection.onconnectionstatechange = () => {
      this.onConnectionStateChange?.(this.peerConnection!.connectionState)
    }

    return this.peerConnection
  }

  /**
   * Create offer (for the caller)
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) this.createPeerConnection()
    const offer = await this.peerConnection!.createOffer()
    await this.peerConnection!.setLocalDescription(offer)
    return offer
  }

  /**
   * Create answer (for the callee)
   */
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) this.createPeerConnection()
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await this.peerConnection!.createAnswer()
    await this.peerConnection!.setLocalDescription(answer)
    return answer
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate))
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<MediaStream> {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })

    if (this.peerConnection) {
      const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video')
      if (sender) {
        await sender.replaceTrack(screenStream.getVideoTracks()[0])
      }
    }

    // Handle screen share stop
    screenStream.getVideoTracks()[0].onended = () => {
      this.stopScreenShare()
    }

    return screenStream
  }

  /**
   * Stop screen sharing and revert to camera
   */
  async stopScreenShare(): Promise<void> {
    if (this.localStream && this.peerConnection) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video')
        if (sender) {
          await sender.replaceTrack(videoTrack)
        }
      }
    }
  }

  /**
   * Toggle camera
   */
  toggleCamera(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled
      })
    }
  }

  /**
   * Toggle microphone
   */
  toggleMicrophone(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled
      })
    }
  }

  /**
   * Get connection stats
   */
  async getStats(): Promise<ConnectionStats> {
    if (!this.peerConnection) {
      return { packetLoss: 0, latency: 0, jitter: 0, bitrate: 0, quality: 'bonne' }
    }

    const stats = await this.peerConnection.getStats()
    let packetLoss = 0
    let latency = 0
    let jitter = 0
    let bitrate = 0

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        packetLoss = report.packetsLost ? (report.packetsLost / (report.packetsReceived || 1)) * 100 : 0
        jitter = report.jitter ? report.jitter * 1000 : 0
      }
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0
      }
    })

    const quality = assessConnectionQuality({ packetLoss, latency, jitter })
    return { packetLoss, latency, jitter, bitrate, quality }
  }

  /**
   * Adapt video quality based on connection
   */
  async adaptQuality(quality: VideoQuality): Promise<void> {
    if (!this.localStream) return

    const newConstraints = getVideoConstraints(quality)
    if (newConstraints.video && typeof newConstraints.video === 'object') {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        await videoTrack.applyConstraints(newConstraints.video as MediaTrackConstraints)
      }
    }
  }

  /**
   * Close connection
   */
  close(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
    }
    if (this.peerConnection) {
      this.peerConnection.close()
    }
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }
    this.localStream = null
    this.remoteStream = null
    this.peerConnection = null
  }
}

// ─────────── Signaling Channel (API Polling) ───────────

/**
 * Send signaling message via API
 */
export async function sendSignalingMessage(message: Omit<SignalingMessage, 'id' | 'timestamp'>): Promise<void> {
  await fetch('/api/telemedicine/signaling?XTransformPort=3000', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...message,
      id: `SIG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    }),
  })
}

/**
 * Poll for pending signaling messages
 */
export async function pollSignalingMessages(sessionId: string, userId: string): Promise<SignalingMessage[]> {
  try {
    const response = await fetch(
      `/api/telemedicine/signaling?sessionId=${sessionId}&userId=${userId}&XTransformPort=3000`,
      { method: 'GET' }
    )
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch {
    return []
  }
}

// ─────────── Demo Data ───────────

export const demoVideoSessions: VideoConsultationSession[] = [
  {
    id: 'VID-001',
    patientId: 'P-2024-003',
    patientName: 'Fatoumata Camara',
    doctorId: 'USR-001',
    doctorName: 'Dr. Mamadou Diallo',
    type: 'Vidéo',
    status: 'en_attente',
    connectionQuality: 'bonne',
    videoQuality: 'HD',
    recordingConsent: true,
    isRecording: false,
    notes: 'Suivi diabète type 1',
    chatMessages: [
      { id: 'MSG-001', senderId: 'P-2024-003', senderName: 'Fatoumata Camara', senderRole: 'patient', text: 'Bonjour Docteur', timestamp: '2026-05-10T14:00:00Z', type: 'text' },
      { id: 'MSG-002', senderId: 'USR-001', senderName: 'Dr. Diallo', senderRole: 'doctor', text: 'Bonjour Fatoumata, comment allez-vous aujourd\'hui ?', timestamp: '2026-05-10T14:01:00Z', type: 'text' },
    ],
    sharedFiles: [],
  },
  {
    id: 'VID-002',
    patientId: 'P-2024-008',
    patientName: 'Youssouf Touré',
    doctorId: 'USR-002',
    doctorName: 'Dr. Ousmane Touré',
    type: 'Audio',
    status: 'en_cours',
    connectionQuality: 'excellente',
    videoQuality: 'audio_only',
    recordingConsent: false,
    isRecording: false,
    notes: 'Suivi hépatite B',
    startTime: '2026-05-10T15:30:00Z',
    chatMessages: [],
    sharedFiles: [],
  },
]
