'use client'

import { Construction } from 'lucide-react'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 mb-6">
        <Construction className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
        Module en cours de développement. Cette section sera bientôt disponible avec toutes les fonctionnalités prévues.
      </p>
    </div>
  )
}
