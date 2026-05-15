'use client'

import { useEffect } from 'react'

export default function MaternityError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[HealthFlow] Erreur module Maternité:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Erreur - Maternité
        </h2>
        <p className="text-gray-600 mb-6">
          Le module maternité a rencontré une erreur. Veuillez réessayer ou contacter le support technique si le problème persiste.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-pink-50 rounded-lg text-left">
            <p className="text-sm text-pink-800 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
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
