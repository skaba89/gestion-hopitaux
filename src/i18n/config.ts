// HealthFlow Africa - i18n Configuration
// Supports: French (default), English, Malinké, Soussou, Poular

export type Locale = 'fr' | 'en' | 'msk' | 'sus' | 'ff'

export interface LocaleConfig {
  code: Locale
  label: string
  flag: string
  direction: 'ltr' | 'rtl'
}

export const locales: LocaleConfig[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'en', label: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'msk', label: 'Maninka', flag: '🇬🇳', direction: 'ltr' },
  { code: 'sus', label: 'Sosso', flag: '🇬🇳', direction: 'ltr' },
  { code: 'ff', label: 'Pulaar', flag: '🇬🇳', direction: 'ltr' },
]

export const defaultLocale: Locale = 'fr'

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  msk: 'Maninka',
  sus: 'Sosso',
  ff: 'Pulaar',
}

/**
 * Detect locale from browser settings
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const stored = localStorage.getItem('healthflow-locale') as Locale | null
  if (stored && locales.some((l) => l.code === stored)) {
    return stored
  }

  const browserLang = navigator.language.split('-')[0]
  if (locales.some((l) => l.code === browserLang)) {
    return browserLang as Locale
  }

  return defaultLocale
}

/**
 * Save locale preference
 */
export function saveLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('healthflow-locale', locale)
  }
}
