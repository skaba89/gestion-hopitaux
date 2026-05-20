'use client'

import { useState, useEffect } from 'react'

/**
 * Cookie Consent Banner — RGPD Compliance
 * Required for any website handling personal data in Guinea/EU context
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true,    // Always on — required for app to function
    analytics: false,   // Usage statistics
    marketing: false,   // Promotional communications
  })

  useEffect(() => {
    const consent = localStorage.getItem('healthflow-cookie-consent')
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const acceptAll = () => {
    const prefs = { essential: true, analytics: true, marketing: true }
    localStorage.setItem('healthflow-cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('healthflow-consent-date', new Date().toISOString())
    setVisible(false)
  }

  const acceptEssential = () => {
    const prefs = { essential: true, analytics: false, marketing: false }
    localStorage.setItem('healthflow-cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('healthflow-consent-date', new Date().toISOString())
    setVisible(false)
  }

  const savePreferences = () => {
    localStorage.setItem('healthflow-cookie-consent', JSON.stringify(preferences))
    localStorage.setItem('healthflow-consent-date', new Date().toISOString())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-600 shadow-2xl animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              🍪 Gestion des cookies — HealthFlow Guinée
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Nous utilisons des cookies pour assurer le fonctionnement de notre système de gestion hospitalière,
              améliorer vos expérience et respecter vos choix de confidentialité conformément au RGPD et à la loi
              guinéenne sur la protection des données (Loi L/2022/014/AN).
            </p>
            <div className="flex flex-wrap gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked disabled className="rounded" />
                <span className="font-medium">Essentiels</span>
                <span className="text-gray-500">(requis)</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(p => ({ ...p, analytics: e.target.checked }))}
                  className="rounded"
                />
                <span>Analytique</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(p => ({ ...p, marketing: e.target.checked }))}
                  className="rounded"
                />
                <span>Communication</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Tout accepter
            </button>
            <button
              onClick={savePreferences}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Sauvegarder mes choix
            </button>
            <button
              onClick={acceptEssential}
              className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Refuser tout sauf essentiels
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          En savoir plus : <a href="/privacy" className="underline hover:text-blue-600">Politique de confidentialité</a> ·{' '}
          <a href="/rgpd" className="underline hover:text-blue-600">RGPD</a>
        </p>
      </div>
    </div>
  )
}
