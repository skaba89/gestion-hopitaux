'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Activity,
  Baby,
  BarChart3,
  Bed,
  Building2,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  Cloud,
  Database,
  Facebook,
  Film,
  Globe,
  Globe2,
  GraduationCap,
  Handshake,
  Heart,
  Hospital,
  Landmark,
  Lightbulb,
  Linkedin,
  MapPin,
  Microscope,
  Pickaxe,
  Moon,
  Package,
  Phone,
  Pill,
  Receipt,
  Bot,
  Scale,
  ScatterChart,
  ShieldAlert,
  Signal,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Target,
  TrendingUp,
  Truck,
  Twitter,
  Users,
  Video,
  Wheat,
  X,
  Zap,
  ArrowRight,
  Check,
  Menu,
  Mail,
  Award,
  Cpu,
  LayoutGrid,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/lib/store'

/* ─────────── Animation Variants ─────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

/* ─────────── Scroll-Reveal Wrapper ─────────── */

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────── Navigation Bar ─────────── */

function Navbar({ onDemoClick }: { onDemoClick: () => void }) {
  const { resolvedTheme, setTheme } = useTheme()
  const { setCurrentView } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'Services', href: '#services' },
    { label: 'Démo', href: '#demo' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#accueil" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-shadow">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-slate-900 dark:text-white">
                HealthFlow
              </span>
              <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 leading-tight tracking-wider uppercase">
                Guinea
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              link.label === 'Démo' ? (
                <button
                  key={link.label}
                  onClick={onDemoClick}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/30"
              aria-label="Changer le thème"
            >
              <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* CTA buttons */}
            <Button
              variant="outline"
              onClick={() => setCurrentView('patient-portal')}
              className="hidden lg:inline-flex border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all"
            >
              Espace Patient
            </Button>
            <Button
              onClick={() => setCurrentView('dashboard')}
              className="hidden lg:inline-flex bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
            >
              Connexion
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600 dark:text-slate-300"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 space-y-2">
                <Button
                  variant="outline"
                  onClick={() => { setMobileOpen(false); setCurrentView('patient-portal') }}
                  className="w-full border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                >
                  Espace Patient
                </Button>
                <Button
                  onClick={() => { setMobileOpen(false); setCurrentView('dashboard') }}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg"
                >
                  Connexion
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

/* ─────────── Hero Section ─────────── */

function HeroSection({ onDemoClick }: { onDemoClick: () => void }) {
  const { setCurrentView } = useStore()
  return (
    <section id="accueil" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-teal-200/40 to-emerald-200/40 dark:from-teal-900/20 dark:to-emerald-900/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-200/30 to-teal-200/30 dark:from-emerald-900/15 dark:to-teal-900/15 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Badge className="mb-6 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 px-4 py-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Système d&apos;Information Hospitalier #1 en Guinée
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              Le futur de la{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                santé en Guinée
              </span>{' '}
              commence ici
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Transformez votre établissement de santé avec notre plateforme numérique complète.
              Gestion des patients, laboratoire, pharmacie, téléconsultation et bien plus encore.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setCurrentView('dashboard')}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all text-base px-8 h-12"
              >
                Essayer gratuitement
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onDemoClick}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-300 dark:hover:border-teal-700 text-base px-8 h-12"
              >
                <PlayCircle className="w-5 h-5 mr-1.5" />
                Voir la démo
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentView('patient-portal')}
                className="border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-base px-8 h-12"
              >
                Espace Patient
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Gratuit pour les petits centres</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Conforme aux normes OMS</span>
              </div>
            </div>
          </motion.div>

          {/* Right illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main illustration card */}
              <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 rounded-3xl p-8 border border-teal-100 dark:border-teal-900/50 shadow-2xl">
                {/* Abstract medical shapes */}
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  {/* Central pulse ring */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-8 rounded-full border-2 border-teal-300/50 dark:border-teal-600/30"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute inset-16 rounded-full border-2 border-emerald-300/50 dark:border-emerald-600/30"
                  />

                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-teal-500/30"
                    >
                      <Stethoscope className="w-12 h-12 text-white" />
                    </motion.div>
                  </div>

                  {/* Floating icons around the center */}
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-4 right-8 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
                  >
                    <Heart className="w-7 h-7 text-red-500" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [5, -5, 5] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/4 left-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
                  >
                    <Activity className="w-7 h-7 text-teal-500" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute bottom-8 left-8 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
                  >
                    <Pill className="w-7 h-7 text-emerald-500" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [5, -5, 5] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    className="absolute bottom-4 right-4 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
                  >
                    <BarChart3 className="w-7 h-7 text-amber-500" />
                  </motion.div>
                </div>
              </div>

              {/* Floating stat cards */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <Hospital className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">45+</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hôpitaux connectés</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">120K+</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Patients gérés</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-1/2 -right-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">500K+</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Consultations</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Mobile stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:hidden mt-12 grid grid-cols-3 gap-3"
        >
          {[
            { icon: Hospital, value: '45+', label: 'Hôpitaux connectés', color: 'teal' },
            { icon: Users, value: '120K+', label: 'Patients gérés', color: 'emerald' },
            { icon: Calendar, value: '500K+', label: 'Consultations', color: 'amber' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 text-center border border-slate-100 dark:border-slate-700"
            >
              <div
                className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                  stat.color === 'teal'
                    ? 'bg-teal-100 dark:bg-teal-900/50'
                    : stat.color === 'emerald'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50'
                    : 'bg-amber-100 dark:bg-amber-900/50'
                }`}
              >
                <stat.icon
                  className={`w-5 h-5 ${
                    stat.color === 'teal'
                      ? 'text-teal-600 dark:text-teal-400'
                      : stat.color === 'emerald'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────── PlayCircle icon (inline to avoid import issues) ─────────── */
function PlayCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  )
}

/* ─────────── Trusted By Section ─────────── */

function TrustedBySection() {
  const partners = [
    { name: 'Ministère de la Santé', sub: 'Guinée', icon: Building2 },
    { name: 'OMS', sub: 'Organisation Mondiale de la Santé', icon: Globe },
    { name: 'UNICEF', sub: 'Pour chaque enfant', icon: Heart },
    { name: 'Banque Mondiale', sub: 'Groupe de la Banque Mondiale', icon: TrendingUp },
  ]

  return (
    <section className="py-16 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/50">
      <Reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            Ils nous font confiance
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner) => (
              <motion.div
                key={partner.name}
                whileHover={{ scale: 1.03 }}
                className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center border border-slate-100 dark:border-slate-700">
                  <partner.icon className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{partner.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{partner.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ─────────── Features Section ─────────── */

function FeaturesSection() {
  const features = [
    { icon: Users, title: 'Gestion Patients', desc: 'Dossiers médicaux complets, historique, allergies et antécédents centralisés pour chaque patient.' },
    { icon: Calendar, title: 'Rendez-vous & Consultations', desc: 'Planification intelligente, agenda médecin, rappels SMS et suivi complet des consultations.' },
    { icon: Microscope, title: 'Laboratoire', desc: 'Gestion des demandes, résultats avec validation biologique et catalogage des analyses.' },
    { icon: Pill, title: 'Pharmacie & Stock', desc: 'Suivi des stocks en temps réel, alertes de rupture, traçabilité des lots et péremptions.' },
    { icon: Bed, title: 'Hospitalisation & Urgences', desc: 'Gestion des lits, admissions, triage urgence 5 couleurs et suivi hospitalier complet.' },
    { icon: Baby, title: 'Maternité & Vaccination', desc: 'Suivi de grossesse, accouchements, carnet de vaccination conforme au PEV guinéen.' },
    { icon: Receipt, title: 'Facturation & Paiements', desc: 'Facturation automatique, prise en charge assurance et paiements Mobile Money.' },
    { icon: Video, title: 'Téléconsultation', desc: 'Consultations à distance sécurisées, messagerie chiffrée et partage de documents.' },
    { icon: BarChart3, title: 'Dashboard Santé', desc: 'Tableaux de bord en temps réel, KPIs personnalisables et rapports décisionnels.' },
    { icon: ShieldAlert, title: 'Alertes Santé Publique', desc: 'Surveillance épidémiologique, détection d\'anomalies et alertes sanitaires automatiques.' },
  ]

  return (
    <section id="services" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              10 Modules Intégrés
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-4">
              Une plateforme{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                complète
              </span>{' '}
              pour vos besoins
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Du dossier patient à la surveillance épidémiologique, HealthFlow couvre tous les aspects
              de la gestion hospitalière moderne.
            </p>
          </div>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group h-full"
              >
                <Card className="h-full border-slate-200 dark:border-slate-700/50 hover:border-teal-300 dark:hover:border-teal-700 transition-colors shadow-sm hover:shadow-xl hover:shadow-teal-500/5 bg-white dark:bg-slate-900/50">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-shadow mb-2">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {feature.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────── How It Works ─────────── */

function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Déployez',
      desc: 'Installez HealthFlow dans votre établissement en quelques heures. Notre équipe vous accompagne sur site ou à distance.',
      icon: Hospital,
      color: 'from-teal-500 to-teal-600',
    },
    {
      num: '02',
      title: 'Configurez',
      desc: 'Paramétrez les rôles, workflows et modules selon vos besoins. L\'interface intuitive ne nécessite aucune compétence technique.',
      icon: ClipboardCheck,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      num: '03',
      title: 'Transformez',
      desc: 'Vivez la transformation numérique de vos services de santé. Améliorez l\'efficacité et la qualité des soins.',
      icon: Sparkles,
      color: 'from-teal-600 to-emerald-500',
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
              Simple & Rapide
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-4">
              Comment ça{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                marche
              </span>{' '}
              ?
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Déployez, configurez et transformez votre établissement en trois étapes simples.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.15}>
              <div className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[calc(50%+80px)] w-[calc(100%-160px)] h-0.5 bg-gradient-to-r from-teal-300 to-emerald-300 dark:from-teal-700 dark:to-emerald-700" />
                )}
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 5 }}
                    className="w-32 h-32 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-100 dark:border-teal-900/50 flex items-center justify-center mx-auto shadow-lg"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  <div className="mt-6">
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                      Étape {step.num}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────── Stat Card Component (separate for hooks) ─────────── */

function StatCard({
  value,
  suffix,
  label,
  icon: Icon,
  decimals,
  delay,
}: {
  value: number
  suffix: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  decimals?: number
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [count, setCount] = useState(0)
  const endValue = Math.floor(value * (decimals ? 10 : 1))

  useEffect(() => {
    if (!isInView) return
    const startTime = performance.now()
    const duration = 2000

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * endValue))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, endValue])

  return (
    <Reveal delay={delay}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 lg:p-8 text-center border border-white/20 hover:bg-white/15 transition-colors"
        ref={ref}
      >
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="text-4xl lg:text-5xl font-bold text-white">
          {decimals ? (count / 10).toFixed(1) : count}
          {suffix}
        </div>
        <p className="mt-2 text-sm text-teal-100 font-medium">{label}</p>
      </motion.div>
    </Reveal>
  )
}

/* ─────────── Statistics / Impact Section ─────────── */

function StatsSection() {
  const stats = [
    { value: 99.9, suffix: '%', label: 'Uptime garanti', icon: Activity, decimals: 1 },
    { value: 45, suffix: '+', label: 'Hôpitaux connectés', icon: Hospital },
    { value: 120, suffix: 'K+', label: 'Patients gérés', icon: Users },
    { value: 30, suffix: '%', label: 'Réduction temps d\'attente', icon: TrendingUp },
  ]

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-emerald-700" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Notre impact en chiffres
            </h2>
            <p className="mt-4 text-lg text-teal-100 max-w-2xl mx-auto">
              Des résultats concrets qui témoignent de la transformation numérique du système de santé guinéen.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              icon={stat.icon}
              decimals={stat.decimals}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────── Testimonials Section ─────────── */

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Dr. Mamadou Diallo',
      role: 'Directeur, Hôpital Donka',
      content:
        'HealthFlow a révolutionné la gestion de notre hôpital. Nous avons réduit les temps d\'attente de 40% et amélioré significativement le suivi des patients. C\'est un véritable changement de paradigme.',
      rating: 5,
    },
    {
      name: 'Dr. Aissatou Bah',
      role: 'Chef de Service Maternité',
      content:
        'Le module de maternité est exceptionnel. Le suivi des grossesses et la vaccination sont désormais parfaitement organisés. Nos patientes reçoivent des rappels SMS et le taux de suivi a doublé.',
      rating: 5,
    },
    {
      name: 'Abdoulaye Touré',
      role: 'Directeur, Clinique Pasteur',
      content:
        'La facturation intégrée avec Mobile Money a transformé nos recettes. Les stocks de pharmacie sont gérés en temps réel et nous n\'avons plus de ruptures imprévues. Un investissement rentabilisé en 3 mois.',
      rating: 5,
    },
  ]

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
              <Star className="w-3.5 h-3.5 mr-1.5" />
              Témoignages
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-4">
              Ce que disent nos{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                utilisateurs
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Des professionnels de santé guinéens partagent leur expérience avec HealthFlow.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.15}>
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <Card className="h-full border-slate-200 dark:border-slate-700/50 hover:border-teal-300 dark:hover:border-teal-700 transition-colors shadow-sm hover:shadow-xl hover:shadow-teal-500/5 bg-white dark:bg-slate-900/50">
                  <CardHeader>
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <CardDescription className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                      &ldquo;{t.content}&rdquo;
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {t.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────── Pricing Section ─────────── */

function PricingSection() {
  const { setCurrentView } = useStore()
  const plans = [
    {
      name: 'Starter',
      price: '$250',
      currency: 'USD',
      period: '/mois',
      desc: 'Pour les petits centres de santé et dispensaires qui débutent leur transformation numérique.',
      features: [
        'Gestion patients (jusqu\'à 500)',
        'Rendez-vous & Consultations',
        'Facturation basique',
        'Dashboard standard',
        'Support email',
        '1 établissement',
      ],
      cta: 'Commencer maintenant',
      popular: false,
      gradient: false,
    },
    {
      name: 'Professionnel',
      price: '$500',
      currency: 'USD',
      period: '/mois',
      desc: 'Pour les hôpitaux et cliniques qui veulent exploiter tout le potentiel de HealthFlow.',
      features: [
        'Patients illimités',
        'Tous les 10 modules',
        'Téléconsultation',
        'Dashboard avancé & KPIs',
        'Alertes santé publique',
        'Support prioritaire 24/7',
        'Multi-départements',
        'Intégrations Mobile Money',
      ],
      cta: 'Essayer gratuitement',
      popular: true,
      gradient: true,
    },
    {
      name: 'Entreprise',
      price: 'Sur devis',
      period: '',
      desc: 'Pour les ministères de la santé et réseaux multi-établissements nécessitant une solution sur mesure.',
      features: [
        'Tout le plan Professionnel',
        'Multi-établissements',
        'Déploiement sur site / cloud',
        'Intégration systèmes nationaux',
        'API & connecteurs personnalisés',
        'Formation sur site',
        'SLA garanti 99.99%',
        'Chef de projet dédié',
      ],
      cta: 'Contacter les ventes',
      popular: false,
      gradient: false,
    },
  ]

  return (
    <section id="demo" className="py-20 lg:py-28 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
              Tarification
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-4">
              Un plan{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                adapté
              </span>{' '}
              à chaque besoin
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Des tarifs transparents, adaptés à chaque structure de santé. Évoluez selon vos besoins.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.15}>
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <Card
                  className={`h-full relative ${
                    plan.gradient
                      ? 'border-2 border-teal-500 dark:border-teal-400 shadow-xl shadow-teal-500/10'
                      : 'border-slate-200 dark:border-slate-700/50 shadow-sm'
                  } bg-white dark:bg-slate-900/50`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 px-4 py-1 shadow-lg">
                        Le plus populaire
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pt-8">
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-500 dark:text-slate-400 min-h-[40px]">
                      {plan.desc}
                    </CardDescription>
                    <div className="pt-4">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.currency && (
                        <span className="text-lg text-slate-500 dark:text-slate-400 ml-1">
                          {plan.currency}
                        </span>
                      )}
                      {plan.period && (
                        <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Separator className="mb-6" />
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => setCurrentView('dashboard')}
                      className={`w-full ${
                        plan.gradient
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                      {plan.gradient && <ArrowRight className="w-4 h-4 ml-1" />}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────── CTA Section ─────────── */

function CTASection() {
  const { setCurrentView } = useStore()
  return (
    <section id="contact" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <motion.div whileHover={{ scale: 1.02 }} className="inline-block mb-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center mx-auto border border-white/30 shadow-2xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Prêt à transformer votre établissement de santé ?
          </h2>
          <p className="mt-6 text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
            Rejoignez les 45+ établissements qui font déjà confiance à HealthFlow Guinea.
            Commencez gratuitement et découvrez le futur de la santé numérique.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setCurrentView('dashboard')}
              className="bg-white text-teal-700 hover:bg-teal-50 shadow-xl h-12 text-base px-8"
            >
              Essayer gratuitement
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 h-12 text-base px-8"
            >
              <Phone className="w-5 h-5 mr-2" />
              Nous contacter
            </Button>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-teal-100">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Configuration en 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Formation incluse</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Support 24/7</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────── Footer ─────────── */

function Footer() {
  const footerLinks = {
    Produit: ['Fonctionnalités', 'Tarification', 'Modules', 'Intégrations', 'Mises à jour'],
    Entreprise: ['À propos', 'Équipe', 'Carrières', 'Partenaires', 'Presse'],
    Ressources: ['Documentation', 'Blog', 'Webinaires', 'Guides', 'API'],
    Légal: ['Confidentialité', 'Conditions', 'Sécurité', 'RGPD', 'Mentions légales'],
  }

  const socialLinks = [
    { icon: Facebook, label: 'Facebook' },
    { icon: Twitter, label: 'Twitter' },
    { icon: Linkedin, label: 'LinkedIn' },
  ]

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-white">HealthFlow</span>
                <span className="text-[10px] font-medium text-teal-400 leading-tight tracking-wider uppercase">
                  Guinea
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Solutions numériques multi-secteurs pour l&apos;Afrique — Santé, Finance, Éducation, Administration, Énergie.
              Développé par DataSphere Innovation — France & Guinée.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Fondé par Sekouna KABA
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-slate-400 hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4 text-sm">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-slate-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; 2026 DataSphere Innovation. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Paris, France & Conakry, Guinée</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <span>contact@datasphere-innovation.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─────────── DataSphere Innovation Portfolio Section ─────────── */

function DataSpherePortfolioSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)

  const values = [
    { icon: Lightbulb, title: 'Innovation', desc: 'Nous repoussons les limites de la technologie pour transformer les secteurs clés en Afrique et en Europe.' },
    { icon: Handshake, title: 'Impact social', desc: 'Chaque solution vise à améliorer la vie des populations et le développement du continent.' },
    { icon: ShieldAlert, title: 'Sécurité', desc: 'La protection des données et la cybersécurité sont au cœur de chaque projet.' },
    { icon: Target, title: 'Excellence', desc: 'Des standards internationaux adaptés aux réalités locales africaines et européennes.' },
  ]

  const keyFigures = [
    { value: '10+', label: 'Années', sublabel: 'Expérience Data & BI' },
    { value: '8+', label: 'Grands Comptes', sublabel: 'SACEM, Thales, Accor...' },
    { value: '20+', label: 'Projets', sublabel: 'Réalisés en Afrique & Europe' },
    { value: '25+', label: 'Technologies', sublabel: 'Cloud, Data, BI, DevOps' },
  ]

  const categories = [
    { id: 'all', label: 'Tous les projets', icon: LayoutGrid },
    { id: 'govtech', label: 'GovTech', icon: Landmark },
    { id: 'education', label: 'Éducation', icon: GraduationCap },
    { id: 'health', label: 'Santé', icon: Heart },
    { id: 'telecom', label: 'Télécom', icon: Signal },
    { id: 'mines', label: 'Mines', icon: Pickaxe },
    { id: 'agritech', label: 'AgriTech', icon: Wheat },
    { id: 'logistics', label: 'Logistique', icon: Truck },
    { id: 'gis', label: 'Cartographie', icon: MapPin },
    { id: 'ai', label: 'IA & Automation', icon: Bot },
    { id: 'media', label: 'Média', icon: Film },
    { id: 'social', label: 'Social', icon: Smartphone },
    { id: 'business', label: 'Business', icon: TrendingUp },
    { id: 'food', label: 'FoodTech', icon: Package },
    { id: 'fintech', label: 'FinTech', icon: Receipt },
    { id: 'data', label: 'Data Eng.', icon: Database },
    { id: 'cloud', label: 'Cloud', icon: Cloud },
    { id: 'france', label: '🇫🇷 France', icon: Cpu },
  ]

  const projects = [
    {
      id: 'eadmin',
      name: 'eAdministration Suite',
      subtitle: 'Plateforme de Digitalisation Administrative Intégrée',
      category: 'govtech',
      flag: '🇬🇳',
      icon: Landmark,
      color: 'from-blue-500 to-indigo-600',
      features: ['GED', 'Workflows', 'Parapheur électronique', 'Portail citoyen', 'Signatures électroniques', 'Dashboards administratifs'],
      targets: 'Ministères, institutions publiques, collectivités, universités',
    },
    {
      id: 'natdata',
      name: 'National Data Platform',
      subtitle: 'Plateforme Nationale de Données & Pilotage Décisionnel',
      category: 'govtech',
      flag: '🇬🇳',
      icon: Database,
      color: 'from-cyan-500 to-blue-600',
      features: ['Data Lake', 'Data Warehouse', 'Pipelines data', 'Dashboards nationaux', 'Analytics', 'Gouvernance data', 'IA analytique'],
      targets: 'Apache Airflow, dbt, Apache Superset, Kafka, PostgreSQL',
    },
    {
      id: 'smartcity',
      name: 'SmartCity Guinea',
      subtitle: 'Plateforme de Ville Intelligente',
      category: 'govtech',
      flag: '🇬🇳',
      icon: Building2,
      color: 'from-sky-500 to-cyan-600',
      features: ['Cartographie', 'Gestion incidents urbains', 'Mobilité', 'Éclairage public', 'Participation citoyenne', 'Dashboards temps réel'],
      targets: 'Mairies, collectivités, agences urbaines',
    },
    {
      id: 'justicetech',
      name: 'JusticeTech Guinea',
      subtitle: 'Digitalisation du système judiciaire',
      category: 'govtech',
      flag: '🇬🇳',
      icon: Scale,
      color: 'from-violet-500 to-purple-600',
      features: ['Gestion dossiers judiciaires', 'Workflows magistrats', 'Audiences', 'Signatures', 'Archivage', 'Portail citoyen'],
      targets: 'Ministère de la Justice, tribunaux, cours',
    },
    {
      id: 'fingov',
      name: 'FinGov Analytics',
      subtitle: 'Pilotage Financier Public & Budgétaire',
      category: 'govtech',
      flag: '🇬🇳',
      icon: BarChart3,
      color: 'from-emerald-500 to-teal-600',
      features: ['Exécution budgétaire', 'Analytics finances publiques', 'Détection anomalies', 'Dashboards ministériels'],
      targets: 'Ministère des Finances, directions budgétaires',
    },
    {
      id: 'campus360',
      name: 'Campus360 Guinea',
      subtitle: 'Smart Campus & Université Digitale',
      category: 'education',
      flag: '🇬🇳',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-600',
      features: ['Gestion scolaire', 'Carte étudiante', 'Analytics étudiants', 'Portail parents', 'E-learning', 'Paiement Mobile Money'],
      targets: 'Universités, écoles, instituts',
    },
    {
      id: 'healthflow',
      name: 'HealthFlow Guinea',
      subtitle: 'Système d\'Information Hospitalier',
      category: 'health',
      flag: '🇬🇳',
      icon: Heart,
      color: 'from-teal-500 to-emerald-600',
      features: ['Dossier patient', 'Laboratoire', 'Pharmacie', 'Urgences', 'Téléconsultation', 'Dashboards santé'],
      targets: 'Hôpitaux, cliniques, centres de santé',
      featured: true,
    },
    {
      id: 'telecom',
      name: 'Telecom Intelligence Platform',
      subtitle: 'Monitoring QoS & Analytics Télécom',
      category: 'telecom',
      flag: '🇬🇳',
      icon: Signal,
      color: 'from-orange-500 to-red-600',
      features: ['Monitoring réseau', 'QoS', 'Heatmaps', 'Analytics abonnés', 'Incidents télécoms'],
      targets: 'ARPT Guinée, opérateurs télécoms',
    },
    {
      id: 'mineops',
      name: 'MineOps Intelligence',
      subtitle: 'Data Platform Minière & Industrielle',
      category: 'mines',
      flag: '🇬🇳',
      icon: Pickaxe,
      color: 'from-amber-500 to-orange-600',
      features: ['Production minière', 'Maintenance prédictive', 'HSE', 'Analytics industriels', 'Logistique minière'],
      targets: 'Compagnies minières, industries extractives',
    },
    {
      id: 'agridata',
      name: 'AgriData Guinea',
      subtitle: 'Agriculture Intelligente & Analytics',
      category: 'agritech',
      flag: '🇬🇳',
      icon: Wheat,
      color: 'from-lime-500 to-green-600',
      features: ['Météo', 'Suivi exploitations', 'Cartographie agricole', 'Analytics récoltes', 'IoT agricole'],
      targets: 'Ministère de l\'Agriculture, coopératives',
    },
    {
      id: 'logisticsflow',
      name: 'LogisticsFlow Africa',
      subtitle: 'Plateforme Logistique & Supply Chain',
      category: 'logistics',
      flag: '🇬🇳',
      icon: Truck,
      color: 'from-slate-500 to-zinc-600',
      features: ['Tracking flotte', 'Analytics logistiques', 'Optimisation routes', 'Suivi cargaisons', 'Dashboards supply chain'],
      targets: 'Transporteurs, logisticiens, importateurs',
    },
    {
      id: 'addressing',
      name: 'National Addressing Platform',
      subtitle: 'Adressage & Cartographie Nationale',
      category: 'gis',
      flag: '🇬🇳',
      icon: MapPin,
      color: 'from-rose-500 to-pink-600',
      features: ['Géolocalisation', 'Numérotation rues', 'QR code adresse', 'Cartographie nationale'],
      targets: 'Poste nationale, services d\'urbanisme',
    },
    {
      id: 'dsai',
      name: 'DataSphere AI Platform',
      subtitle: 'Plateforme IA Africaine Multi-services',
      category: 'ai',
      flag: '🇬🇳',
      icon: Bot,
      color: 'from-indigo-500 to-violet-600',
      features: ['Agents IA', 'OCR', 'NLP', 'Copilote administratif', 'IA générative', 'Analytics intelligents'],
      targets: 'Entreprises, administrations, institutions',
    },
    {
      id: 'traducteur',
      name: 'TraducteurPro / PolyglotVision',
      subtitle: 'Traduction Vidéo IA',
      category: 'media',
      flag: '🇬🇳',
      icon: Film,
      color: 'from-fuchsia-500 to-purple-600',
      features: ['Transcription', 'Traduction', 'Doublage voix IA', 'Sous-titrage', 'Interface web/mobile', 'Intégration ElevenLabs'],
      targets: 'Médias, producteurs, créateurs de contenu',
    },
    {
      id: 'viralai',
      name: 'Viral Content AI Suite',
      subtitle: 'SaaS IA Publication Réseaux Sociaux',
      category: 'social',
      flag: '🇬🇳',
      icon: Smartphone,
      color: 'from-pink-500 to-rose-600',
      features: ['Génération vidéos', 'Publication TikTok/YouTube/Facebook', 'IA contenu viral', 'Automation réseaux sociaux'],
      targets: 'Influenceurs, agences marketing, créateurs',
    },
    {
      id: 'kamogui',
      name: 'KAMOGUI Gold Intelligence',
      subtitle: 'CRM Investisseurs & Intelligence Marché Or',
      category: 'business',
      flag: '🇬🇳',
      icon: Star,
      color: 'from-yellow-500 to-amber-600',
      features: ['CRM investisseurs', 'Analytics marché or', 'Scoring IA', 'Dashboards premium', 'Pipeline commercial'],
      targets: 'Investisseurs, courtiers or, traders',
    },
    {
      id: 'kfmdelice',
      name: 'KFM Délice Platform',
      subtitle: 'Plateforme Restaurant & Livraison',
      category: 'food',
      flag: '🇬🇳',
      icon: Package,
      color: 'from-red-500 to-orange-600',
      features: ['Commande en ligne', 'Panier', 'Suivi commandes', 'WhatsApp', 'Paiement', 'Gestion restaurant'],
      targets: 'Restaurants, fast-foods, livraison',
    },
    {
      id: 'facturepro',
      name: 'FacturePro / GKL Logistics',
      subtitle: 'SaaS Facturation & Gestion Entreprise',
      category: 'fintech',
      flag: '🇬🇳',
      icon: Receipt,
      color: 'from-green-500 to-emerald-600',
      features: ['Factures', 'Devis', 'Paiements', 'Dashboard analytics', 'Relances automatiques', 'IA comptable'],
      targets: 'PME, TPE, auto-entrepreneurs',
    },
    {
      id: 'noc',
      name: 'NOC Conformité Platform',
      subtitle: 'Plateforme Data Engineering & Monitoring',
      category: 'data',
      flag: '🇬🇳',
      icon: ScatterChart,
      color: 'from-teal-500 to-cyan-600',
      features: ['Pipelines dbt', 'Analytics conformité', 'Dashboards Superset', 'Monitoring data', 'Gouvernance'],
      targets: 'Directions conformité, auditeurs, DPO',
    },
    {
      id: 'multicloud',
      name: 'MultiCloud Realtime Platform',
      subtitle: 'AWS / Azure / GCP / Docker',
      category: 'cloud',
      flag: '🇬🇳',
      icon: Cloud,
      color: 'from-sky-500 to-blue-600',
      features: ['Ingestion temps réel', 'Kafka', 'CDC', 'Snowflake', 'Synapse', 'BigQuery', 'PostgreSQL', 'MinIO', 'Airflow', 'MLflow'],
      targets: 'DSI, architectses data, cloud engineers',
    },
  ]

  const franceServices = [
    {
      title: 'Agents IA Entreprise',
      desc: 'Conception et déploiement d\'agents IA autonomes pour automatiser les processus métiers : classification de documents, extraction d\'informations, prise de décision assistée, et orchestration de workflows intelligents.',
      icon: Bot,
      color: 'from-violet-500 to-indigo-600',
    },
    {
      title: 'Architecture Microservices',
      desc: 'Design et mise en œuvre d\'architectures microservices évolutives avec Kubernetes, Istio, et les patterns les plus avancés : event-driven architecture, CQRS, saga pattern, et service mesh pour les entreprises françaises.',
      icon: LayoutGrid,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Data Platforms Modernes',
      desc: 'Construction de plateformes data end-to-end : data lakehouse, pipelines temps réel avec Kafka et Flink, dbt pour la transformation, et Superset/Metabase pour la visualisation. Architecture Medallion et governance complète.',
      icon: Database,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Cloud & DevOps',
      desc: 'Stratégie multi-cloud AWS/Azure/GCP, infrastructure as code avec Terraform, CI/CD avancé, monitoring avec Grafana/Prometheus, et gestion de clusters Kubernetes en production pour des entreprises à forte charge.',
      icon: Cloud,
      color: 'from-sky-500 to-blue-600',
    },
    {
      title: 'RAG & IA Générative',
      desc: 'Implémentation de systèmes RAG (Retrieval Augmented Generation) sur mesure, fine-tuning de modèles LLM, intégration de copilotes intelligents dans les outils métiers, et architectures vectorielles avec Pinecone/Weaviate.',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Modernisation Legacy',
      desc: 'Migration et modernisation de systèmes legacy vers des architectures cloud-native : décomposition de monolithes, strangler pattern, API-first design, et transition progressive avec zéro downtime garanti.',
      icon: Cpu,
      color: 'from-amber-500 to-orange-600',
    },
  ]

  const milestones = [
    { year: '2015', event: 'Master 2 SID — Université Paris 1 Sorbonne Panthéon' },
    { year: '2016-19', event: 'Consultant BI chez DPD France — Solutions décisionnelles SQL Server, Talend, Tableau' },
    { year: '2019-20', event: 'Consultant BI chez Orano, Kiloutou — Migration Snowflake, Power BI, RLS' },
    { year: '2021', event: 'Tech Lead BI / Data Engineer chez ARCADE (Keyrus) & Préfecture de Police de Paris' },
    { year: '2021-22', event: 'Consultant Data Engineer chez Accor — Data Warehouse Snowflake, dbt, Terraform' },
    { year: '2022-23', event: 'Data Architect & Consultant BI Senior chez Thales Group — GCP, Talend, Dataiku' },
    { year: '2023-24', event: 'Data Architect / Data Engineer chez MSO-SOFT — MinIO, Airflow, dbt, Superset' },
    { year: '2024', event: 'Data Architect / Data Engineer chez SACEM — Snowflake, Kafka, PySpark, Data Factory' },
    { year: '2023', event: 'Création de DataSphere Innovation à Paris et Conakry' },
    { year: '2025', event: '20+ projets déployés — 10 secteurs couverts en Afrique et en France' },
    { year: '2026', event: 'Expansion régionale + Services IA & Architecture pour entreprises françaises' },
  ]

  const filteredProjects = activeCategory === 'all'
    ? projects
    : activeCategory === 'france'
      ? []
      : projects.filter(p => p.category === activeCategory)

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
              DataSphere Innovation
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-4">
              20+ projets,{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                10 secteurs
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Fondée par Sekouna KABA, DataSphere Innovation conçoit des solutions numériques
              pour l&apos;Afrique et la France — GovTech, Santé, Finance, IA, Data Engineering
              et bien plus. De Conakry à Paris, nous transformons les secteurs clés.
            </p>
          </div>
        </Reveal>

        {/* Founder Card */}
        <Reveal>
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="border-2 border-teal-100 dark:border-teal-900/50 bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20 overflow-hidden">
              <CardContent className="p-8 lg:p-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-teal-500/20">
                      <span className="text-4xl font-bold text-white">SK</span>
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Sekouna KABA</h3>
                    <p className="text-teal-600 dark:text-teal-400 font-semibold mt-1">Fondateur & Directeur Général — Data Architect Senior</p>
                    <p className="text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                      Entrepreneur franco-guinéen, Sekouna KABA est un Data Engineer Senior et Data Architect
                      avec plus de 10 ans d&apos;expérience chez SACEM, Thales, Accor, Orano et DPD France.
                      Master 2 en Systèmes d&apos;Information et Décisionnelles de l&apos;Université Paris 1 Sorbonne Panthéon,
                      il a créé DataSphere Innovation pour accélérer la transformation numérique en Afrique et en Europe.
                      Expert en architectures Data Lake, Data Warehouse, pipelines ELT (dbt, Airflow), Cloud (AWS, Azure, GCP)
                      et solutions BI (Snowflake, Tableau, Power BI, Superset), il dirige plus de 20 projets couvrant
                      10 secteurs — de la GovTech à la FinTech, de la Santé à l&apos;IA.
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                      <Badge className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                        <MapPin className="w-3 h-3 mr-1" /> Paris, France
                      </Badge>
                      <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                        <MapPin className="w-3 h-3 mr-1" /> Conakry, Guinée
                      </Badge>
                      <Badge className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800">
                        <GraduationCap className="w-3 h-3 mr-1" /> Master 2 Sorbonne
                      </Badge>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                        <Award className="w-3 h-3 mr-1" /> 10+ ans d&apos;expérience
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Reveal>

        {/* Clients & Références */}
        <Reveal>
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">
              Clients & Références
            </h3>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Sekouna KABA a collaboré avec des entreprises majeures en France avant de fonder DataSphere Innovation.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { name: 'SACEM', role: 'Data Architect / Data Engineer', period: '2024 - Présent', color: 'from-blue-500 to-indigo-600' },
                { name: 'Thales Group', role: 'Data Architect & Consultant BI Senior', period: '2022 - 2023', color: 'from-sky-500 to-blue-600' },
                { name: 'Accor', role: 'Consultant Data Engineer / BI', period: '2021 - 2022', color: 'from-blue-600 to-violet-600' },
                { name: 'Orano (Areva)', role: 'Consultant BI', period: '2019', color: 'from-amber-500 to-orange-600' },
                { name: 'DPD France', role: 'Consultant BI', period: '2016 - 2019', color: 'from-red-500 to-rose-600' },
                { name: 'MSO-SOFT', role: 'Data Architect / Data Engineer', period: '2023 - 2024', color: 'from-emerald-500 to-teal-600' },
                { name: 'ARCADE (Keyrus)', role: 'Tech Lead BI / Data Engineer', period: '2021', color: 'from-violet-500 to-purple-600' },
                { name: 'Kiloutou', role: 'Consultant BI', period: '2019 - 2020', color: 'from-yellow-500 to-amber-600' },
              ].map((client, i) => (
                <motion.div
                  key={client.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="relative p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
                >
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${client.color}`} />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{client.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{client.role}</p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium mt-1.5">{client.period}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Technical Expertise */}
        <Reveal>
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">
              Stack Technique
            </h3>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
              Technologies maîtrisées à travers 10+ ans de missions Data & BI
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Snowflake', 'Apache Airflow', 'dbt Core', 'Docker', 'Terraform',
                'Python / PySpark', 'SQL', 'GCP / BigQuery', 'AWS S3 / Glue', 'Azure DevOps',
                'Apache Kafka', 'MinIO', 'Tableau', 'Power BI', 'Apache Superset',
                'Talend', 'Dataiku', 'GitLab CI/CD', 'PostgreSQL', 'SAP BW / Hana',
                'Oracle', 'SQL Server', 'Salesforce', 'Dynamics 365', 'Shell / Bash',
              ].map((tech, i) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  viewport={{ once: true }}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-200 dark:hover:border-teal-800 transition-colors cursor-default"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Key Figures */}
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {keyFigures.map((fig, i) => (
              <motion.div
                key={fig.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  {fig.value}
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{fig.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{fig.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </Reveal>

        {/* Category Filter */}
        <Reveal>
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-3">
              Nos projets réalisés
            </h3>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Découvrez l&apos;ensemble de nos solutions déployées en Guinée et en France, classées par secteur d&apos;activité.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* France Services Section */}
        {activeCategory === 'france' && (
          <Reveal>
            <div className="mb-16">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 mb-4">
                  <span className="text-lg">🇫🇷</span>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Services en France</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Agents IA & Architectures Modernes
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
                  DataSphere Innovation accompagne les entreprises françaises dans la mise en place
                  d&apos;agents IA, d&apos;architectures microservices et de plateformes data modernes.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {franceServices.map((svc, i) => (
                  <motion.div
                    key={svc.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${svc.color}`} />
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <svc.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{svc.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{svc.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Projects Grid */}
        {activeCategory !== 'france' && (
          <Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredProjects.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onHoverStart={() => setHoveredProject(p.id)}
                  onHoverEnd={() => setHoveredProject(null)}
                  className={`group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm hover:shadow-xl transition-all overflow-hidden ${
                    p.featured
                      ? 'border-2 border-teal-200 dark:border-teal-800 ring-1 ring-teal-100 dark:ring-teal-900/50'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  {p.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-[10px] border-0">
                        <Sparkles className="w-3 h-3 mr-1" /> Vous êtes ici
                      </Badge>
                    </div>
                  )}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.color}`} />
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <p.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{p.flag}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{p.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{p.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.features.slice(0, hoveredProject === p.id ? p.features.length : 4).map((f, fi) => (
                      <span
                        key={fi}
                        className="px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700"
                      >
                        {f}
                      </span>
                    ))}
                    {p.features.length > 4 && hoveredProject !== p.id && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[10px] font-medium text-teal-600 dark:text-teal-400">
                        +{p.features.length - 4}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Cibles :</span> {p.targets}
                  </p>
                </motion.div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Values */}
        <Reveal>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
              Nos valeurs fondatrices
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center mb-4">
                    <v.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">{v.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Timeline */}
        <Reveal>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-10">
              Notre parcours
            </h3>
            <div className="space-y-6">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="flex gap-5"
                >
                  <div className="flex-shrink-0 w-16 text-right">
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{m.year}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-teal-500 ring-4 ring-teal-100 dark:ring-teal-950" />
                    {i < milestones.length - 1 && (
                      <div className="w-0.5 h-full bg-teal-100 dark:bg-teal-900 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pb-6">{m.event}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Dual Presence */}
        <Reveal>
          <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-blue-50/50 to-slate-50 dark:from-blue-950/20 dark:to-slate-900/50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <Globe2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Paris, France
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Siège social — R&D, architecture logicielle, agents IA, architectures modernes,
                    conformité RGPD, partenariats européens et levée de fonds.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-emerald-50/50 to-slate-50 dark:from-emerald-950/20 dark:to-slate-900/50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Conakry, Guinée
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Bureau opérationnel — Déploiement terrain, formation utilisateurs, support local,
                    relations institutionnelles et 20+ projets déployés.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────── Interactive Guided Demo Modal ─────────── */

const demoSteps = [
  {
    title: 'Bienvenue sur HealthFlow Guinea',
    desc: 'Votre plateforme num\u00e9rique compl\u00e8te pour la gestion hospitali\u00e8re moderne en Guin\u00e9e. D\u00e9couvrez comment HealthFlow transforme les \u00e9tablissements de sant\u00e9.',
    icon: Heart,
    color: 'from-teal-500 to-emerald-600',
    features: ['Gestion centralis\u00e9e des patients', 'Modules sp\u00e9cialis\u00e9s pour chaque service', 'Conforme aux normes OMS', 'Adapt\u00e9 au contexte guin\u00e9en'],
    mockup: 'welcome',
  },
  {
    title: 'Tableau de bord intelligent',
    desc: 'Visualisez en temps r\u00e9el les KPIs de votre \u00e9tablissement : patients, rendez-vous, lits disponibles et urgences.',
    icon: BarChart3,
    color: 'from-teal-500 to-teal-600',
    features: ['Indicateurs en temps r\u00e9el', 'Graphiques interactifs', 'Alertes automatiques', 'Rapports personnalisables'],
    mockup: 'dashboard',
  },
  {
    title: 'Gestion des patients',
    desc: 'Dossiers m\u00e9dicaux num\u00e9riques complets avec QR code, historique, allergies et ant\u00e9c\u00e9dents centralis\u00e9s.',
    icon: Users,
    color: 'from-emerald-500 to-emerald-600',
    features: ['QR code d\'identification', 'Historique m\u00e9dical complet', 'Gestion des allergies', 'Recherche avanc\u00e9e'],
    mockup: 'patients',
  },
  {
    title: 'Rendez-vous & Consultations',
    desc: 'Planification intelligente avec agenda m\u00e9decin, rappels SMS et suivi complet des consultations.',
    icon: Calendar,
    color: 'from-amber-500 to-amber-600',
    features: ['Agenda m\u00e9decin interactif', 'Rappels SMS automatiques', 'Suivi des consultations', 'Gestion des files d\'attente'],
    mockup: 'appointments',
  },
  {
    title: 'Laboratoire & Pharmacie',
    desc: 'Gestion des demandes d\'analyses, validation des r\u00e9sultats et suivi des stocks de m\u00e9dicaments en temps r\u00e9el.',
    icon: Microscope,
    color: 'from-purple-500 to-purple-600',
    features: ['Validation biologique', 'Alertes de rupture de stock', 'Tra\u00e7abilit\u00e9 des lots', 'Catalogue d\'analyses'],
    mockup: 'lab',
  },
  {
    title: 'Urgences & Hospitalisation',
    desc: 'Triage 5 couleurs, gestion des lits et suivi hospitalier complet pour une prise en charge optimale.',
    icon: Bed,
    color: 'from-rose-500 to-rose-600',
    features: ['Triage 5 couleurs (OMS)', 'Gestion des lits en temps r\u00e9el', 'Suivi des admissions', 'Plan de soins'],
    mockup: 'emergency',
  },
  {
    title: 'Portail Patient',
    desc: 'Un espace d\u00e9di\u00e9 aux patients pour consulter leurs dossiers, prendre rendez-vous et g\u00e9rer les membres de leur famille.',
    icon: Smartphone,
    color: 'from-sky-500 to-sky-600',
    features: ['Compte famille multi-membres', 'Consultation du dossier m\u00e9dical', 'Prise de rendez-vous en ligne', 'Acc\u00e8s aux documents de sant\u00e9'],
    mockup: 'portal',
  },
  {
    title: 'Pr\u00eat \u00e0 transformer votre \u00e9tablissement ?',
    desc: 'Rejoignez les 45+ h\u00f4pitaux guin\u00e9ens qui utilisent d\u00e9j\u00e0 HealthFlow. Essai gratuit, d\u00e9ploiement en 24h.',
    icon: Sparkles,
    color: 'from-teal-600 to-emerald-500',
    features: ['Essai gratuit 30 jours', 'D\u00e9ploiement en 24 heures', 'Formation incluse', 'Support 24/7'],
    mockup: 'cta',
  },
]

function DemoStepMockup({ type }: { type: string }) {
  if (type === 'dashboard') {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Patients', value: '24', color: 'bg-teal-500' },
            { label: 'RDV', value: '18', color: 'bg-emerald-500' },
            { label: 'Lits', value: '42/120', color: 'bg-amber-500' },
            { label: 'Urg.', value: '7', color: 'bg-rose-500' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-1 mb-0.5"><div className={`w-1.5 h-1.5 rounded-full ${kpi.color}`} /><span className="text-[8px] text-slate-400">{kpi.label}</span></div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{kpi.value}</div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
          <div className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Consultations / semaine</div>
          <div className="flex items-end gap-1 h-12">
            {[35, 55, 45, 70, 60, 80, 50].map((h, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.08, duration: 0.5, type: 'spring' as const, bounce: 0.3 }} className="flex-1 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
          <div className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Prochains RDV</div>
          {[
            { name: 'A. Diallo', time: '09:00' },
            { name: 'M. Cond\u00e9', time: '09:30' },
            { name: 'F. Camara', time: '10:00' },
          ].map((apt, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <span className="text-[9px] font-medium text-slate-700 dark:text-slate-200">{apt.name}</span>
              <span className="text-[9px] font-semibold text-teal-600 dark:text-teal-400">{apt.time}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (type === 'patients') {
    return (
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">AD</div>
            <div><div className="text-xs font-semibold text-slate-900 dark:text-white">Aminata Diallo</div><div className="text-[8px] text-slate-400">F &bull; 28 ans &bull; O+</div></div>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">{['P\u00e9nicilline', 'Sulfamides'].map((a) => <span key={a} className="px-1.5 py-0.5 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[7px] font-medium rounded-full">{a}</span>)}</div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded p-1.5"><div className="text-[7px] text-slate-400">Derni\u00e8re visite</div><div className="text-[9px] font-semibold text-slate-700 dark:text-slate-200">10/05/26</div></div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded p-1.5"><div className="text-[7px] text-slate-400">Statut</div><div className="text-[9px] font-semibold text-emerald-600">Actif</div></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
          <div className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Recherche patient</div>
          <div className="h-7 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700 flex items-center px-2"><span className="text-[8px] text-slate-400">Rechercher par nom, ID...</span></div>
        </div>
      </div>
    )
  }
  if (type === 'appointments') {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-0.5">
          {['L', 'Ma', 'Me', 'J', 'V', 'S', 'D'].map((d) => <div key={d} className="text-[7px] text-center text-slate-400 py-0.5">{d}</div>)}
          {Array.from({ length: 35 }).map((_, i) => {
            const day = i - 2
            const hasEvent = [8, 12, 15, 22, 28].includes(day)
            return <div key={i} className={`text-[8px] text-center py-1 rounded ${hasEvent ? 'bg-teal-500 text-white font-bold' : day > 0 && day <= 31 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>{day > 0 && day <= 31 ? day : ''}</div>
          })}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
          <div className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Aujourd&apos;hui</div>
          {[
            { time: '09:00', name: 'A. Diallo', type: 'Consultation' },
            { time: '10:30', name: 'F. Camara', type: 'Suivi' },
            { time: '14:00', name: 'M. Cond\u00e9', type: 'Contr\u00f4le' },
          ].map((apt, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <div className="flex items-center gap-1.5"><span className="text-[9px] font-semibold text-teal-600 dark:text-teal-400">{apt.time}</span><span className="text-[8px] text-slate-600 dark:text-slate-300">{apt.name}</span></div>
              <span className="text-[7px] px-1.5 py-0.5 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-full">{apt.type}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (type === 'lab') {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[{ l: 'En attente', v: '5', c: 'bg-amber-500' }, { l: 'En cours', v: '3', c: 'bg-teal-500' }, { l: 'Valid\u00e9s', v: '12', c: 'bg-emerald-500' }].map((s) => (
            <div key={s.l} className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700 text-center">
              <div className={`w-6 h-6 rounded-full ${s.c} mx-auto mb-1`} /><div className="text-sm font-bold text-slate-900 dark:text-white">{s.v}</div><div className="text-[7px] text-slate-400">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
          <div className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Stock pharmacie</div>
          {[
            { name: 'Parac\u00e9tamol', pct: 85 },
            { name: 'Amoxicilline', pct: 23 },
            { name: 'Quinine', pct: 8 },
          ].map((med, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <span className="text-[8px] text-slate-600 dark:text-slate-300 w-16 truncate">{med.name}</span>
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${med.pct}%` }} transition={{ delay: i * 0.1, duration: 0.5, type: 'spring' as const, bounce: 0.2 }} className={`h-full rounded-full ${med.pct > 50 ? 'bg-emerald-500' : med.pct > 20 ? 'bg-amber-500' : 'bg-rose-500'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (type === 'emergency') {
    return (
      <div className="space-y-3">
        <div className="flex gap-1.5">
          {[{ c: 'Rouge', bg: 'bg-red-500' }, { c: 'Orange', bg: 'bg-orange-500' }, { c: 'Jaune', bg: 'bg-yellow-500' }, { c: 'Vert', bg: 'bg-green-500' }, { c: 'Bleu', bg: 'bg-blue-500' }].map((t) => (
            <div key={t.c} className="flex-1"><div className={`${t.bg} rounded-lg p-1.5 text-center`}><div className="text-[7px] text-white font-bold">{t.c}</div></div></div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
          <div className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Lits disponibles</div>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 12 }).map((_, i) => {
              const occupied = [0, 2, 4, 7, 8].includes(i)
              return <div key={i} className={`h-5 rounded text-[7px] flex items-center justify-center font-medium ${occupied ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600' : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'}`}>{occupied ? '\u25CF' : '\u25CB'}</div>
            })}
          </div>
        </div>
      </div>
    )
  }
  if (type === 'portal') {
    return (
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-[9px] font-bold">AD</div>
            <div><div className="text-[10px] font-semibold text-slate-900 dark:text-white">Aminata Diallo</div><div className="text-[8px] text-slate-400">Compte famille</div></div>
          </div>
          <div className="space-y-1">
            {[
              { name: 'Aminata Diallo', rel: 'Moi' },
              { name: 'A\u00efssatou Bald\u00e9', rel: 'Enfant' },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between py-1 px-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                <span className="text-[8px] font-medium text-slate-700 dark:text-slate-200">{m.name}</span>
                <span className="text-[7px] text-teal-600 dark:text-teal-400">{m.rel}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
          <div className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Prochain rendez-vous</div>
          <div className="flex items-center justify-between">
            <div><div className="text-[9px] font-medium text-slate-700 dark:text-slate-200">Dr. Diallo</div><div className="text-[7px] text-slate-400">Suivi paludisme</div></div>
            <div className="text-right"><div className="text-[9px] font-semibold text-teal-600">10/05</div><div className="text-[7px] text-slate-400">08:00</div></div>
          </div>
        </div>
      </div>
    )
  }
  if (type === 'cta') {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-teal-500/30">
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <div className="text-sm font-bold text-teal-700 dark:text-teal-300">D\u00e9marrer maintenant</div>
        <div className="text-[9px] text-slate-500 dark:text-slate-400">Essai gratuit &bull; Aucune carte requise</div>
      </div>
    )
  }
  // welcome
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-teal-500/30">
        <Heart className="w-10 h-10 text-white" />
      </motion.div>
      <div className="space-y-1">
        <div className="text-sm font-bold text-slate-900 dark:text-white">HealthFlow Guinea</div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400">Syst\u00e8me d&apos;Information Hospitalier</div>
      </div>
    </div>
  )
}

function DemoVideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const { setCurrentView } = useStore()
  const currentStep = demoSteps[step]

  useEffect(() => {
    if (!open || paused) return
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % demoSteps.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [open, paused])

  const goNext = () => setStep((s) => Math.min(s + 1, demoSteps.length - 1))
  const goPrev = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring' as const, bounce: 0.2 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 p-6 md:p-8 flex items-center justify-center min-h-[280px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.95, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    transition={{ duration: 0.4, type: 'spring' as const, bounce: 0.2 }}
                    className="w-full max-w-xs"
                  >
                    <DemoStepMockup type={currentStep.mockup} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-6 md:p-8 flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, type: 'spring' as const, bounce: 0.2 }}
                    className="flex-1"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentStep.color} flex items-center justify-center shadow-lg mb-4`}>
                      <currentStep.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">\u00c9tape {step + 1} / {demoSteps.length}</div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{currentStep.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{currentStep.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {currentStep.features.map((f, i) => (
                        <motion.li key={f} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          </div>
                          {f}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-auto space-y-4">
                  {step === demoSteps.length - 1 ? (
                    <Button onClick={() => { onClose(); setCurrentView('dashboard') }} className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg h-11">
                      Essayer gratuitement <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={goPrev} disabled={step === 0} className="flex-1 h-10">Pr\u00e9c\u00e9dent</Button>
                      <Button onClick={goNext} className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white h-10">
                        {step === demoSteps.length - 2 ? 'Terminer' : 'Suivant'} <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1.5">
                    {demoSteps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setStep(i)}
                        className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-teal-500' : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'}`}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Passer</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─────────── Main Landing Page ─────────── */

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar onDemoClick={() => setDemoOpen(true)} />
      <main>
        <HeroSection onDemoClick={() => setDemoOpen(true)} />
        <TrustedBySection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <PricingSection />
        <DataSpherePortfolioSection />
        <CTASection />
      </main>
      <Footer />
      <DemoVideoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  )
}
