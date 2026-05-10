'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, ImagePlus, FileUp, StickyNote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { type ChatMessage } from '@/lib/telemedicine'

interface ConsultationChatProps {
  messages: ChatMessage[]
  onSend: (text: string) => void
  patientName: string
  doctorName: string
}

export function ConsultationChat({ messages, onSend, patientName, doctorName }: ConsultationChatProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Chat de consultation</CardTitle>
          <Badge variant="outline" className="text-[10px]">
            <span className="size-1.5 rounded-full bg-emerald-500 mr-1" /> En ligne
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Messages */}
        <div ref={scrollRef} className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar mb-3">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex ${msg.senderRole === 'doctor' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.senderRole === 'doctor'
                  ? 'bg-teal-600 text-white rounded-br-md'
                  : msg.type === 'system'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-center text-xs italic'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'
              }`}>
                {msg.type === 'note' && (
                  <div className="flex items-center gap-1 mb-1">
                    <StickyNote className="size-3 text-amber-400" />
                    <span className="text-[10px] font-medium text-amber-200">Note médicale</span>
                  </div>
                )}
                {msg.type === 'image' && (
                  <div className="mb-1.5 p-2 bg-white/10 rounded-lg flex items-center gap-2">
                    <ImagePlus className="size-4 opacity-70" />
                    <span className="text-xs opacity-70">Image partagée</span>
                  </div>
                )}
                {msg.type === 'file' && (
                  <div className="mb-1.5 p-2 bg-white/10 rounded-lg flex items-center gap-2">
                    <FileUp className="size-4 opacity-70" />
                    <span className="text-xs opacity-70">{msg.text}</span>
                  </div>
                )}
                {msg.type !== 'file' && msg.type !== 'system' && <p className="text-sm">{msg.text}</p>}
                <p className={`text-[10px] mt-1 ${
                  msg.senderRole === 'doctor' ? 'text-teal-200' : 'text-slate-400'
                }`}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-slate-600" title="Partager image">
            <ImagePlus className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-slate-600" title="Partager fichier">
            <FileUp className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-amber-400 hover:text-amber-600" title="Note médicale">
            <StickyNote className="size-4" />
          </Button>
          <Input
            placeholder="Écrire un message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 h-8 text-sm"
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          />
          <Button size="icon" className="size-8 bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSend}>
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
