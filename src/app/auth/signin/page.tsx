'use client'

import React, { useCallback } from 'react'
import { Heart, Activity } from 'lucide-react'
import { SignInForm } from '@/components/auth/sign-in-form'
import { useStore } from '@/lib/store'
import { LanguageSwitcher } from '@/components/app/language-switcher'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'

export default function SignInPage() {
  const { setCurrentView, updateUser } = useStore()
  const { resolvedTheme, setTheme } = useTheme()

  const handleSuccess = useCallback(() => {
    // After successful login, go to dashboard
    setCurrentView('dashboard')
  }, [setCurrentView])

  const handlePatientPortal = useCallback(() => {
    // Navigate to patient portal
    setCurrentView('patient-portal')
  }, [setCurrentView])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/5 rounded-full blur-3xl" />
      </div>

      {/* Top bar with language & theme */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-500/20">
            <Heart className="size-4 text-white" />
          </div>
          <span className="text-white font-bold">HealthFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="text-slate-400 hover:text-white"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-xl shadow-teal-500/20 mb-4">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">HealthFlow Africa</h1>
            <p className="text-slate-400 text-sm">
              Système d&apos;Information Hospitalier
            </p>
          </div>

          {/* Sign-in card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
            <SignInForm
              onSuccess={handleSuccess}
              onPatientPortal={handlePatientPortal}
            />
          </div>

          {/* Footer */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-xs text-slate-500">
              En vous connectant, vous acceptez nos conditions d&apos;utilisation
            </p>
            <p className="text-xs text-slate-600">
              DataSphere Innovation — Fondée par Sekouna KABA
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
