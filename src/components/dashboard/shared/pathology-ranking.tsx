'use client'

import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Stethoscope, TrendingUp, TrendingDown } from 'lucide-react'

interface PathologyDataItem {
  name: string
  cases: number
  trend?: number
  color: string
}

interface PathologyRankingProps {
  data: PathologyDataItem[]
  title?: string
  description?: string
  limit?: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: PathologyDataItem }> }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1">{data.name}</p>
      <p className="text-sm" style={{ color: data.color }}>
        {data.cases.toLocaleString('fr-FR')} cas
      </p>
      {data.trend !== undefined && (
        <p className={`text-xs flex items-center gap-1 ${data.trend > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
          {data.trend > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {data.trend > 0 ? '+' : ''}{data.trend}% vs mois dernier
        </p>
      )}
    </div>
  )
}

export function PathologyRanking({
  data,
  title = 'Top Pathologies',
  description = 'Classement par nombre de cas',
  limit = 5,
}: PathologyRankingProps) {
  const limitedData = data.slice(0, limit)

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 h-full rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-purple-50 dark:bg-purple-950/40">
            <Stethoscope className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={limitedData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cases" radius={[0, 4, 4, 0]} maxBarSize={24} name="Cas">
                {limitedData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Simplified list version for sidebars
export function PathologyList({ data, limit = 5 }: { data: PathologyDataItem[]; limit?: number }) {
  const limitedData = data.slice(0, limit)
  const maxCases = limitedData[0]?.cases || 1

  return (
    <div className="space-y-3">
      {limitedData.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06 }}
          className="group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-md text-xs font-bold text-white" style={{ backgroundColor: item.color }}>
                {index + 1}
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {item.cases.toLocaleString('fr-FR')} cas
              </span>
              {item.trend !== undefined && (
                <span className={`text-xs flex items-center gap-0.5 ${item.trend > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {item.trend > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {Math.abs(item.trend)}%
                </span>
              )}
            </div>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.cases / maxCases) * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
