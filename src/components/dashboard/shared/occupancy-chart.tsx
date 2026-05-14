'use client'

import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface OccupancyDataItem {
  name: string
  occupancy: number
  totalBeds: number
  occupiedBeds: number
}

interface OccupancyChartProps {
  data: OccupancyDataItem[]
  title?: string
  description?: string
  warningThreshold?: number
  criticalThreshold?: number
}

function getOccupancyColor(rate: number): string {
  if (rate >= 95) return '#ef4444'
  if (rate >= 80) return '#f59e0b'
  if (rate >= 60) return '#14b8a6'
  return '#10b981'
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: OccupancyDataItem }>; label?: string }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
      <p className="text-sm" style={{ color: getOccupancyColor(data.occupancy) }}>
        {data.occupancy}% occupation
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {data.occupiedBeds}/{data.totalBeds} lits
      </p>
    </div>
  )
}

export function OccupancyChart({
  data,
  title = 'Taux d\'occupation des lits',
  description = 'Par service',
  warningThreshold = 80,
  criticalThreshold = 95,
}: OccupancyChartProps) {
  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 h-full rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={warningThreshold} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={1} />
              <ReferenceLine y={criticalThreshold} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} />
              <Bar dataKey="occupancy" radius={[4, 4, 0, 0]} maxBarSize={40} name="Occupation">
                {data.map((entry, index) => (
                  <Cell key={index} fill={getOccupancyColor(entry.occupancy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
