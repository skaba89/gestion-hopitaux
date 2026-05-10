'use client'

import React from 'react'
import { useI18n } from '@/i18n/provider'
import { locales, type Locale } from '@/i18n/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
      <SelectTrigger className="w-auto gap-1 h-8 border-none bg-transparent shadow-none hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">
        <span className="text-base leading-none">
          {locales.find((l) => l.code === locale)?.flag || '🌐'}
        </span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <span className="flex items-center gap-2">
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
