'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Phone, Shield, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OTPInput } from '@/components/auth/otp-input'
import { useAuthStore } from '@/lib/auth-store'
import { useStore } from '@/lib/store'

type Step = 'phone' | 'otp'

interface SignInFormProps {
  onSuccess?: () => void
  onPatientPortal?: () => void
}

export function SignInForm({ onSuccess, onPatientPortal }: SignInFormProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuthStore()
  const { updateUser } = useStore()
  const verifyingRef = useRef(false)

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && !isLoading && !verifyingRef.current) {
      verifyingRef.current = true
      doVerifyOtp(otp)
    }
  }, [otp, isLoading])

  const doVerifyOtp = async (code: string) => {
    if (code.length !== 6) {
      verifyingRef.current = false
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const normalizedPhone = `+224${phone.replace(/\D/g, '').slice(-9)}`

      const response = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ phone: normalizedPhone, otp: code }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.error || 'Code OTP invalide')
        setOtp('')
        return
      }

      // Login successful
      const user = result.data
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        establishmentId: user.establishmentId,
      })

      // Also update the app store user
      updateUser({
        name: user.name,
        role: user.role,
        establishment: user.establishmentId || 'H\u00f4pital Donka',
        email: user.email,
        phone: user.phone,
      })

      onSuccess?.()
    } catch {
      setError('Erreur de connexion. Veuillez r\u00e9essayer.')
      setOtp('')
    } finally {
      setIsLoading(false)
      verifyingRef.current = false
    }
  }

  const handleSendOtp = useCallback(async () => {
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      setError('Veuillez entrer un num\u00e9ro de t\u00e9l\u00e9phone valide')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ phone: `+224${phone.replace(/\D/g, '').slice(-9)}` }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Erreur lors de l'envoi du code")
        return
      }

      setStep('otp')
      setCountdown(60)

      // In demo mode, auto-fill the OTP
      if (result.data?.otp) {
        setTimeout(() => setOtp(result.data.otp), 500)
      }
    } catch {
      setError('Erreur de connexion. Veuillez r\u00e9essayer.')
    } finally {
      setIsLoading(false)
    }
  }, [phone])

  const handleResendOtp = useCallback(async () => {
    if (countdown > 0) return
    setOtp('')
    setError(null)
    await handleSendOtp()
  }, [countdown, handleSendOtp])

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(-9)
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3">
        <div className={`flex items-center gap-2 ${step === 'phone' ? 'text-teal-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'phone' ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}>
            1
          </div>
          <span className="text-sm font-medium hidden sm:inline">T\u00e9l\u00e9phone</span>
        </div>
        <div className="w-8 h-px bg-slate-300 dark:bg-slate-600" />
        <div className={`flex items-center gap-2 ${step === 'otp' ? 'text-teal-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'otp' ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}>
            2
          </div>
          <span className="text-sm font-medium hidden sm:inline">V\u00e9rification</span>
        </div>
      </div>

      {/* Phone Step */}
      {step === 'phone' && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/30 mb-2">
              <Phone className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Connexion</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Entrez votre num\u00e9ro de t\u00e9l\u00e9phone pour recevoir un code de v\u00e9rification
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Num\u00e9ro de t\u00e9l\u00e9phone
            </Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300">
                \uD83C\uDDEC\uD83C\uDDF3 +224
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="622 11 22 33"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setPhone(digits.slice(-9))
                }}
                className="flex-1 h-11 text-base"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            onClick={handleSendOtp}
            disabled={isLoading || phone.replace(/\D/g, '').length < 9}
            className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Shield className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Envoi en cours...' : 'Envoyer le code'}
          </Button>
        </div>
      )}

      {/* OTP Step */}
      {step === 'otp' && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/30 mb-2">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">V\u00e9rification</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Entrez le code envoy\u00e9 au <span className="font-medium text-slate-700 dark:text-slate-300">+224 {formatPhoneDisplay(phone)}</span>
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center block">
              Code \u00e0 6 chiffres
            </Label>
            <OTPInput
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStep('phone'); setOtp(''); setError(null) }}
              className="text-slate-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isLoading}
              className="text-teal-600 hover:text-teal-700"
            >
              {countdown > 0
                ? `Renvoi dans ${countdown}s`
                : 'Renvoyer le code'}
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              V\u00e9rification en cours...
            </div>
          )}
        </div>
      )}

      {/* Patient Portal Link */}
      {onPatientPortal && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onPatientPortal}
            className="w-full text-center text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
          >
            \uD83D\uDCF1 Espace Patient \u2014 Acc\u00e9der au portail
          </button>
        </div>
      )}
    </div>
  )
}
