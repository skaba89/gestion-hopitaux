'use client'

import { useEffect } from 'react'

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[HealthFlow] Erreur module Analyses:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Erreur - Analyses
        </h2>
        <p className="text-gray-600 mb-6">
          Le module d&apos;analyses a rencontré une erreur. Veuillez réessayer ou contacter le support technique si le problème persiste.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg text-left">
            <p className="text-sm text-orange-800 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Réessayer
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  )
}
