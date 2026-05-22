'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, Shield, ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff,
  Heart, User, ChevronRight, KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OTPInput } from '@/components/auth/otp-input'
import { useAuthStore } from '@/lib/auth-store'
import { useStore } from '@/lib/store'
import { demoUsers, roleDisplayNames, roleColors } from '@/lib/demo-users'
import { useTranslation } from '@/i18n/provider'

type LoginTab = 'email' | 'phone'
type PhoneStep = 'phone' | 'otp'

export function SignInPage() {
  const { t } = useTranslation('auth')
  const [activeTab, setActiveTab] = useState<LoginTab>('email')

  // Email login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)

  // Phone login state
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const verifyingRef = useRef(false)

  const { login } = useAuthStore()
  const { updateUser } = useStore()

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && !phoneLoading && !verifyingRef.current) {
      verifyingRef.current = true
      doVerifyOtp(otp)
    }
  }, [otp, phoneLoading])

  // ─── Email + Password Login ───
  const handleEmailLogin = useCallback(async () => {
    if (!email || !password) {
      setEmailError('Veuillez remplir tous les champs')
      return
    }

    setEmailLoading(true)
    setEmailError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setEmailError(result.error || 'Identifiants invalides')
        return
      }

      const user = result.data
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        establishmentId: user.establishmentId || '',
      })

      updateUser({
        name: user.name,
        role: roleDisplayNames[user.role] || user.role,
        establishment: user.establishmentName || 'Hôpital Donka',
        email: user.email,
        phone: user.phone || '',
      })
    } catch {
      setEmailError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setEmailLoading(false)
    }
  }, [email, password, login, updateUser])

  // ─── Phone + OTP Login ───
  const handleSendOtp = useCallback(async () => {
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      setPhoneError('Veuillez entrer un numéro de téléphone valide')
      return
    }

    setPhoneLoading(true)
    setPhoneError(null)

    try {
      const normalizedPhone = `+224${phone.replace(/\D/g, '').slice(-9)}`
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ phone: normalizedPhone }),
      })

      const result = await response.json()

      if (!response.ok) {
        setPhoneError(result.error || "Erreur lors de l'envoi du code")
        return
      }

      setPhoneStep('otp')
      setCountdown(60)

      // In demo mode, auto-fill the OTP
      if (result.data?.otp) {
        setTimeout(() => setOtp(result.data.otp), 500)
      }
    } catch {
      setPhoneError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setPhoneLoading(false)
    }
  }, [phone])

  const doVerifyOtp = async (code: string) => {
    if (code.length !== 6) {
      verifyingRef.current = false
      return
    }

    setPhoneLoading(true)
    setPhoneError(null)

    try {
      const normalizedPhone = `+224${phone.replace(/\D/g, '').slice(-9)}`
      const response = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ phone: normalizedPhone, otp: code }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setPhoneError(result.error || 'Code OTP invalide')
        setOtp('')
        return
      }

      const user = result.data
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        establishmentId: user.establishmentId,
      })

      updateUser({
        name: user.name,
        role: roleDisplayNames[user.role] || user.role,
        establishment: user.establishmentName || 'Hôpital Donka',
        email: user.email,
        phone: user.phone,
      })
    } catch {
      setPhoneError('Erreur de connexion. Veuillez réessayer.')
      setOtp('')
    } finally {
      setPhoneLoading(false)
      verifyingRef.current = false
    }
  }

  // ─── Quick Demo Login ───
  const handleDemoLogin = useCallback(async (demoUser: typeof demoUsers[0]) => {
    setEmailLoading(true)
    setEmailError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ email: demoUser.email, password: demoUser.password }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setEmailError(result.error || 'Erreur de connexion démo')
        return
      }

      const user = result.data
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        establishmentId: user.establishmentId,
      })

      updateUser({
        name: user.name,
        role: roleDisplayNames[user.role] || user.role,
        establishment: user.establishmentName || 'Hôpital Donka',
        email: user.email,
        phone: user.phone,
      })
    } catch {
      setEmailError('Erreur de connexion démo')
    } finally {
      setEmailLoading(false)
    }
  }, [login, updateUser])

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(-9)
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/30 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Branding & Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
              <Heart className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">HealthFlow</h1>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-medium tracking-wider uppercase">Guinea</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              Système d'Information<br />Hospitalier de Guinée
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              Plateforme intégrée de gestion hospitalière pour les établissements de santé
              de Guinée. Gestion des patients, consultations, pharmacie, laboratoire et bien plus encore.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Patients', value: '10K+', icon: '👥' },
              { label: 'Consultations', value: '50K+', icon: '🩺' },
              { label: 'Établissements', value: '150+', icon: '🏥' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-2 py-1 rounded bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-medium">v2.0</span>
            <span>DataSphere Innovation</span>
          </div>
        </motion.div>

        {/* Right: Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 pt-6">
              <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
                <Heart className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">HealthFlow</h1>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium tracking-wider uppercase">Guinea</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Tab Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'email'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Mail className="size-4" />
                  Email
                </button>
                <button
                  onClick={() => setActiveTab('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'phone'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Phone className="size-4" />
                  Téléphone
                </button>
              </div>

              {/* Email + Password Form */}
              <AnimatePresence mode="wait">
                {activeTab === 'email' && (
                  <motion.div
                    key="email-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="text-center space-y-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {t('signIn', 'Connexion')}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('enterCredentials', 'Entrez vos identifiants')}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="nom@healthflow-gn.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setEmailError(null) }}
                            className="pl-10 h-11 text-base"
                            disabled={emailLoading}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Mot de passe
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setEmailError(null) }}
                            className="pl-10 pr-10 h-11 text-base"
                            disabled={emailLoading}
                            onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {emailError && (
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                        {emailError}
                      </div>
                    )}

                    <Button
                      onClick={handleEmailLogin}
                      disabled={emailLoading || !email || !password}
                      className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium"
                    >
                      {emailLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <KeyRound className="w-5 h-5 mr-2" />
                      )}
                      {emailLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </Button>
                  </motion.div>
                )}

                {/* Phone + OTP Form */}
                {activeTab === 'phone' && (
                  <motion.div
                    key="phone-form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Phone Step */}
                    {phoneStep === 'phone' && (
                      <>
                        <div className="text-center space-y-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Connexion par téléphone</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Entrez votre numéro pour recevoir un code
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Numéro de téléphone
                          </Label>
                          <div className="flex gap-2">
                            <div className="flex items-center px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300">
                              🇬🇳 +224
                            </div>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="622 11 22 33"
                              value={formatPhoneDisplay(phone)}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '')
                                setPhone(digits.slice(-9))
                                setPhoneError(null)
                              }}
                              className="flex-1 h-11 text-base"
                              disabled={phoneLoading}
                              autoFocus
                            />
                          </div>
                        </div>

                        {phoneError && (
                          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                            {phoneError}
                          </div>
                        )}

                        <Button
                          onClick={handleSendOtp}
                          disabled={phoneLoading || phone.replace(/\D/g, '').length < 9}
                          className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium"
                        >
                          {phoneLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          ) : (
                            <Shield className="w-5 h-5 mr-2" />
                          )}
                          {phoneLoading ? 'Envoi en cours...' : 'Envoyer le code'}
                        </Button>
                      </>
                    )}

                    {/* OTP Step */}
                    {phoneStep === 'otp' && (
                      <>
                        <div className="text-center space-y-1">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/30 mb-2">
                            <Shield className="w-6 h-6 text-teal-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Vérification</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Code envoyé au <span className="font-medium text-slate-700 dark:text-slate-300">+224 {formatPhoneDisplay(phone)}</span>
                          </p>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center block">
                            Code à 6 chiffres
                          </Label>
                          <OTPInput
                            value={otp}
                            onChange={setOtp}
                            disabled={phoneLoading}
                            autoFocus
                          />
                        </div>

                        {phoneError && (
                          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                            {phoneError}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setPhoneStep('phone'); setOtp(''); setPhoneError(null) }}
                            className="text-slate-500"
                          >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Retour
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (countdown <= 0) {
                                setOtp('')
                                setPhoneError(null)
                                handleSendOtp()
                              }
                            }}
                            disabled={countdown > 0 || phoneLoading}
                            className="text-teal-600 hover:text-teal-700"
                          >
                            {countdown > 0
                              ? `Renvoi dans ${countdown}s`
                              : 'Renvoyer le code'}
                          </Button>
                        </div>

                        {phoneLoading && (
                          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Vérification en cours...
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Demo Accounts Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 text-center uppercase tracking-wider">
                  Comptes de démonstration
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoUsers.map((demoUser) => (
                    <button
                      key={demoUser.id}
                      onClick={() => handleDemoLogin(demoUser)}
                      disabled={emailLoading}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-300 dark:hover:border-teal-700 transition-all text-left group disabled:opacity-50"
                    >
                      <div className={`flex items-center justify-center size-8 rounded-lg bg-gradient-to-br ${roleColors[demoUser.role]} text-white shrink-0`}>
                        <User className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate group-hover:text-teal-700 dark:group-hover:text-teal-300">
                          {demoUser.firstName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {roleDisplayNames[demoUser.role]}
                        </p>
                      </div>
                      <ChevronRight className="size-3 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
            DataSphere Innovation &copy; {new Date().getFullYear()} &mdash; HealthFlow Guinea
          </div>
        </motion.div>
      </div>
    </div>
  )
}
