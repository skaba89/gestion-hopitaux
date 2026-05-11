'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Download, Share2, Printer, Camera, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

/* ─────────── Simple QR Code SVG Generator ─────────── */

function generateQRMatrix(data: string): boolean[][] {
  // Simple QR-like pattern generator for demo
  // This creates a deterministic visual pattern from the data string
  const size = 25
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))

  // Position detection patterns (3 corners)
  const drawFinder = (x: number, y: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          if (x + i < size && y + j < size) matrix[x + i][y + j] = true
        }
      }
    }
  }
  drawFinder(0, 0)
  drawFinder(0, size - 7)
  drawFinder(size - 7, 0)

  // Data encoding from string
  let seed = 0
  for (let i = 0; i < data.length; i++) {
    seed = ((seed << 5) - seed + data.charCodeAt(i)) | 0
  }

  const pseudoRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }

  // Fill data area
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Skip finder patterns
      if ((i < 8 && j < 8) || (i < 8 && j >= size - 8) || (i >= size - 8 && j < 8)) continue
      // Timing patterns
      if (i === 6 || j === 6) {
        matrix[i][j] = (i + j) % 2 === 0
        continue
      }
      // Data
      matrix[i][j] = pseudoRandom() > 0.5
    }
  }

  return matrix
}

function QRCodeSVG({ data, size = 200 }: { data: string; size?: number }) {
  const matrix = generateQRMatrix(data)
  const cellSize = size / matrix.length

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <rect width={size} height={size} fill="white" rx="4" />
      {matrix.map((row, i) =>
        row.map((cell, j) =>
          cell ? (
            <rect
              key={`${i}-${j}`}
              x={j * cellSize}
              y={i * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
              rx={cellSize > 3 ? 0.5 : 0}
            />
          ) : null
        )
      )}
    </svg>
  )
}

/* ─────────── QR Payment Component ─────────── */

interface QRPaymentProps {
  invoiceId?: string
  amount?: number
  patientName?: string
  facilityId?: string
  onScanComplete?: (data: string) => void
}

export function QRPayment({ invoiceId, amount, patientName, facilityId = 'HF-DONKA', onScanComplete }: QRPaymentProps) {
  const { toast } = useToast()
  const [reference, setReference] = useState(invoiceId || '')
  const [qrAmount, setQrAmount] = useState(amount ? String(amount) : '')
  const [qrData, setQrData] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateQR = () => {
    if (!reference) {
      toast({ title: 'Référence requise', description: 'Entrez un numéro de facture ou référence.', variant: 'destructive' })
      return
    }

    const data = JSON.stringify({
      ref: reference,
      amount: qrAmount || '0',
      facility: facilityId,
      patient: patientName || '',
      timestamp: new Date().toISOString(),
    })

    setQrData(data)
    setShowQR(true)
  }

  const handleShare = async () => {
    const shareText = `Paiement HealthFlow Africa\nRéf: ${reference}\nMontant: ${Number(qrAmount || 0).toLocaleString()} GNF\nÉtablissement: ${facilityId}`
    
    if (navigator.share) {
      await navigator.share({ title: 'Paiement HealthFlow', text: shareText })
    } else {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Copié !', description: 'Informations de paiement copiées.' })
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>QR Paiement - HealthFlow Africa</title></head>
        <body style="display:flex;justify-content:center;align-items:center;flex-direction:column;height:100vh;font-family:sans-serif;">
          <h2>HealthFlow Africa</h2>
          <p>Référence: ${reference}</p>
          <p>Montant: ${Number(qrAmount || 0).toLocaleString()} GNF</p>
          <p>Établissement: ${facilityId}</p>
          <p>Patient: ${patientName || 'N/A'}</p>
          <div id="qr"></div>
          <p style="margin-top:20px;font-size:12px;color:#666;">Scannez ce QR code pour effectuer le paiement</p>
        </body></html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md">
            <QrCode className="size-4 text-white" />
          </div>
          Paiement par QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showQR ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Référence / N° Facture</Label>
              <Input placeholder="FAC-XXX ou référence" value={reference} onChange={e => setReference(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Montant (GNF)</Label>
              <Input type="number" placeholder="0" value={qrAmount} onChange={e => setQrAmount(e.target.value)} />
            </div>
            <Button onClick={generateQR} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
              <QrCode className="size-4 mr-2" /> Générer le QR Code
            </Button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-xl">
              <QRCodeSVG data={qrData} size={200} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{reference}</p>
              <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{Number(qrAmount || 0).toLocaleString()} GNF</p>
              <p className="text-xs text-slate-500">{facilityId} • {patientName || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleShare}>
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
                Partager
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handlePrint}>
                <Printer className="size-3.5" /> Imprimer
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setShowQR(false)}>
                <QrCode className="size-3.5" /> Nouveau
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
