'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Locale } from '@/i18n/config'
import { locales, defaultLocale, detectLocale, saveLocale } from '@/i18n/config'

type Messages = Record<string, unknown>

interface I18nContextType {
  locale: Locale
  messages: Messages
  setLocale: (locale: Locale) => void
  t: (key: string, fallback?: string) => string
  tArray: (key: string) => string[]
}

const I18nContext = createContext<I18nContextType>({
  locale: defaultLocale,
  messages: {},
  setLocale: () => {},
  t: (key: string) => key,
  tArray: () => [],
})

// Message cache
const messageCache: Record<Locale, Messages | null> = {
  fr: null,
  en: null,
  msk: null,
  sus: null,
  ff: null,
}

async function loadMessages(locale: Locale): Promise<Messages> {
  if (messageCache[locale]) return messageCache[locale]!
  try {
    const messages = (await import(`@/i18n/messages/${locale}.json`)).default
    messageCache[locale] = messages
    return messages
  } catch {
    // Fallback to French
    const messages = (await import(`@/i18n/messages/fr.json`)).default
    messageCache[locale] = messages
    return messages
  }
}

/**
 * Resolve a dot-notation key from a nested object
 */
function resolveKey(obj: Messages, key: string): string | undefined {
  const parts = key.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [messages, setMessages] = useState<Messages>({})

  useEffect(() => {
    const detected = detectLocale()
    loadMessages(detected).then((msgs) => {
      setLocaleState(detected)
      setMessages(msgs)
    })
  }, [])

  const setLocale = useCallback(async (newLocale: Locale) => {
    const msgs = await loadMessages(newLocale)
    setLocaleState(newLocale)
    setMessages(msgs)
    saveLocale(newLocale)
  }, [])

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const value = resolveKey(messages, key)
      if (value !== undefined) return value
      // Try French fallback
      if (locale !== 'fr' && messageCache.fr) {
        const frValue = resolveKey(messageCache.fr, key)
        if (frValue !== undefined) return frValue
      }
      return fallback || key
    },
    [messages, locale]
  )

  const tArray = useCallback(
    (key: string): string[] => {
      const parts = key.split('.')
        let current: unknown = messages
      for (const part of parts) {
        if (current == null || typeof current !== 'object') return []
        current = (current as Record<string, unknown>)[part]
      }
      if (Array.isArray(current)) return current
      if (typeof current === 'object' && current !== null) {
        return Object.values(current) as string[]
      }
      return []
    },
    [messages]
  )

  return (
    <I18nContext.Provider value={{ locale, messages, setLocale, t, tArray }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

export function useTranslation(namespace?: string) {
  const { t, tArray, locale, setLocale, messages } = useContext(I18nContext)

  const nt = useCallback(
    (key: string, fallback?: string): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      return t(fullKey, fallback)
    },
    [t, namespace]
  )

  const ntArray = useCallback(
    (key: string): string[] => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      return tArray(fullKey)
    },
    [tArray, namespace]
  )

  return { t: nt, tArray: ntArray, locale, setLocale, messages }
}
