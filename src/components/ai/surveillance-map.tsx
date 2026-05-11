'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SurveillanceAlertLevel, EpidemiologicalAlert } from '@/lib/data-store'

/* ─────────── Guinea Health Zones ─────────── */

interface HealthZone {
  id: string
  name: string
  region: string
  path: string
  cx: number
  cy: number
}

const healthZones: HealthZone[] = [
  { id: 'conakry', name: 'Conakry', region: 'Conakry', path: 'M180,100 L200,90 L210,100 L200,115 L185,115 Z', cx: 195, cy: 105 },
  { id: 'kindia', name: 'Kindia', region: 'Kindia', path: 'M140,110 L180,100 L185,115 L200,115 L190,145 L160,150 L140,135 Z', cx: 165, cy: 130 },
  { id: 'boke', name: 'Boké', region: 'Boké', path: 'M80,60 L140,55 L140,110 L140,135 L120,145 L80,130 Z', cx: 115, cy: 95 },
  { id: 'labé', name: 'Labé', region: 'Labé', path: 'M140,55 L200,45 L230,70 L210,100 L200,90 L180,100 L140,110 Z', cx: 185, cy: 75 },
  { id: 'mamou', name: 'Mamou', region: 'Mamou', path: 'M140,135 L160,150 L190,145 L175,170 L140,165 Z', cx: 160, cy: 155 },
  { id: 'faranah', name: 'Faranah', region: 'Faranah', path: 'M190,145 L200,115 L210,100 L240,110 L250,145 L230,170 L175,170 Z', cx: 220, cy: 140 },
  { id: 'kankan', name: 'Kankan', region: 'Kankan', path: 'M230,70 L290,60 L310,90 L290,120 L250,145 L240,110 Z', cx: 270, cy: 100 },
  { id: 'nzerekore', name: "N'Zérékoré", region: "N'Zérékoré", path: 'M175,170 L230,170 L250,145 L290,150 L280,195 L230,210 L175,200 Z', cx: 235, cy: 185 },
  { id: 'kissidougou', name: 'Kissidougou', region: 'Faranah', path: 'M230,170 L250,145 L290,150 L280,170 L250,185 Z', cx: 260, cy: 165 },
]

/* ─────────── Alert Level Colors ─────────── */

function getAlertColor(level: SurveillanceAlertLevel): string {
  switch (level) {
    case 'ÉPIDÉMIE': return '#ef4444'
    case 'ALERTE': return '#f59e0b'
    case 'VEILLE': return '#22c55e'
    default: return '#94a3b8'
  }
}

function getAlertFill(level: SurveillanceAlertLevel): string {
  switch (level) {
    case 'ÉPIDÉMIE': return 'fill-red-200 dark:fill-red-900/40'
    case 'ALERTE': return 'fill-amber-200 dark:fill-amber-900/40'
    case 'VEILLE': return 'fill-emerald-200 dark:fill-emerald-900/40'
    default: return 'fill-slate-200 dark:fill-slate-700/40'
  }
}

/* ─────────── Props ─────────── */

interface SurveillanceMapProps {
  alerts: EpidemiologicalAlert[]
  onZoneClick?: (zoneId: string) => void
  selectedZone?: string | null
}

/* ─────────── Component ─────────── */

export function SurveillanceMap({ alerts, onZoneClick, selectedZone }: SurveillanceMapProps) {
  // Determine the max alert level per zone
  const zoneAlertLevels: Record<string, SurveillanceAlertLevel> = {}
  for (const alert of alerts) {
    const zone = healthZones.find(z => z.name === alert.location || z.region === alert.location)
    if (zone) {
      const current = zoneAlertLevels[zone.id]
      if (!current) {
        zoneAlertLevels[zone.id] = alert.alertLevel
      } else {
        const order: Record<SurveillanceAlertLevel, number> = { 'VEILLE': 0, 'ALERTE': 1, 'ÉPIDÉMIE': 2 }
        if (order[alert.alertLevel] > order[current]) {
          zoneAlertLevels[zone.id] = alert.alertLevel
        }
      }
    }
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 350 240" className="w-full h-auto" style={{ maxHeight: '400px' }}>
        {/* Background */}
        <rect x="0" y="0" width="350" height="240" className="fill-slate-50 dark:fill-slate-900" rx="8" />

        {/* Country outline */}
        <path
          d="M80,60 L140,55 L200,45 L230,70 L290,60 L310,90 L290,120 L290,150 L280,195 L230,210 L175,200 L175,170 L140,165 L120,145 L80,130 Z"
          className="fill-none stroke-slate-300 dark:stroke-slate-600"
          strokeWidth="1.5"
          strokeDasharray="4,2"
        />

        {/* Health zones */}
        {healthZones.map(zone => {
          const level = zoneAlertLevels[zone.id] || 'VEILLE'
          const isSelected = selectedZone === zone.id
          const alertColor = getAlertColor(level)

          return (
            <g key={zone.id} onClick={() => onZoneClick?.(zone.id)} className="cursor-pointer">
              <motion.path
                d={zone.path}
                className={`${getAlertFill(level)} ${isSelected ? 'stroke-2' : 'stroke-1'} ${isSelected ? 'stroke-slate-900 dark:stroke-white' : 'stroke-slate-400 dark:stroke-slate-500'}`}
                strokeWidth={isSelected ? 2.5 : 1}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              />

              {/* Zone name */}
              <text
                x={zone.cx}
                y={zone.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[8px] font-medium fill-slate-700 dark:fill-slate-300 pointer-events-none select-none"
              >
                {zone.name}
              </text>

              {/* Alert indicator dot */}
              {zoneAlertLevels[zone.id] && (
                <motion.circle
                  cx={zone.cx + 20}
                  cy={zone.cy - 10}
                  r="4"
                  fill={alertColor}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
              )}
            </g>
          )
        })}

        {/* Legend */}
        <g transform="translate(10, 215)">
          <rect x="0" y="0" width="8" height="8" rx="2" fill="#ef4444" />
          <text x="12" y="7" className="text-[7px] fill-slate-600 dark:fill-slate-400">Épidémie</text>

          <rect x="60" y="0" width="8" height="8" rx="2" fill="#f59e0b" />
          <text x="72" y="7" className="text-[7px] fill-slate-600 dark:fill-slate-400">Alerte</text>

          <rect x="110" y="0" width="8" height="8" rx="2" fill="#22c55e" />
          <text x="122" y="7" className="text-[7px] fill-slate-600 dark:fill-slate-400">Veille</text>

          <rect x="155" y="0" width="8" height="8" rx="2" fill="#94a3b8" />
          <text x="167" y="7" className="text-[7px] fill-slate-600 dark:fill-slate-400">Normal</text>
        </g>
      </svg>
    </div>
  )
}
