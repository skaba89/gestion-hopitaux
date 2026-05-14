'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  gradient: string
  iconBg: string
  iconColor: string
  delay?: number
}

export function KPICard({
  title, value, subtitle, icon: Icon, trend, trendUp = true,
  gradient, iconBg, iconColor, delay = 0,
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg transition-all duration-200 rounded-xl h-full">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {title}
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {value}
              </p>
              <div className="flex items-center gap-1.5">
                {trend && (
                  <>
                    {trendUp ? (
                      <TrendingUp className="size-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="size-3.5 text-rose-500" />
                    )}
                    <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {trend}
                    </span>
                  </>
                )}
                {subtitle && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</span>
                )}
              </div>
            </div>
            <div className={`flex items-center justify-center size-12 rounded-xl ${iconBg}`}>
              <Icon className={`size-6 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Preset configurations for common KPI types
export const kpiPresets = {
  clinical: {
    gradient: 'from-blue-500 to-indigo-500',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  financial: {
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  alert: {
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  management: {
    gradient: 'from-purple-500 to-fuchsia-500',
    iconBg: 'bg-purple-50 dark:bg-purple-950/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  critical: {
    gradient: 'from-rose-500 to-red-500',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  occupancy: {
    gradient: 'from-teal-500 to-cyan-500',
    iconBg: 'bg-teal-50 dark:bg-teal-950/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
}
